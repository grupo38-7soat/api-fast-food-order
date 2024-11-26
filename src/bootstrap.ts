import { globalEnvs } from '@config/envs/global'
import {
  CreateOrderUseCase,
  CreateProductUseCase,
  RemoveProductUseCase,
  SearchOrdersUseCase,
  SearchProductsUseCase,
  UpdateOrderStatusUseCase,
  UpdateProductUseCase,
} from '@core/application/use-cases'
import {
  HealthController,
  OrderController,
  ProductController,
} from '@adapter/driver/api/controllers'
import { ExpressHttpServerAdapter } from '@adapter/driver/api/express-server.adapter'
import { IHttpServer } from '@adapter/driver/api/types/http-server'
import { PostgresConnectionAdapter } from '@adapter/driven/database/postgres-connection.adapter'
import { ProductRepository } from '@adapter/driven/database/repositories/product.repository'
import { OrderRepository } from '@adapter/driven/database/repositories/order.repository'

const postgresConnectionAdapter = new PostgresConnectionAdapter()
// repositories
const productRepository = new ProductRepository(postgresConnectionAdapter)
const orderRepository = new OrderRepository(postgresConnectionAdapter)
// useCases
const createProductUseCase = new CreateProductUseCase(productRepository)
const updateProductUseCase = new UpdateProductUseCase(productRepository)
const searchProductsUseCase = new SearchProductsUseCase(productRepository)
const removeProductUseCase = new RemoveProductUseCase(productRepository)
const createOrderUseCase = new CreateOrderUseCase(
  productRepository,
  orderRepository,
)
const searchOrdersUseCase = new SearchOrdersUseCase(orderRepository)
const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(orderRepository)
// controllers
const healthController = new HealthController()
const productController = new ProductController(
  createProductUseCase,
  updateProductUseCase,
  searchProductsUseCase,
  removeProductUseCase,
)
const orderController = new OrderController(
  createOrderUseCase,
  searchOrdersUseCase,
  updateOrderStatusUseCase,
)
const server: IHttpServer = new ExpressHttpServerAdapter(
  healthController,
  productController,
  orderController,
)
server.run(globalEnvs.api.serverPort)
