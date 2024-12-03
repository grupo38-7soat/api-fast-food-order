import { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import {
  ICreateOrderUseCase,
  ISearchOrdersUseCase,
  IUpdateOrderStatusUseCase,
} from '@core/application/use-cases'
import { OrderCurrentStatus } from '@core/domain/entities'
import { IOrderController } from './types/controllers'
import { HttpResponseHelper } from '../helpers'
import { HttpStatus } from '../types/http-server'

export class OrderController implements IOrderController {
  constructor(
    private readonly createOrderUseCase: ICreateOrderUseCase,
    private readonly searchOrdersUseCase: ISearchOrdersUseCase,
    private readonly updateOrderStatusUseCase: IUpdateOrderStatusUseCase,
  ) {}

  async createOrder(
    request: ExpressRequest,
    response: ExpressResponse,
  ): Promise<ExpressResponse> {
    try {
      const orderData = await this.createOrderUseCase.execute({
        customerId: request.body.customerId,
        items: request.body.items,
        orderAmount: request.body.orderAmount,
      })
      return HttpResponseHelper.onSucess(response, {
        data: orderData,
        statusCode: HttpStatus.CREATED,
      })
    } catch (error) {
      return HttpResponseHelper.onError(response, { error })
    }
  }

  async searchOrders(
    request: ExpressRequest,
    response: ExpressResponse,
  ): Promise<ExpressResponse> {
    try {
      const orderData = await this.searchOrdersUseCase.execute({
        id: request.query.id ? Number(request.query.id) : undefined,
        status: request.query.status as OrderCurrentStatus,
      })
      return HttpResponseHelper.onSucess(response, { data: orderData })
    } catch (error) {
      return HttpResponseHelper.onError(response, { error })
    }
  }

  async updateOrderStatus(
    request: ExpressRequest,
    response: ExpressResponse,
  ): Promise<ExpressResponse> {
    try {
      const orderId = request.params.id
      const status = request.body?.status || ''
      const updatedOrderData = await this.updateOrderStatusUseCase.execute({
        orderId: Number(orderId),
        status,
      })
      return HttpResponseHelper.onSucess(response, { data: updatedOrderData })
    } catch (error) {
      return HttpResponseHelper.onError(response, { error })
    }
  }
}
