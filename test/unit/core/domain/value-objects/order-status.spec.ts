import { Order, OrderCurrentStatus } from '@core/domain/entities'
import { OrderStatusFactory } from '@core/domain/value-objects'

describe('OrderStatus', () => {
  let mockOrder: Order

  beforeEach(() => {
    mockOrder = {
      setStatus: jest.fn(),
      getStatus: jest.fn(),
    } as unknown as Order
  })

  describe('PendingOrderStatus class', () => {
    it('should transition to ReceivedOrderStatus on receive', () => {
      const status = OrderStatusFactory.create(
        mockOrder,
        OrderCurrentStatus.PENDENTE,
      )
      status.receive()
      expect(mockOrder.setStatus).toHaveBeenCalledWith(expect.anything())
    })

    it('should transition to CancelledOrderStatus on cancel', () => {
      const status = OrderStatusFactory.create(
        mockOrder,
        OrderCurrentStatus.PENDENTE,
      )
      status.cancel()
    })
  })

  describe('ReceivedOrderStatus class', () => {
    it('should transition to InProgressOrderStatus on receive', () => {
      const status = OrderStatusFactory.create(
        mockOrder,
        OrderCurrentStatus.RECEBIDO,
      )
      status.init()
      expect(mockOrder.setStatus).toHaveBeenCalledWith(expect.anything())
    })

    it('should transition to CancelledOrderStatus on cancel', () => {
      const status = OrderStatusFactory.create(
        mockOrder,
        OrderCurrentStatus.PENDENTE,
      )
      status.cancel()
    })
  })

  describe('InProgressOrderStatus class', () => {
    it('should transition to ReadyOrderStatus on receive', () => {
      const status = OrderStatusFactory.create(
        mockOrder,
        OrderCurrentStatus.EM_PREPARO,
      )
      status.ready()
      expect(mockOrder.setStatus).toHaveBeenCalledWith(expect.anything())
    })

    it('should transition to CancelledOrderStatus on cancel', () => {
      const status = OrderStatusFactory.create(
        mockOrder,
        OrderCurrentStatus.EM_PREPARO,
      )
      status.cancel()
    })
  })

  describe('ReadyOrderStatus class', () => {
    it('should transition to FinishedOrderStatus on receive', () => {
      const status = OrderStatusFactory.create(
        mockOrder,
        OrderCurrentStatus.PRONTO,
      )
      status.finish()
      expect(mockOrder.setStatus).toHaveBeenCalledWith(expect.anything())
    })
  })
})
