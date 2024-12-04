import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction as ExpressNextFuction,
} from 'express'
import { HttpMethod, IRouteProps } from './types/http-server'

export const healthRoutes: IRouteProps[] = [
  {
    resource: '/health',
    method: HttpMethod.GET,
    middleware: (
      _request: ExpressRequest,
      _response: ExpressResponse,
      next: ExpressNextFuction,
    ) => next(),
    handler: 'check',
  },
]

export const productRoutes: IRouteProps[] = [
  {
    resource: '/produtos',
    method: HttpMethod.POST,
    middleware: (
      _request: ExpressRequest,
      _response: ExpressResponse,
      next: ExpressNextFuction,
    ) => next(),
    handler: 'createProduct',
  },
  {
    resource: '/produtos/:id',
    method: HttpMethod.PUT,
    middleware: (
      _request: ExpressRequest,
      _response: ExpressResponse,
      next: ExpressNextFuction,
    ) => next(),
    handler: 'updateProduct',
  },
  {
    resource: '/produtos',
    method: HttpMethod.GET,
    middleware: (
      _request: ExpressRequest,
      _response: ExpressResponse,
      next: ExpressNextFuction,
    ) => next(),
    handler: 'searchProducts',
  },
  {
    resource: '/produtos/:id',
    method: HttpMethod.DELETE,
    middleware: (
      _request: ExpressRequest,
      _response: ExpressResponse,
      next: ExpressNextFuction,
    ) => next(),
    handler: 'removeProduct',
  },
]

export const orderRoutes: IRouteProps[] = [
  {
    resource: '/pedidos',
    method: HttpMethod.POST,
    middleware: (
      _request: ExpressRequest,
      _response: ExpressResponse,
      next: ExpressNextFuction,
    ) => next(),
    handler: 'createOrder',
  },
  {
    resource: '/pedidos',
    method: HttpMethod.GET,
    middleware: (
      _request: ExpressRequest,
      _response: ExpressResponse,
      next: ExpressNextFuction,
    ) => next(),
    handler: 'searchOrders',
  },
  {
    resource: '/pedidos/:id/status',
    method: HttpMethod.PUT,
    middleware: (
      _request: ExpressRequest,
      _response: ExpressResponse,
      next: ExpressNextFuction,
    ) => next(),
    handler: 'updateOrderStatus',
  },
]
