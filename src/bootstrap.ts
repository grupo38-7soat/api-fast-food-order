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
import { IAMQPServer } from '@adapter/driver/message-broker/types/message-broker'
import { AMQPServerAdapter } from '@adapter/driver/message-broker/amqp-server.adapter'
import { MessageBrokerAdapter } from '@adapter/driver/message-broker/message-broker.adapter'

const postgresConnectionAdapter = new PostgresConnectionAdapter()
const messageBrokerAdapter = new MessageBrokerAdapter(
  globalEnvs.messageBroker.url,
)
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
  messageBrokerAdapter,
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
const amqpServer: IAMQPServer = new AMQPServerAdapter(
  messageBrokerAdapter,
  updateOrderStatusUseCase,
)
amqpServer.run(globalEnvs.messageBroker.orderQueue)
const httpServer: IHttpServer = new ExpressHttpServerAdapter(
  healthController,
  productController,
  orderController,
)
httpServer.run(globalEnvs.api.serverPort)
