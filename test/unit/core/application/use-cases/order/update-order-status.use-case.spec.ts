import { UpdateOrderStatusUseCase } from '@core/application/use-cases'
import { DomainException, ExceptionCause } from '@core/domain/base'
import { Order, OrderCurrentStatus } from '@core/domain/entities'
import { IOrderRepository } from '@core/domain/repositories'

jest.mock('@core/application/helpers', () => ({
  formatDateWithTimezone: jest.fn().mockReturnValue('2024-12-01T02:00:00.000Z'),
}))

describe('UpdateOrderStatusUseCase', () => {
  let orderRepositoryMock: jest.Mocked<IOrderRepository>
  let sut: UpdateOrderStatusUseCase

  beforeAll(() => {
    orderRepositoryMock = {
      findOrderById: jest.fn(),
      updateOrderStatus: jest.fn(),
    } as unknown as jest.Mocked<IOrderRepository>
    sut = new UpdateOrderStatusUseCase(orderRepositoryMock)
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
    it('should update the status of an order and return the result', async () => {
      const mockOrder = new Order(
        100,
        OrderCurrentStatus.RECEBIDO,
        [],
        null,
        'customer-1',
        null,
        '2024-12-01T00:00:00Z',
        '2024-12-01T01:00:00Z',
      )

      orderRepositoryMock.findOrderById.mockResolvedValue(mockOrder)
      orderRepositoryMock.updateOrderStatus.mockResolvedValue(
        new Order(
          100,
          OrderCurrentStatus.EM_PREPARO,
          [],
          null,
          'customer-1',
          null,
          '2024-12-01T00:00:00Z',
          '2024-12-01T01:00:00Z',
        ),
      )

      const result = await sut.execute({
        orderId: 1,
        status: OrderCurrentStatus.EM_PREPARO,
        payment: null,
      })

      expect(orderRepositoryMock.findOrderById).toHaveBeenCalledWith(1)
      expect(orderRepositoryMock.updateOrderStatus).toHaveBeenCalledWith(
        1,
        OrderCurrentStatus.EM_PREPARO,
        '2024-12-01T02:00:00.000Z',
        null,
      )
      expect(result).toEqual({
        previousStatus: OrderCurrentStatus.RECEBIDO,
        currentStatus: OrderCurrentStatus.EM_PREPARO,
        updatedAt: '2024-12-01T02:00:00.000Z',
      })
    })

    it('should throw an exception if orderId or status is missing', async () => {
      await expect(
        sut.execute({ orderId: 0, status: null, payment: null }),
      ).rejects.toThrow(
        new DomainException(
          'Os parâmetros obrigatórios devem ser informados',
          ExceptionCause.MISSING_DATA,
        ),
      )
    })

    it('should throw an exception if status is invalid', async () => {
      await expect(
        sut.execute({
          orderId: 1,
          status: 'INVALID_STATUS' as OrderCurrentStatus,
          payment: null,
        }),
      ).rejects.toThrow(
        new DomainException(
          'O status deve ser válido',
          ExceptionCause.INVALID_DATA,
        ),
      )
    })

    it('should throw an exception if the order does not exist', async () => {
      orderRepositoryMock.findOrderById.mockResolvedValue(null)

      await expect(
        sut.execute({
          orderId: 1,
          status: OrderCurrentStatus.EM_PREPARO,
          payment: null,
        }),
      ).rejects.toThrow(
        new DomainException(
          'O pedido informado não existe',
          ExceptionCause.NOTFOUND_EXCEPTION,
        ),
      )
    })

    it('should throw an exception if updating the status fails', async () => {
      const mockOrder = new Order(
        100,
        OrderCurrentStatus.RECEBIDO,
        [],
        null,
        'customer-1',
        null,
        '2024-12-01T00:00:00Z',
        '2024-12-01T01:00:00Z',
      )

      orderRepositoryMock.findOrderById.mockResolvedValue(mockOrder)
      orderRepositoryMock.updateOrderStatus.mockResolvedValue(null)

      await expect(
        sut.execute({
          orderId: 1,
          status: OrderCurrentStatus.EM_PREPARO,
          payment: null,
        }),
      ).rejects.toThrow(
        new DomainException(
          'Erro ao atualizar o status do pedido',
          ExceptionCause.INVALID_DATA,
        ),
      )
    })

    it('should correctly call the update function based on status', async () => {
      const mockOrder = {
        getStatus: jest.fn().mockReturnValue(OrderCurrentStatus.RECEBIDO),
        receiveOrder: jest.fn(),
        initOrder: jest.fn(),
        cancelOrder: jest.fn(),
        doneOrder: jest.fn(),
        finishOrder: jest.fn(),
      }

      orderRepositoryMock.findOrderById.mockResolvedValue(
        mockOrder as unknown as Order,
      )
      orderRepositoryMock.updateOrderStatus.mockResolvedValue(
        new Order(
          100,
          OrderCurrentStatus.EM_PREPARO,
          [],
          null,
          'customer-1',
          null,
          '2024-12-01T00:00:00Z',
          '2024-12-01T01:00:00Z',
        ),
      )

      await sut.execute({
        orderId: 1,
        status: OrderCurrentStatus.EM_PREPARO,
        payment: null,
      })

      expect(mockOrder.initOrder).toHaveBeenCalled()
    })
  })
})
