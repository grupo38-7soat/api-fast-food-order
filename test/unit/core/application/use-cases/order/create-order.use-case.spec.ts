import { globalEnvs } from '@config/envs/global'
import { DomainException, ExceptionCause } from '@core/domain/base'
import { Category, Order, Product } from '@core/domain/entities'
import { IProductRepository, IOrderRepository } from '@core/domain/repositories'
import { IMessageBroker } from '@core/application/message-broker'
import {
  CreateOrderInput,
  CreateOrderUseCase,
} from '@core/application/use-cases'

jest.mock('@core/application/helpers', () => ({
  formatDateWithTimezone: jest.fn().mockReturnValue('2024-12-01T00:00:00Z'),
}))

jest.mock('crypto', () => ({
  randomUUID: jest
    .fn()
    .mockReturnValueOnce('f01fa975-1b06-44f0-9e1d-ad5923f5f9bf'),
}))

describe('CreateOrderUseCase', () => {
  let productRepositoryMock: jest.Mocked<IProductRepository>
  let orderRepositoryMock: jest.Mocked<IOrderRepository>
  let messageBrokerMock: jest.Mocked<IMessageBroker>
  let sut: CreateOrderUseCase

  beforeAll(() => {
    productRepositoryMock = {
      findProductByParam: jest.fn(),
    } as unknown as jest.Mocked<IProductRepository>
    orderRepositoryMock = {
      saveOrder: jest.fn(),
      saveOrderProduct: jest.fn(),
    } as unknown as jest.Mocked<IOrderRepository>
    messageBrokerMock = {
      publish: jest.fn(),
    } as unknown as jest.Mocked<IMessageBroker>
    sut = new CreateOrderUseCase(
      productRepositoryMock,
      orderRepositoryMock,
      messageBrokerMock,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('execute method', () => {
    const input: CreateOrderInput = {
      items: [{ id: 1, quantity: 1, observation: '' }],
      orderAmount: 100,
      customerId: 'some_id',
    }

    it('should throw an error if a product is not found', async () => {
      productRepositoryMock.findProductByParam.mockResolvedValueOnce(null)
      await expect(sut.execute(input)).rejects.toThrow(
        new DomainException(
          'Produto 1 não encontrado',
          ExceptionCause.NOTFOUND_EXCEPTION,
        ),
      )
      expect(productRepositoryMock.findProductByParam).toHaveBeenCalledWith(
        'id',
        1,
      )
    })

    it('should throw an error if the total amount is invalid', async () => {
      const mockProduct = new Product(
        'some_product',
        '',
        50,
        Category.LANCHE,
        [],
      )
      productRepositoryMock.findProductByParam.mockResolvedValueOnce(
        mockProduct,
      )
      await expect(sut.execute(input)).rejects.toThrow(
        new DomainException(
          'O valor total deve ser válido',
          ExceptionCause.BUSINESS_EXCEPTION,
        ),
      )
    })

    it('should create an order successfully', async () => {
      const mockProduct = new Product(
        'some_product',
        '',
        100,
        Category.LANCHE,
        [],
      )
      productRepositoryMock.findProductByParam.mockResolvedValueOnce(
        mockProduct,
      )
      orderRepositoryMock.saveOrder.mockResolvedValueOnce(1)
      const result = await sut.execute(input)
      expect(productRepositoryMock.findProductByParam).toHaveBeenCalledTimes(1)
      expect(orderRepositoryMock.saveOrder).toHaveBeenCalledWith(
        expect.any(Order),
        'some_id',
      )
      expect(orderRepositoryMock.saveOrderProduct).toHaveBeenCalledTimes(1)
      expect(messageBrokerMock.publish).toHaveBeenCalledWith(
        globalEnvs.messageBroker.paymentQueue,
        {
          id: 'f01fa975-1b06-44f0-9e1d-ad5923f5f9bf',
          payload: {
            orderId: 1,
            orderAmount: 100,
            items: input.items,
            payment: { type: 'PIX' },
          },
        },
      )
      expect(result).toEqual({
        order: {
          id: 1,
          status: 'PENDENTE',
          effectiveDate: '2024-12-01T00:00:00Z',
          totalAmount: 100,
        },
      })
    })
  })
})
