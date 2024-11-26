import { DomainException, ExceptionCause } from '@core/domain/base'
import { Order, OrderCurrentStatus, Product } from '@core/domain/entities'
import { IOrderRepository, IProductRepository } from '@core/domain/repositories'
import {
  CreateOrderInput,
  CreateOrderOutput,
  ICreateOrderUseCase,
} from '../types/order'
import { formatDateWithTimezone } from '@core/application/helpers'

type OrderItem = {
  product: Product
  quantity: number
  observation: string
}

export class CreateOrderUseCase implements ICreateOrderUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute({
    items,
    orderAmount,
    customerId,
  }: CreateOrderInput): Promise<CreateOrderOutput> {
    const orderItems: OrderItem[] = []
    for (const item of items) {
      const product = await this.productRepository.findProductByParam(
        'id',
        item.id,
      )
      if (!product) {
        throw new DomainException(
          `Produto ${item.id} não encontrado`,
          ExceptionCause.NOTFOUND_EXCEPTION,
        )
      }
      orderItems.push({
        product,
        quantity: item.quantity,
        observation: item.observation,
      })
    }
    const products = this.transformOrderItemsToProducts(orderItems)
    const allProductsAmount = products.reduce(
      (total, currentItem) => total + currentItem.getPrice(),
      0,
    )
    if (allProductsAmount !== orderAmount) {
      throw new DomainException(
        'O valor total deve ser válido',
        ExceptionCause.BUSINESS_EXCEPTION,
      )
    }
    const currentDate = formatDateWithTimezone(new Date())
    const order = new Order(
      orderAmount,
      OrderCurrentStatus.PENDENTE,
      products,
      null,
      customerId,
      null,
      currentDate,
      currentDate,
    )
    const orderId = await this.orderRepository.saveOrder(order, customerId)
    for (const item of orderItems) {
      await this.orderRepository.saveOrderProduct({
        orderId,
        productId: item.product.getId(),
        quantity: item.quantity,
        price: item.product.getPrice(),
        observation: item.observation,
        effectiveDate: currentDate,
      })
    }
    // TODO: publicar mensagem no tópico
    const { status, totalAmount } = order.toJson()
    return {
      order: {
        id: orderId,
        status,
        effectiveDate: currentDate,
        totalAmount,
      },
    }
  }

  private transformOrderItemsToProducts(orderItems: OrderItem[]): Product[] {
    const products: Product[] = []
    orderItems.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        products.push(item.product)
      }
    })
    return products
  }
}
