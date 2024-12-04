import { PostgresConnectionAdapter } from '@adapter/driven/database/postgres-connection.adapter'
import { OrderRepository } from '@adapter/driven/database/repositories'
import { DomainException } from '@core/domain/base'
import { Order, OrderCurrentStatus } from '@core/domain/entities'
import { QueryResult } from 'pg'

jest.mock('@adapter/driven/database/postgres-connection.adapter')

describe('OrderRepository', () => {
  let postgresConnectionAdapter: jest.Mocked<PostgresConnectionAdapter>
  let sut: OrderRepository

  beforeAll(() => {
    postgresConnectionAdapter =
      new PostgresConnectionAdapter() as jest.Mocked<PostgresConnectionAdapter>
    sut = new OrderRepository(postgresConnectionAdapter)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('saveOrder method', () => {
    it('should save a new order and return the generated ID', async () => {
      const order = new Order(1, OrderCurrentStatus.PENDENTE, [], null)
      postgresConnectionAdapter.query.mockResolvedValueOnce({
        rows: [{ id: 1 }],
      } as QueryResult)
      const id = await sut.saveOrder(order, '')
      expect(id).toBe(1)
      expect(postgresConnectionAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO'),
        expect.arrayContaining([
          order.getTotalAmount(),
          order.getStatus(),
          null,
          '',
          order.getCreatedAt(),
          order.getUpdatedAt(),
        ]),
      )
    })

    it('should throws if saving fails', async () => {
      const order = new Order(1, OrderCurrentStatus.PENDENTE, [], null)
      postgresConnectionAdapter.query.mockRejectedValueOnce(
        new Error('Database error'),
      )
      await expect(sut.saveOrder(order, '')).rejects.toThrow(DomainException)
    })
  })

  describe('saveOrderProduct method', () => {
    const orderProduct = {
      orderId: 1,
      productId: 1,
      quantity: 1,
      price: 1,
      observation: '',
      effectiveDate: '',
    }

    it('should save a new order_product and return the generated ID', async () => {
      postgresConnectionAdapter.query.mockResolvedValueOnce({
        rows: [{ id: 1 }],
      } as QueryResult)
      await sut.saveOrderProduct(orderProduct)
      expect(postgresConnectionAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO'),
        expect.arrayContaining([
          orderProduct.orderId,
          orderProduct.productId,
          orderProduct.quantity,
          orderProduct.price,
          orderProduct.observation,
          orderProduct.effectiveDate,
          orderProduct.effectiveDate,
        ]),
      )
    })

    it('should throws if saving fails', async () => {
      postgresConnectionAdapter.query.mockRejectedValueOnce(
        new Error('Database error'),
      )
      await expect(sut.saveOrderProduct(orderProduct)).rejects.toThrow(
        DomainException,
      )
    })
  })

  describe('updateOrderStatus method', () => {
    const updateData = {
      orderId: 1,
      status: OrderCurrentStatus.RECEBIDO,
      updatedAt: new Date().toISOString(),
      payment: null,
    }

    it('should save a new order_product and return the generated ID', async () => {
      postgresConnectionAdapter.query.mockResolvedValueOnce({
        rows: [{ id: 1 }],
      } as QueryResult)
      await sut.updateOrderStatus(
        updateData.orderId,
        updateData.status,
        updateData.updatedAt,
        updateData.payment,
      )
      expect(postgresConnectionAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE'),
        expect.arrayContaining([
          updateData.status,
          updateData.orderId,
          updateData.updatedAt,
          updateData.payment,
        ]),
      )
    })

    it('should throws if updating fails', async () => {
      postgresConnectionAdapter.query.mockRejectedValueOnce(
        new Error('Database error'),
      )
      await expect(
        sut.updateOrderStatus(
          updateData.orderId,
          updateData.status,
          updateData.updatedAt,
          updateData.payment,
        ),
      ).rejects.toThrow(DomainException)
    })
  })

  describe('findAllOrders method', () => {
    const mockOrdersData = [
      {
        id: 1,
        total_amount: 1,
        status: OrderCurrentStatus.RECEBIDO,
        payment: null,
        customer_id: 'some_id',
        effective_date: new Date().toISOString(),
        updated_at: '2023-01-02',
      },
    ]

    it('should return all orders if no parameters are provided', async () => {
      postgresConnectionAdapter.query.mockResolvedValueOnce({
        rows: mockOrdersData,
      } as QueryResult)

      const orders = await sut.findAllOrders()
      expect(orders).toHaveLength(1)
      expect(orders[0].getId()).toBe(mockOrdersData[0].id)
      expect(postgresConnectionAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [],
      )
    })

    it('should return orders filtered by parameters', async () => {
      postgresConnectionAdapter.query.mockResolvedValueOnce({
        rows: mockOrdersData,
      } as QueryResult)
      const orders = await sut.findAllOrders({
        status: { value: OrderCurrentStatus.RECEBIDO, exactMatch: true },
      })
      expect(orders).toHaveLength(1)
      expect(postgresConnectionAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE'),
        expect.arrayContaining(['RECEBIDO']),
      )
    })

    it('should throws if the query fails', async () => {
      postgresConnectionAdapter.query.mockRejectedValueOnce(
        new Error('Database error'),
      )
      await expect(sut.findAllOrders()).rejects.toThrow(DomainException)
    })
  })

  describe('findOrderById method', () => {
    const mockOrdersData = [
      {
        id: 1,
        total_amount: 1,
        status: OrderCurrentStatus.RECEBIDO,
        payment: null,
        customer_id: 'some_id',
        effective_date: new Date().toISOString(),
        updated_at: '2023-01-02',
      },
    ]

    it('should find a order by id', async () => {
      postgresConnectionAdapter.query.mockResolvedValueOnce({
        rows: mockOrdersData,
      } as QueryResult)
      const order = await sut.findOrderById(1)
      expect(order.getId()).toBe(mockOrdersData[0].id)
      expect(postgresConnectionAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [1],
      )
    })

    it('should return null if no order is found', async () => {
      postgresConnectionAdapter.query.mockResolvedValueOnce({
        rows: [],
      } as QueryResult)
      const order = await sut.findOrderById(1)
      expect(order).toBeNull()
    })

    it('should throws if the query fails', async () => {
      postgresConnectionAdapter.query.mockRejectedValueOnce(
        new Error('Database error'),
      )
      await expect(sut.findOrderById(1)).rejects.toThrow(DomainException)
    })
  })
})
