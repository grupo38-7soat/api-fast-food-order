import { QueryResult } from 'pg'
import { Category, Product } from '@core/domain/entities'
import { DomainException } from '@core/domain/base'
import { ProductRepository } from '@adapter/driven/database/repositories'
import { PostgresConnectionAdapter } from '@adapter/driven/database/postgres-connection.adapter'

jest.mock('@adapter/driven/database/postgres-connection.adapter')

describe('ProductRepository', () => {
  let postgresConnectionAdapter: jest.Mocked<PostgresConnectionAdapter>
  let sut: ProductRepository

  beforeAll(() => {
    postgresConnectionAdapter =
      new PostgresConnectionAdapter() as jest.Mocked<PostgresConnectionAdapter>
    sut = new ProductRepository(postgresConnectionAdapter)
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

  describe('saveProduct', () => {
    it('should save a new product and return the generated ID', async () => {
      const product = new Product(
        'Burger',
        'Delicious burger',
        10,
        Category.LANCHE,
        ['link1'],
      )
      postgresConnectionAdapter.query.mockResolvedValueOnce({
        rows: [{ id: 1 }],
      } as QueryResult)
      const id = await sut.saveProduct(product)
      expect(id).toBe(1)
      expect(postgresConnectionAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO'),
        expect.arrayContaining([
          product.getName(),
          product.getDescription(),
          product.getPrice(),
          product.getCategory(),
          product.getImageLinks(),
        ]),
      )
    })

    it('should update an existing product and return the ID', async () => {
      const product = new Product(
        'Burger',
        'Delicious burger',
        10,
        Category.LANCHE,
        ['link1'],
        1,
      )
      postgresConnectionAdapter.query.mockResolvedValueOnce({
        rows: [{ id: 1 }],
      } as QueryResult)
      const id = await sut.saveProduct(product)
      expect(id).toBe(1)
      expect(postgresConnectionAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE'),
        expect.arrayContaining([
          product.getName(),
          product.getDescription(),
          product.getPrice(),
          product.getCategory(),
          product.getImageLinks(),
          product.getId(),
        ]),
      )
    })

    it('should throws if saving fails', async () => {
      const product = new Product(
        'Burger',
        'Delicious burger',
        10,
        Category.LANCHE,
        ['link1'],
      )
      postgresConnectionAdapter.query.mockRejectedValueOnce(
        new Error('Database error'),
      )
      await expect(sut.saveProduct(product)).rejects.toThrow(DomainException)
    })
  })

  describe('findProductByParam', () => {
    it('should find a product by parameter', async () => {
      const mockProductData = {
        id: 1,
        name: 'Burger',
        description: 'Delicious burger',
        category: Category.LANCHE,
        price: 10,
        image_links: ['link1'],
        created_at: '2023-01-01',
        updated_at: '2023-01-02',
      }
      postgresConnectionAdapter.query.mockResolvedValueOnce({
        rows: [mockProductData],
      } as QueryResult)
      const product = await sut.findProductByParam('id', 1)
      expect(product.getName()).toBe(mockProductData.name)
      expect(postgresConnectionAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [1],
      )
    })

    it('should return null if no product is found', async () => {
      postgresConnectionAdapter.query.mockResolvedValueOnce({
        rows: [],
      } as QueryResult)
      const product = await sut.findProductByParam('id', 1)
      expect(product).toBeNull()
    })

    it('should throws if the query fails', async () => {
      postgresConnectionAdapter.query.mockRejectedValueOnce(
        new Error('Database error'),
      )
      await expect(sut.findProductByParam('id', 1)).rejects.toThrow(
        DomainException,
      )
    })
  })

  describe('findAllProducts', () => {
    it('should return all products if no parameters are provided', async () => {
      const mockProductsData = [
        {
          id: 1,
          name: 'Burger',
          description: 'Delicious burger',
          category: Category.LANCHE,
          price: 10,
          image_links: ['link1'],
          created_at: '2023-01-01',
          updated_at: '2023-01-02',
        },
      ]
      postgresConnectionAdapter.query.mockResolvedValueOnce({
        rows: mockProductsData,
      } as QueryResult)

      const products = await sut.findAllProducts()
      expect(products).toHaveLength(1)
      expect(products[0].getName()).toBe(mockProductsData[0].name)
      expect(postgresConnectionAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [],
      )
    })

    it('should return products filtered by parameters', async () => {
      const mockProductsData = [
        {
          id: 1,
          name: 'Burger',
          description: 'Delicious burger',
          category: Category.LANCHE,
          price: 10,
          image_links: ['link1'],
          created_at: '2023-01-01',
          updated_at: '2023-01-02',
        },
      ]
      postgresConnectionAdapter.query.mockResolvedValueOnce({
        rows: mockProductsData,
      } as QueryResult)
      const products = await sut.findAllProducts({
        name: { value: 'Burger', exactMatch: true },
      })
      expect(products).toHaveLength(1)
      expect(postgresConnectionAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE'),
        expect.arrayContaining(['Burger']),
      )
    })

    it('should throws if the query fails', async () => {
      postgresConnectionAdapter.query.mockRejectedValueOnce(
        new Error('Database error'),
      )
      await expect(sut.findAllProducts()).rejects.toThrow(DomainException)
    })
  })

  describe('removeProduct', () => {
    it('should remove a product by ID', async () => {
      postgresConnectionAdapter.query.mockResolvedValueOnce({
        rows: [],
      } as QueryResult)
      await sut.removeProduct(1)
      expect(postgresConnectionAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE'),
        [1],
      )
    })

    it('should throws if the deletion fails', async () => {
      postgresConnectionAdapter.query.mockRejectedValueOnce(
        new Error('Database error'),
      )
      await expect(sut.removeProduct(1)).rejects.toThrow(DomainException)
    })
  })
})
