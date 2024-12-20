import express, { Express, Router } from 'express'
import swaggerUI from 'swagger-ui-express'
import swaggerDocument from './config/swagger/swagger.json'
import { IHttpServer } from './types/http-server'
import {
  IProductController,
  IOrderController,
  IHealthController,
} from './controllers/types/controllers'
import { productRoutes, orderRoutes, healthRoutes } from './routes'

export class ExpressHttpServerAdapter implements IHttpServer {
  app: Express
  router: Router

  constructor(
    private readonly healthController: IHealthController,
    private readonly productController: IProductController,
    private readonly orderController: IOrderController,
  ) {
    this.app = express()
    this.app.use(express.json())
    this.router = express.Router()
    this.configRoutes()
    this.configDocumentation()
  }

  private configRoutes(): void {
    this.configHealthRoutes()
    this.configProductRoutes()
    this.configOrderRoutes()
    this.app.use(this.router)
  }

  private configHealthRoutes(): void {
    healthRoutes.forEach(route => {
      console.log(
        `[HttpServer] Rota ${route.method.toUpperCase()} ${route.resource}`,
      )
      this.router[route.method](
        route.resource,
        route.middleware,
        this.healthController[route.handler].bind(this.healthController),
      )
    })
  }

  private configProductRoutes(): void {
    productRoutes.forEach(route => {
      console.log(
        `[HttpServer] Rota ${route.method.toUpperCase()} ${route.resource}`,
      )
      this.router[route.method](
        route.resource,
        route.middleware,
        this.productController[route.handler].bind(this.productController),
      )
    })
  }

  private configOrderRoutes(): void {
    orderRoutes.forEach(route => {
      console.log(
        `[HttpServer] Rota ${route.method.toUpperCase()} ${route.resource}`,
      )
      this.router[route.method](
        route.resource,
        route.middleware,
        this.orderController[route.handler].bind(this.orderController),
      )
    })
  }

  private configDocumentation(): void {
    this.app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))
  }

  run(port: number): void {
    this.app.listen(port, () => {
      console.log(`[HttpServer] Servidor rodando na porta ${port}`)
    })
  }
}
