import { Order, OrderCurrentStatus, Payment } from '@core/domain/entities'
import {
  IOrderRepository,
  OrderParams,
  OrderProduct,
} from '@core/domain/repositories'
import { DomainException, ExceptionCause } from '@core/domain/base'
import { PostgresConnectionAdapter } from '../postgres-connection.adapter'

type OrderData = {
  id: number
  total_amount: number
  status: OrderCurrentStatus
  payment: Payment
  customer_id: string
  effective_date: string
  updated_at: string
}

export class OrderRepository implements IOrderRepository {
  table: string

  constructor(
    private readonly postgresConnectionAdapter: PostgresConnectionAdapter,
  ) {
    this.table = 'fast_food.order'
  }

  async saveOrder(order: Order, customerId: string): Promise<number> {
    try {
      const result = await this.postgresConnectionAdapter.query<{ id: number }>(
        `
          INSERT INTO ${this.table}(total_amount, status, payment, customer_id, created_at, updated_at)
          VALUES($1::numeric, $2::fast_food.order_status_enum, $3::jsonb, $4::uuid, $5::timestamp, $6::timestamp)
          RETURNING id
        `,
        [
          order.getTotalAmount(),
          order.getStatus(),
          null,
          customerId,
          order.getCreatedAt(),
          order.getUpdatedAt(),
        ],
      )
      return Number(result.rows[0]?.id)
    } catch (error) {
      console.error(error)
      throw new DomainException(
        'Erro ao criar pedido',
        ExceptionCause.PERSISTANCE_EXCEPTION,
      )
    }
  }

  async saveOrderProduct({
    orderId,
    productId,
    quantity,
    price,
    observation,
    effectiveDate,
  }: OrderProduct): Promise<void> {
    try {
      await this.postgresConnectionAdapter.query<{ id: number }>(
        `
          INSERT INTO fast_food.product_order(order_id, product_id, quantity, unit_price, observation, created_at, updated_at)
          VALUES($1::integer, $2::integer, $3::integer, $4::numeric, $5::text, $6::timestamp, $7::timestamp)
        `,
        [
          orderId,
          productId,
          quantity,
          price,
          observation,
          effectiveDate,
          effectiveDate,
        ],
      )
    } catch (error) {
      console.error(error)
      throw new DomainException(
        'Erro ao salvar produto do pedido',
        ExceptionCause.PERSISTANCE_EXCEPTION,
      )
    }
  }

  async updateOrderStatus(
    orderId: number,
    status: OrderCurrentStatus,
    updatedAt: string,
    payment?: Payment,
  ): Promise<Order> {
    try {
      const { rows } = await this.postgresConnectionAdapter.query<{
        status: OrderCurrentStatus
        updated_at: string
      }>(
        `
          UPDATE ${this.table} SET status = $1::fast_food.order_status_enum, updated_at = $2::timestamp, payment = $4::jsonb
          WHERE id = $3::integer
          RETURNING status, updated_at
        `,
        [status, updatedAt, orderId, payment ?? null],
      )
      if (!rows || !rows.length) return null
      return new Order(
        0,
        rows[0].status,
        [],
        null,
        null,
        null,
        null,
        rows[0].updated_at,
      )
    } catch (error) {
      console.error(error)
      throw new DomainException(
        'Erro ao atualizar o status do pedido',
        ExceptionCause.PERSISTANCE_EXCEPTION,
      )
    }
  }

  async findAllOrders(params?: OrderParams): Promise<Order[]> {
    try {
      const haveParams = params && Object.keys(params).length
      const baseQuery = `
        SELECT
          o.id,
          o.total_amount,
          o.status,
          o.customer_id,
          o.payment,
          o.created_at AS effective_date,
          o.updated_at
        FROM
          ${this.table} o
        WHERE o.status != 'FINALIZADO' AND o.status != 'CANCELADO'
        ORDER BY o.created_at ASC
      `
      const [query, paramsList] = !haveParams
        ? [baseQuery, []]
        : [
            `${baseQuery} WHERE ${Object.keys(params)
              .map(
                (field, index) =>
                  `o.${field} ${params[field].exactMatch ? '=' : 'ILIKE'} $${index + 1}`,
              )
              .join(' AND ')}`,
            Object.values(params).map(param =>
              param.exactMatch ? param.value : `%${param.value}%`,
            ),
          ]
      const { rows } = await this.postgresConnectionAdapter.query<OrderData>(
        query,
        [...paramsList],
      )
      if (!rows || !rows.length) return []
      return rows.map(
        row =>
          new Order(
            Number(row.total_amount),
            row.status,
            [],
            row.payment,
            row.customer_id,
            Number(row.id),
            row.effective_date,
            row.updated_at,
          ),
      )
    } catch (error) {
      console.error(error)
      throw new DomainException(
        'Erro ao consultar pedidos',
        ExceptionCause.PERSISTANCE_EXCEPTION,
      )
    }
  }

  async findOrderById(orderId: number): Promise<Order> {
    try {
      const { rows } = await this.postgresConnectionAdapter.query<OrderData>(
        `
          SELECT
          o.id,
          o.total_amount,
          o.status,
          o.customer_id,
          o.payment,
          o.created_at AS effective_date,
          o.updated_at
        FROM
          ${this.table} o
        WHERE o.id = $1::integer LIMIT 1
        `,
        [orderId],
      )
      if (!rows || !rows.length) return null
      return new Order(
        Number(rows[0].total_amount),
        rows[0].status,
        [],
        rows[0].payment,
        rows[0].customer_id,
        Number(rows[0].id),
        rows[0].effective_date,
        rows[0].updated_at,
      )
    } catch (error) {
      console.error(error)
      throw new DomainException(
        'Erro ao buscar pedido',
        ExceptionCause.PERSISTANCE_EXCEPTION,
      )
    }
  }

  async findOrderByPaymentId(paymentId: string): Promise<Order> {
    try {
      const { rows } = await this.postgresConnectionAdapter.query<OrderData>(
        `
          SELECT
          o.id,
          o.total_amount,
          o.status,
          o.customer_id,
          o.payment_id,
          o.created_at AS effective_date,
          o.updated_at,
          p.type AS payment_type,
          p.status AS payment_status,
          p.effective_date AS payment_effective_date,
          p.external_id AS payment_external_id,
          c.name AS customer_name,
          c.document AS customer_document,
          c.email AS customer_email
        FROM
          ${this.table} o
        LEFT JOIN
          fast_food.customer c ON o.customer_id = c.id
        JOIN
          fast_food.payment p ON o.payment_id = p.id
        WHERE p.id = $1::uuid LIMIT 1
        `,
        [paymentId],
      )
      if (!rows || !rows.length) return null
      const payment = null
      const customer = null
      return new Order(
        Number(rows[0].total_amount),
        rows[0].status,
        [],
        payment,
        customer,
        Number(rows[0].id),
        rows[0].effective_date,
        rows[0].updated_at,
      )
    } catch (error) {
      console.error(error)
      throw new DomainException(
        'Erro ao buscar pedido',
        ExceptionCause.PERSISTANCE_EXCEPTION,
      )
    }
  }
}
