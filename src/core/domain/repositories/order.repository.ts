import { Order, OrderCurrentStatus, Payment } from '../entities'

export type OrderParams = {
  [field: string]: {
    exactMatch: boolean
    value: unknown
  }
}

export type OrderProduct = {
  orderId: number
  productId: number
  quantity: number
  price: number
  observation?: string
  effectiveDate: string
}

export interface IOrderRepository {
  saveOrder(order: Order, customerId: string): Promise<number>
  saveOrderProduct(orderProduct: OrderProduct): Promise<void>
  updateOrderStatus(
    orderId: number,
    status: OrderCurrentStatus,
    updatedAt: string,
    payment?: Payment,
  ): Promise<Order>
  findAllOrders(params?: OrderParams): Promise<Order[]>
  findOrderById(orderId: number): Promise<Order>
}
