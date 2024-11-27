/* eslint-disable jest/no-focused-tests */
import { UpdateProductUseCase } from '@core/application/use-cases'
import { Category, Product } from '@core/domain/entities'
import { IProductRepository } from '@core/domain/repositories'

describe('UpdateProductUseCase', () => {
  let productRepositoryMock: IProductRepository
  let sut: UpdateProductUseCase

  beforeAll(() => {
    productRepositoryMock = {
      saveProduct: jest.fn(),
      findProductByParam: jest.fn(),
      findAllProducts: jest.fn(),
      removeProduct: jest.fn(),
    }
    sut = new UpdateProductUseCase(productRepositoryMock)
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
    it('should throws if any required field is empty', async () => {
      const input = {
        id: 0,
        name: '',
        description: '',
        price: 0,
        category: Category.LANCHE,
        imageLinks: [''],
      }
      await expect(sut.execute(input)).rejects.toThrow(
        'Todos campos obrigatórios devem ser informados',
      )
      expect(productRepositoryMock.findProductByParam).not.toHaveBeenCalled()
      expect(productRepositoryMock.saveProduct).not.toHaveBeenCalled()
    })

    it('should throws if category is invalid', async () => {
      const input = {
        id: 1,
        name: 'some_info',
        description: 'some_info',
        price: 1,
        category: 'OUTRO' as Category,
        imageLinks: ['some_info'],
      }
      await expect(sut.execute(input)).rejects.toThrow(
        'A categoria deve ser válida',
      )
      expect(productRepositoryMock.findProductByParam).not.toHaveBeenCalled()
      expect(productRepositoryMock.saveProduct).not.toHaveBeenCalled()
    })

    it('should throws if any product was found', async () => {
      jest
        .spyOn(productRepositoryMock, 'findProductByParam')
        .mockResolvedValueOnce(null)
      const input = {
        id: 1,
        name: 'some_info',
        description: 'some_info',
        price: 1,
        category: Category.LANCHE,
        imageLinks: ['some_info'],
      }
      await expect(sut.execute(input)).rejects.toThrow('Produto não encontrado')
      expect(productRepositoryMock.findProductByParam).toHaveBeenCalledTimes(1)
      expect(productRepositoryMock.findProductByParam).toHaveBeenCalledWith(
        'id',
        input.id,
      )
      expect(productRepositoryMock.saveProduct).not.toHaveBeenCalled()
    })

    it('should update a product', async () => {
      jest
        .spyOn(productRepositoryMock, 'findProductByParam')
        .mockResolvedValueOnce(
          new Product('some_info', 'some_info', 1, Category.LANCHE, [
            'some_info',
          ]),
        )
      jest.spyOn(productRepositoryMock, 'saveProduct').mockResolvedValueOnce(1)
      const input = {
        id: 1,
        name: 'some_info',
        description: 'some_info',
        price: 1,
        category: Category.LANCHE,
        imageLinks: ['some_info'],
      }
      const output = await sut.execute(input)
      expect(output).toBeDefined()
      expect(output.id).toBeDefined()
      expect(productRepositoryMock.findProductByParam).toHaveBeenCalledTimes(1)
      expect(productRepositoryMock.findProductByParam).toHaveBeenCalledWith(
        'id',
        input.id,
      )
      expect(productRepositoryMock.saveProduct).toHaveBeenCalledTimes(1)
      expect(productRepositoryMock.saveProduct).toHaveBeenCalledWith(
        new Product(
          input.name,
          input.description,
          input.price,
          input.category,
          input.imageLinks,
          input.id,
        ),
      )
    })
  })
})
