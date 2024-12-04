import { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import { DomainException, ExceptionCause } from '@core/domain/base'
import { OrderCurrentStatus } from '@core/domain/entities'
import {
  ICreateOrderUseCase,
  IUpdateOrderStatusUseCase,
  ISearchOrdersUseCase,
} from '@core/application/use-cases'
import { OrderController } from '@adapter/driver/api/controllers'
import { HttpStatus } from '@adapter/driver/api/types/http-server'

describe('OrderController', () => {
  let createOrderUseCaseMock: ICreateOrderUseCase
  let updateOrderStatusUseCaseMock: IUpdateOrderStatusUseCase
  let searchOrdersUseCaseMock: ISearchOrdersUseCase
  let sut: OrderController
  let requestMock: Partial<ExpressRequest>
  let responseMock: jest.Mocked<ExpressResponse>
  const errorMessage = 'Some error'
  const errorCause = ExceptionCause.UNKNOWN_EXCEPTION

  beforeAll(() => {
    createOrderUseCaseMock = {
      execute: jest.fn(),
    }
    updateOrderStatusUseCaseMock = {
      execute: jest.fn(),
    }
    searchOrdersUseCaseMock = {
      execute: jest.fn(),
    }
    requestMock = {}
    responseMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as jest.Mocked<ExpressResponse>
    sut = new OrderController(
      createOrderUseCaseMock,
      searchOrdersUseCaseMock,
      updateOrderStatusUseCaseMock,
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

  describe('createOrder method', () => {
    const body = {
      customerId: 'some_info',
      items: [
        {
          id: 1,
          quantity: 1,
          observation: 'some_info',
        },
      ],
      orderAmount: 1,
    }

    it('should return error response if any exception occurs', async () => {
      jest
        .spyOn(createOrderUseCaseMock, 'execute')
        .mockRejectedValueOnce(new DomainException(errorMessage, errorCause))
      requestMock.body = body
      await sut.createOrder(requestMock as ExpressRequest, responseMock)
      expect(responseMock.status).toHaveBeenCalled()
      expect(responseMock.json).toHaveBeenCalled()
    })

    it('should return success response if order was created', async () => {
      requestMock.body = body
      jest
        .spyOn(createOrderUseCaseMock, 'execute')
        .mockResolvedValueOnce({ id: 1, ...requestMock.body })
      await sut.createOrder(requestMock as ExpressRequest, responseMock)
      expect(createOrderUseCaseMock.execute).toHaveBeenCalledWith(
        requestMock.body,
      )
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.CREATED)
      expect(responseMock.json).toHaveBeenCalledWith({
        data: { id: 1, ...requestMock.body },
      })
    })
  })

  describe('searchOrders method', () => {
    const query = {
      id: '1',
      status: OrderCurrentStatus.EM_PREPARO,
    }

    it('should return error response if any exception occurs', async () => {
      jest
        .spyOn(searchOrdersUseCaseMock, 'execute')
        .mockRejectedValueOnce(new DomainException(errorMessage, errorCause))
      requestMock.query = query
      await sut.searchOrders(requestMock as ExpressRequest, responseMock)
      expect(responseMock.status).toHaveBeenCalled()
      expect(responseMock.json).toHaveBeenCalled()
    })

    it('should return success response if order list was fetched', async () => {
      requestMock.query = query
      jest.spyOn(searchOrdersUseCaseMock, 'execute').mockResolvedValueOnce([
        {
          id: 1,
          status: OrderCurrentStatus.EM_PREPARO,
          effectiveDate: '2024-12-01T00:00:00.000Z',
          updatedAt: '2024-12-01T00:00:00.000Z',
          totalAmount: 1,
          payment: null,
          customerId: null,
          waitingTime: 1,
        },
      ])
      await sut.searchOrders(requestMock as ExpressRequest, responseMock)
      expect(searchOrdersUseCaseMock.execute).toHaveBeenCalledWith({
        id: 1,
        status: OrderCurrentStatus.EM_PREPARO,
      })
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.OK)
      expect(responseMock.json).toHaveBeenCalledWith({
        data: [
          {
            id: 1,
            status: 'EM_PREPARO',
            effectiveDate: '2024-12-01T00:00:00.000Z',
            updatedAt: '2024-12-01T00:00:00.000Z',
            totalAmount: 1,
            payment: null,
            customerId: null,
            waitingTime: 1,
          },
        ],
      })
    })
  })

  describe('updateOrderStatus', () => {
    const params = {
      id: '1',
    }
    const body = {
      status: OrderCurrentStatus.RECEBIDO,
    }

    it('should return error response if any exception occurs', async () => {
      jest
        .spyOn(updateOrderStatusUseCaseMock, 'execute')
        .mockRejectedValueOnce(new DomainException(errorMessage, errorCause))
      requestMock.body = body
      requestMock.params = params
      await sut.updateOrderStatus(requestMock as ExpressRequest, responseMock)
      expect(responseMock.status).toHaveBeenCalled()
      expect(responseMock.json).toHaveBeenCalled()
    })

    it('should return success response if order was updated', async () => {
      requestMock.body = body
      requestMock.params = params
      jest
        .spyOn(updateOrderStatusUseCaseMock, 'execute')
        .mockResolvedValueOnce({
          previousStatus: OrderCurrentStatus.EM_PREPARO,
          currentStatus: OrderCurrentStatus.RECEBIDO,
          updatedAt: '2024-12-01T00:00:00.000Z',
        })
      await sut.updateOrderStatus(requestMock as ExpressRequest, responseMock)
      expect(updateOrderStatusUseCaseMock.execute).toHaveBeenCalledWith({
        orderId: parseInt(requestMock.params.id),
        ...requestMock.body,
      })
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.OK)
      expect(responseMock.json).toHaveBeenCalledWith({
        data: {
          previousStatus: 'EM_PREPARO',
          currentStatus: 'RECEBIDO',
          updatedAt: '2024-12-01T00:00:00.000Z',
        },
      })
    })
  })
})
