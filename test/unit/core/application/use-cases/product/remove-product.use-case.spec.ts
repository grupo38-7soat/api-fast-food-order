import { RemoveProductUseCase } from '@core/application/use-cases'
import { Category, Product } from '@core/domain/entities'
import { IProductRepository } from '@core/domain/repositories'

describe('RemoveProductUseCase', () => {
  let productRepositoryMock: IProductRepository
  let sut: RemoveProductUseCase

  beforeAll(() => {
    productRepositoryMock = {
      saveProduct: jest.fn(),
      findProductByParam: jest.fn(),
      findAllProducts: jest.fn(),
      removeProduct: jest.fn(),
    }
    sut = new RemoveProductUseCase(productRepositoryMock)
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
    it('should throws if id is empty', async () => {
      const input = {
        id: 0,
      }
      await expect(sut.execute(input)).rejects.toThrow(
        'O id deve ser informado',
      )
      expect(productRepositoryMock.findProductByParam).not.toHaveBeenCalled()
      expect(productRepositoryMock.removeProduct).not.toHaveBeenCalled()
    })

    it('should throws if any product was found', async () => {
      jest
        .spyOn(productRepositoryMock, 'findProductByParam')
        .mockResolvedValueOnce(null)
      const input = {
        id: 1,
      }
      await expect(sut.execute(input)).rejects.toThrow('Produto não encontrado')
      expect(productRepositoryMock.findProductByParam).toHaveBeenCalledTimes(1)
      expect(productRepositoryMock.findProductByParam).toHaveBeenCalledWith(
        'id',
        input.id,
      )
      expect(productRepositoryMock.removeProduct).not.toHaveBeenCalled()
    })

    it('should remove a product', async () => {
      jest
        .spyOn(productRepositoryMock, 'findProductByParam')
        .mockResolvedValueOnce(
          new Product('some_info', 'some_info', 1, Category.LANCHE, [
            'some_info',
          ]),
        )
      const input = {
        id: 1,
      }
      await sut.execute(input)
      expect(productRepositoryMock.findProductByParam).toHaveBeenCalledTimes(1)
      expect(productRepositoryMock.findProductByParam).toHaveBeenCalledWith(
        'id',
        input.id,
      )
      expect(productRepositoryMock.removeProduct).toHaveBeenCalledWith(input.id)
    })
  })
})
