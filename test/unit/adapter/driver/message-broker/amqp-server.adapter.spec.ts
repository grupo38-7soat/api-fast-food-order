import { AMQPServerAdapter } from '@adapter/driver/message-broker/amqp-server.adapter'
import { IMessageBroker } from '@core/application/message-broker'

describe('AMQPServerAdapter', () => {
  let messageBrokerMock: IMessageBroker
  let targetUseCaseMock: { execute: jest.Mock }
  let sut: AMQPServerAdapter

  beforeAll(() => {
    messageBrokerMock = {
      consume: jest.fn(),
      publish: jest.fn(),
      connect: jest.fn(),
      close: jest.fn(),
    }
    targetUseCaseMock = {
      execute: jest.fn(),
    }
    sut = new AMQPServerAdapter(messageBrokerMock, targetUseCaseMock)
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

  describe('run method', () => {
    const queue = 'some_queue'

    it('should connect to message broker and consuming a queue', async () => {
      await sut.run(queue)
      expect(messageBrokerMock.connect).toHaveBeenCalledTimes(1)
      expect(messageBrokerMock.consume).toHaveBeenCalledWith(
        queue,
        expect.any(Function),
      )
      expect(messageBrokerMock.consume).toHaveBeenCalledTimes(1)
    })

    it('should run the use case when a message is consumed', async () => {
      const payload = { example: 'data' }
      const consumeHandler = jest.fn()
      jest
        .spyOn(messageBrokerMock, 'consume')
        .mockImplementation(async (_, handler) => {
          consumeHandler.mockImplementation(handler)
        })
      await sut.run(queue)
      await consumeHandler({ payload })
      expect(targetUseCaseMock.execute).toHaveBeenCalledWith(payload)
      expect(targetUseCaseMock.execute).toHaveBeenCalledTimes(1)
    })

    it('should log any error if consume fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const payload = { example: 'data' }

      const error = new Error('Erro no caso de uso')
      jest.spyOn(targetUseCaseMock, 'execute').mockRejectedValueOnce(error)

      const consumeHandler = jest.fn()
      jest
        .spyOn(messageBrokerMock, 'consume')
        .mockImplementation(async (_, handler) => {
          consumeHandler.mockImplementation(handler)
        })

      await sut.run(queue)
      await consumeHandler({ payload })
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[AMQPServer] Erro ao processar mensagem:',
        error,
      )
      expect(targetUseCaseMock.execute).toHaveBeenCalledWith(payload)
      expect(targetUseCaseMock.execute).toHaveBeenCalledTimes(1)
      consoleErrorSpy.mockRestore()
    })
  })
})
