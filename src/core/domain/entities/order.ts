import { DomainException, ExceptionCause } from '../base'
import { OrderStatus, OrderStatusFactory } from '../value-objects'
import { Product, SerializedProduct } from './product'

export enum OrderCurrentStatus {
  PENDENTE = 'PENDENTE',
  RECEBIDO = 'RECEBIDO',
  EM_PREPARO = 'EM_PREPARO',
  PRONTO = 'PRONTO',
  FINALIZADO = 'FINALIZADO',
  CANCELADO = 'CANCELADO',
}

export type Payment = {
  id: string
  type: string
  paymentStatus: string
  effectiveDate: string
  updatedAt: string
  externalId: string
}

export type SerializedOrder = {
  id: number
  effectiveDate: string
  totalAmount: number
  status: OrderCurrentStatus
  items: SerializedProduct[]
  updatedAt?: string
  customerId?: string
  payment?: Payment
}

export class Order {
  private id: number
  private totalAmount: number
  private status: OrderStatus
  private items: Product[]
  private createdAt: string
  private updatedAt: string
  private customerId?: string
  private payment?: Payment

  constructor(
    totalAmount: number,
    status: OrderCurrentStatus,
    products: Product[],
    payment?: Payment,
    customerId?: string,
    id?: number,
    createdAt?: string,
    updatedAt?: string,
  ) {
    this.status = OrderStatusFactory.create(this, status)
    this.setId(id)
    this.setProducts(products)
    this.setTotalAmount(totalAmount)
    this.setPayment(payment)
    this.setCustomerId(customerId)
    this.setCreatedAt(createdAt)
    this.setUpdatedAt(updatedAt)
  }

  private setId(id: number): void {
    if (id) {
      this.id = id
    }
  }

  public getId(): number {
    return this.id
  }

  private setTotalAmount(value: number): void {
    if (value < 0) {
      throw new DomainException(
        'O valor total não pode ser menor que 0',
        ExceptionCause.BUSINESS_EXCEPTION,
      )
    }
    this.totalAmount = value
  }

  public getTotalAmount(): number {
    return this.totalAmount
  }

  public setStatus(status: OrderStatus): void {
    this.status = status
  }

  public getStatus(): OrderCurrentStatus {
    return this.status.value
  }

  private setCustomerId(value: string): void {
    if (value) {
      this.customerId = value
    }
  }

  public getCustomerId(): string {
    return this.customerId
  }

  private setProducts(items: Product[]): void {
    this.items = items
  }

  public getItems(): Product[] {
    return this.items
  }

  private setPayment(value: Payment): void {
    if (value) {
      this.payment = value
    }
  }

  public getPayment(): Payment {
    return this.payment
  }

  private setCreatedAt(value: string): void {
    if (value) {
      this.createdAt = value
    }
  }

  public getCreatedAt(): string {
    return this.createdAt
  }

  private setUpdatedAt(value: string): void {
    if (value) {
      this.updatedAt = value
    }
  }

  public getUpdatedAt(): string {
    return this.updatedAt
  }

  public receiveOrder(): void {
    this.status.receive()
  }

  public initOrder(): void {
    this.status.init()
  }

  public cancelOrder(): void {
    this.status.cancel()
  }

  public doneOrder(): void {
    this.status.ready()
  }

  public finishOrder(): void {
    this.status.finish()
  }

  public toJson(): SerializedOrder {
    return {
      id: this.id,
      effectiveDate: this.createdAt,
      totalAmount: this.totalAmount,
      status: this.getStatus(),
      customerId: this.customerId,
      items: [],
      payment: this.payment,
      updatedAt: this.updatedAt,
    }
  }
}
