import { Request as ExpressRequest, Response as ExpressResponse } from 'express'

export interface IHealthController {
  check(
    request: ExpressRequest,
    response: ExpressResponse,
  ): Promise<ExpressResponse>
}

export interface IProductController {
  createProduct(
    request: ExpressRequest,
    response: ExpressResponse,
  ): Promise<ExpressResponse>
  updateProduct(
    request: ExpressRequest,
    response: ExpressResponse,
  ): Promise<ExpressResponse>
  searchProducts(
    request: ExpressRequest,
    response: ExpressResponse,
  ): Promise<ExpressResponse>
  removeProduct(
    request: ExpressRequest,
    response: ExpressResponse,
  ): Promise<ExpressResponse>
}

export interface IOrderController {
  createOrder(
    request: ExpressRequest,
    response: ExpressResponse,
  ): Promise<ExpressResponse>
  searchOrders(
    request: ExpressRequest,
    response: ExpressResponse,
  ): Promise<ExpressResponse>
  updateOrderStatus(
    request: ExpressRequest,
    response: ExpressResponse,
  ): Promise<ExpressResponse>
}
