import { SearchOrdersUseCase } from '@core/application/use-cases'
import { IOrderRepository } from '@core/domain/repositories'
import { getMinutesInterval } from '@core/application/helpers'
import { DomainException, ExceptionCause } from '@core/domain/base'
import { Order, OrderCurrentStatus } from '@core/domain/entities'

jest.mock('@core/application/helpers', () => ({
  getMinutesInterval: jest.fn(),
  formatDateWithTimezone: jest.fn((date: Date) => date.toISOString()),
}))

describe('SearchOrdersUseCase', () => {
  let orderRepositoryMock: jest.Mocked<IOrderRepository>
  let sut: SearchOrdersUseCase

  beforeAll(() => {
    orderRepositoryMock = {
      findAllOrders: jest.fn(),
    } as unknown as jest.Mocked<IOrderRepository>
    sut = new SearchOrdersUseCase(orderRepositoryMock)
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

  describe('execute method', () => {
    it('should return formatted orders grouped by status', async () => {
      const mockOrders = [
        new Order(
          100,
          OrderCurrentStatus.PRONTO,
          [],
          null,
          'customer-1',
          null,
          '2024-12-01T00:00:00Z',
          '2024-12-01T01:00:00Z',
        ),
        new Order(
          200,
          OrderCurrentStatus.EM_PREPARO,
          [],
          null,
          'customer-2',
          null,
          '2024-12-01T00:30:00Z',
          '2024-12-01T01:30:00Z',
        ),
        new Order(
          300,
          OrderCurrentStatus.RECEBIDO,
          [],
          null,
          'customer-3',
          null,
          '2024-12-01T01:00:00Z',
          '2024-12-01T02:00:00Z',
        ),
      ]
      orderRepositoryMock.findAllOrders.mockResolvedValue(mockOrders)
      ;(getMinutesInterval as jest.Mock).mockReturnValue(10)

      const result = await sut.execute({})

      expect(orderRepositoryMock.findAllOrders).toHaveBeenCalledWith({})
      expect(result).toEqual([
        {
          id: mockOrders[0].getId(),
          status: mockOrders[0].getStatus(),
          effectiveDate: '2024-12-01T00:00:00.000Z',
          totalAmount: mockOrders[0].getTotalAmount(),
          payment: mockOrders[0].getPayment(),
          customerId: mockOrders[0].getCustomerId(),
          updatedAt: '2024-12-01T01:00:00.000Z',
          waitingTime: 10,
        },
        {
          id: mockOrders[1].getId(),
          status: mockOrders[1].getStatus(),
          effectiveDate: '2024-12-01T00:30:00.000Z',
          totalAmount: mockOrders[1].getTotalAmount(),
          payment: mockOrders[1].getPayment(),
          customerId: mockOrders[1].getCustomerId(),
          updatedAt: '2024-12-01T01:30:00.000Z',
          waitingTime: 10,
        },
        {
          id: mockOrders[2].getId(),
          status: mockOrders[2].getStatus(),
          effectiveDate: '2024-12-01T01:00:00.000Z',
          totalAmount: mockOrders[2].getTotalAmount(),
          payment: mockOrders[2].getPayment(),
          customerId: mockOrders[2].getCustomerId(),
          updatedAt: '2024-12-01T02:00:00.000Z',
          waitingTime: 10,
        },
      ])
    })

    it('should throw an exception if an invalid status is provided', async () => {
      await expect(
        sut.execute({ status: 'INVALID_STATUS' as OrderCurrentStatus }),
      ).rejects.toThrow(
        new DomainException(
          'O status deve ser válido',
          ExceptionCause.INVALID_DATA,
        ),
      )
    })

    it('should call findAllOrders with correct params when id is provided', async () => {
      orderRepositoryMock.findAllOrders.mockResolvedValue([])

      await sut.execute({ id: 1 })

      expect(orderRepositoryMock.findAllOrders).toHaveBeenCalledWith({
        id: { exactMatch: true, value: 1 },
      })
    })

    it('should call findAllOrders with correct params when status is provided', async () => {
      orderRepositoryMock.findAllOrders.mockResolvedValue([])

      await sut.execute({ status: OrderCurrentStatus.PRONTO })

      expect(orderRepositoryMock.findAllOrders).toHaveBeenCalledWith({
        status: { exactMatch: true, value: OrderCurrentStatus.PRONTO },
      })
    })

    it('should group orders correctly based on status', async () => {
      const mockOrders = [
        new Order(
          100,
          OrderCurrentStatus.PRONTO,
          [],
          null,
          'customer-1',
          null,
          '2024-12-01T00:00:00Z',
          '2024-12-01T01:00:00Z',
        ),
        new Order(
          200,
          OrderCurrentStatus.EM_PREPARO,
          [],
          null,
          'customer-2',
          null,
          '2024-12-01T00:30:00Z',
          '2024-12-01T01:30:00Z',
        ),
        new Order(
          300,
          OrderCurrentStatus.RECEBIDO,
          [],
          null,
          'customer-3',
          null,
          '2024-12-01T01:00:00Z',
          '2024-12-01T02:00:00Z',
        ),
      ]
      orderRepositoryMock.findAllOrders.mockResolvedValue(mockOrders)

      const result = await sut.execute({})

      expect(result.map(order => order.status)).toEqual([
        OrderCurrentStatus.PRONTO,
        OrderCurrentStatus.EM_PREPARO,
        OrderCurrentStatus.RECEBIDO,
      ])
    })

    it('should return an empty array if no orders are found', async () => {
      orderRepositoryMock.findAllOrders.mockResolvedValue([])

      const result = await sut.execute({})

      expect(result).toEqual([])
    })
  })
})
