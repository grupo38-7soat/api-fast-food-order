/* eslint-disable jest/no-focused-tests */
import { SearchProductsUseCase } from '@core/application/use-cases'
import { Category, Product } from '@core/domain/entities'
import { IProductRepository } from '@core/domain/repositories'

describe('SearchProductsUseCase', () => {
  let productRepositoryMock: IProductRepository
  let sut: SearchProductsUseCase

  beforeAll(() => {
    productRepositoryMock = {
      saveProduct: jest.fn(),
      findProductByParam: jest.fn(),
      findAllProducts: jest.fn(),
      removeProduct: jest.fn(),
    }
    sut = new SearchProductsUseCase(productRepositoryMock)
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
    it('should throws if category is invalid', async () => {
      const input = {
        id: 1,
        name: 'some_info',
        category: 'OUTRO' as Category,
      }
      await expect(sut.execute(input)).rejects.toThrow(
        'A categoria deve ser válida',
      )
      expect(productRepositoryMock.findAllProducts).not.toHaveBeenCalled()
    })

    it('should return a products list', async () => {
      jest
        .spyOn(productRepositoryMock, 'findAllProducts')
        .mockResolvedValueOnce([
          new Product('some_info', 'some_info', 1, Category.LANCHE, [
            'some_info',
          ]),
        ])
      const input = {
        id: 1,
        name: 'some_info',
        category: Category.LANCHE,
      }
      const output = await sut.execute(input)
      expect(output).toBeDefined()
      expect(output).toHaveLength(1)
      expect(productRepositoryMock.findAllProducts).toHaveBeenCalledTimes(1)
      expect(productRepositoryMock.findAllProducts).toHaveBeenCalledWith({
        category: {
          exactMatch: true,
          value: 'LANCHE',
        },
        id: {
          exactMatch: true,
          value: 1,
        },
        name: {
          exactMatch: false,
          value: 'some_info',
        },
      })
    })
  })
})
