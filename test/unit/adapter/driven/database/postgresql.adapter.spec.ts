/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pool, QueryResult } from 'pg'
import { PostgresConnectionAdapter } from '@adapter/driven/database/postgres-connection.adapter'

jest.mock('pg', () => {
  const mPool = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  }
  return { Pool: jest.fn(() => mPool) }
})

describe('PostgresConnectionAdapter', () => {
  let sut: PostgresConnectionAdapter
  let postgreSQLPoolMock: jest.Mocked<Pool>

  beforeEach(() => {
    sut = new PostgresConnectionAdapter()
    postgreSQLPoolMock = new Pool() as jest.Mocked<Pool>
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

  describe('query method', () => {
    it('should establish a connection when executing a query', async () => {
      const mockQueryResult: QueryResult<any> = {
        rows: [],
        rowCount: 0,
      } as QueryResult<any>
      postgreSQLPoolMock.query.mockImplementationOnce(() => mockQueryResult)
      const sqlQuery = 'SELECT * FROM users'
      const params: unknown[] = []
      const result = await sut.query(sqlQuery, params)
      expect(postgreSQLPoolMock.query).toHaveBeenCalledWith(sqlQuery, params)
      expect(result).toBe(mockQueryResult)
    })

    it('should not connect again if already connected', async () => {
      const mockQueryResult: QueryResult<any> = {
        rows: [],
        rowCount: 0,
      } as QueryResult<any>
      postgreSQLPoolMock.query.mockImplementationOnce(() => mockQueryResult)
      await sut.query('SELECT * FROM users', [])
      await sut.query('SELECT * FROM posts', [])
    })
  })

  describe('checkDatabase method', () => {
    it('should check the database connection successfully', async () => {
      const mockQueryResult: QueryResult<any> = {
        rows: [{ '1': 1 }],
        rowCount: 1,
      } as QueryResult<any>
      postgreSQLPoolMock.query.mockImplementationOnce(() => mockQueryResult)
      const result = await sut.checkDatabase()
      expect(postgreSQLPoolMock.query).toHaveBeenCalledWith('SELECT 1', [])
      expect(result).toBe(true)
    })

    it('should return false if checkDatabase fails', async () => {
      postgreSQLPoolMock.query.mockImplementationOnce(() => {
        throw new Error('Connection failed')
      })
      const result = await sut.checkDatabase()
      expect(result).toBe(false)
    })
  })
})
