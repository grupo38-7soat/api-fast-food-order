import { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import { DomainException, ExceptionCause } from '@core/domain/base'
import { Category } from '@core/domain/entities'
import {
  ICreateProductUseCase,
  IUpdateProductUseCase,
  ISearchProductsUseCase,
  IRemoveProductUseCase,
} from '@core/application/use-cases'
import { ProductController } from '@adapter/driver/api/controllers'
import { HttpStatus } from '@adapter/driver/api/types/http-server'

describe('ProductController', () => {
  let createProductUseCaseMock: ICreateProductUseCase
  let updateProductUseCaseMock: IUpdateProductUseCase
  let searchProductsUseCaseMock: ISearchProductsUseCase
  let removeProductUseCaseMock: IRemoveProductUseCase
  let sut: ProductController
  let requestMock: Partial<ExpressRequest>
  let responseMock: jest.Mocked<ExpressResponse>
  const errorMessage = 'Some error'
  const errorCause = ExceptionCause.UNKNOWN_EXCEPTION

  beforeAll(() => {
    createProductUseCaseMock = {
      execute: jest.fn(),
    }
    updateProductUseCaseMock = {
      execute: jest.fn(),
    }
    searchProductsUseCaseMock = {
      execute: jest.fn(),
    }
    removeProductUseCaseMock = {
      execute: jest.fn(),
    }
    requestMock = {}
    responseMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as jest.Mocked<ExpressResponse>
    sut = new ProductController(
      createProductUseCaseMock,
      updateProductUseCaseMock,
      searchProductsUseCaseMock,
      removeProductUseCaseMock,
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

  describe('createProduct', () => {
    const body = {
      name: 'some_info',
      description: 'some_info',
      price: 1,
      category: 'some_info',
      imageLinks: ['some_info'],
    }

    it('should return error response if any exception occurs', async () => {
      jest
        .spyOn(createProductUseCaseMock, 'execute')
        .mockRejectedValueOnce(new DomainException(errorMessage, errorCause))
      requestMock.body = body
      await sut.createProduct(requestMock as ExpressRequest, responseMock)
      expect(responseMock.status).toHaveBeenCalled()
      expect(responseMock.json).toHaveBeenCalled()
    })

    it('should return success response if product was created', async () => {
      requestMock.body = body
      jest
        .spyOn(createProductUseCaseMock, 'execute')
        .mockResolvedValueOnce({ id: 1, ...requestMock.body })
      await sut.createProduct(requestMock as ExpressRequest, responseMock)
      expect(createProductUseCaseMock.execute).toHaveBeenCalledWith(
        requestMock.body,
      )
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.CREATED)
      expect(responseMock.json).toHaveBeenCalledWith({
        data: { id: 1, ...requestMock.body },
      })
    })
  })

  describe('updateProduct', () => {
    const params = {
      id: '1',
    }
    const body = {
      name: 'some_info',
      description: 'some_info',
      price: 1,
      category: 'some_info',
      imageLinks: ['some_info'],
    }

    it('should return error response if any exception occurs', async () => {
      jest
        .spyOn(updateProductUseCaseMock, 'execute')
        .mockRejectedValueOnce(new DomainException(errorMessage, errorCause))
      requestMock.body = body
      requestMock.params = params
      await sut.updateProduct(requestMock as ExpressRequest, responseMock)
      expect(responseMock.status).toHaveBeenCalled()
      expect(responseMock.json).toHaveBeenCalled()
    })

    it('should return success response if product was updated', async () => {
      requestMock.body = body
      requestMock.params = params
      jest
        .spyOn(updateProductUseCaseMock, 'execute')
        .mockResolvedValueOnce({ id: 1 })
      await sut.updateProduct(requestMock as ExpressRequest, responseMock)
      expect(updateProductUseCaseMock.execute).toHaveBeenCalledWith({
        id: parseInt(requestMock.params.id),
        ...requestMock.body,
      })
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.OK)
      expect(responseMock.json).toHaveBeenCalledWith({
        data: { id: 1 },
      })
    })
  })

  describe('searchProducts', () => {
    const query = {
      id: '',
      name: 'some_info',
      category: 'some_info',
    }

    it('should return error response if any exception occurs', async () => {
      jest
        .spyOn(searchProductsUseCaseMock, 'execute')
        .mockRejectedValueOnce(new DomainException(errorMessage, errorCause))
      requestMock.query = query
      await sut.searchProducts(requestMock as ExpressRequest, responseMock)
      expect(responseMock.status).toHaveBeenCalled()
      expect(responseMock.json).toHaveBeenCalled()
    })

    it('should return success response if product list was fetched', async () => {
      requestMock.query = query
      jest.spyOn(searchProductsUseCaseMock, 'execute').mockResolvedValueOnce([
        {
          id: 1,
          name: 'some_info',
          description: 'some_info',
          price: 1,
          category: Category.ACOMPANHAMENTO,
          imageLinks: ['some_info'],
          createdAt: '',
          updatedAt: '',
        },
      ])
      await sut.searchProducts(requestMock as ExpressRequest, responseMock)
      expect(searchProductsUseCaseMock.execute).toHaveBeenCalledWith({
        id: undefined,
        name: 'some_info',
        category: 'some_info',
      })
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.OK)
      expect(responseMock.json).toHaveBeenCalledWith({
        data: [
          {
            id: 1,
            name: 'some_info',
            description: 'some_info',
            price: 1,
            category: Category.ACOMPANHAMENTO,
            imageLinks: ['some_info'],
            createdAt: '',
            updatedAt: '',
          },
        ],
      })
    })
  })

  describe('removeProduct', () => {
    const params = {
      id: '1',
    }

    it('should return error response if any exception occurs', async () => {
      requestMock.params = params
      jest
        .spyOn(removeProductUseCaseMock, 'execute')
        .mockRejectedValueOnce(new DomainException(errorMessage, errorCause))
      await sut.removeProduct(requestMock as ExpressRequest, responseMock)
      expect(responseMock.status).toHaveBeenCalled()
      expect(responseMock.json).toHaveBeenCalled()
    })

    it('should return success response if product was removed', async () => {
      requestMock.params = params
      await sut.removeProduct(requestMock as ExpressRequest, responseMock)
      expect(removeProductUseCaseMock.execute).toHaveBeenCalledWith({ id: 1 })
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT)
      expect(responseMock.json).toHaveBeenCalledWith({ data: undefined })
    })
  })
})
