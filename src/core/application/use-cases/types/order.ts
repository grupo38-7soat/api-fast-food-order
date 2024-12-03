import { OrderCurrentStatus, Payment } from '@core/domain/entities'

type Item = {
  id: number
  quantity: number
  observation?: string
}

export type CreateOrderInput = {
  customerId?: string
  items: Item[]
  orderAmount: number
}

export type CreateOrderOutput = {
  order: {
    id: number
    status: OrderCurrentStatus
    effectiveDate: string
    totalAmount: number
  }
}

export type SearchOrdersInput = {
  id?: number
  status?: OrderCurrentStatus
}

export type SearchOrdersOutput = {
  id: number
  status: OrderCurrentStatus
  effectiveDate: string
  updatedAt: string
  totalAmount: number
  payment: Payment
  customerId: string
  waitingTime: number
}

export type UpdateOrderStatusInput = {
  orderId: number
  status: OrderCurrentStatus
  payment?: Payment
}

export type UpdateOrderStatusOutput = {
  previousStatus: OrderCurrentStatus
  currentStatus: OrderCurrentStatus
  updatedAt: string
}

export interface ICreateOrderUseCase {
  execute(input: CreateOrderInput): Promise<CreateOrderOutput>
}

export interface ISearchOrdersUseCase {
  execute(input: SearchOrdersInput): Promise<SearchOrdersOutput[]>
}

export interface IUpdateOrderStatusUseCase {
  execute(input: UpdateOrderStatusInput): Promise<UpdateOrderStatusOutput>
}
