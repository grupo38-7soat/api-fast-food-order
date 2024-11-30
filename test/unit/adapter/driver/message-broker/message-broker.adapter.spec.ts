import amqplib, { Connection, Channel } from 'amqplib'
import { MessageBrokerAdapter } from '@adapter/driver/message-broker/message-broker.adapter'
import { MessageContent } from '@core/application/message-broker'

jest.mock('amqplib')

describe('MessageBrokerAdapter', () => {
  let connectionMock: jest.Mocked<Connection>
  let channelMock: jest.Mocked<Channel>
  let sut: MessageBrokerAdapter
  const url = 'some_url'
  const queue = 'some_queue'

  beforeAll(() => {
    connectionMock = {
      createChannel: jest.fn(),
      close: jest.fn(),
    } as unknown as jest.Mocked<Connection>
    channelMock = {
      assertQueue: jest.fn(),
      sendToQueue: jest.fn(),
      consume: jest.fn(),
      ack: jest.fn(),
      close: jest.fn(),
    } as unknown as jest.Mocked<Channel>
    ;(amqplib.connect as jest.Mock).mockResolvedValue(connectionMock)
    connectionMock.createChannel.mockResolvedValue(channelMock)
    sut = new MessageBrokerAdapter(url)
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

  describe('connect method', () => {
    it('should connect successfully', async () => {
      await sut.connect()
      expect(amqplib.connect).toHaveBeenCalledWith(url)
      expect(connectionMock.createChannel).toHaveBeenCalledTimes(1)
    })
  })

  describe('publish method', () => {
    it('should publish a message in the queue', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
      const content: MessageContent = { id: '123', payload: { key: 'value' } }
      await sut.connect()
      await sut.publish(queue, content)
      expect(channelMock.assertQueue).toHaveBeenCalledWith(queue)
      expect(channelMock.sendToQueue).toHaveBeenCalledWith(
        queue,
        Buffer.from(JSON.stringify(content)),
      )
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `[MessageBrokerAdapter] Mensagem com id ${content.id} enviada para a fila ${queue}`,
      )
    })
  })

  describe('consume method', () => {
    it('should consume a message of the queue', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
      const content: MessageContent = { id: '123', payload: { key: 'value' } }
      const handler = jest.fn()
      await sut.connect()
      channelMock.consume.mockImplementation(async (_, callback) => {
        callback({
          content: Buffer.from(JSON.stringify(content)),
        } as any)
        return null
      })
      await sut.consume(queue, handler)
      expect(channelMock.assertQueue).toHaveBeenCalledWith(queue, {
        durable: true,
      })
      expect(channelMock.consume).toHaveBeenCalledWith(
        queue,
        expect.any(Function),
      )
      expect(handler).toHaveBeenCalledWith(content)
      expect(channelMock.ack).toHaveBeenCalled()
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `[MessageBrokerAdapter] Mensagem com o id ${content.id} recebida da fila ${queue}`,
      )
    })
  })

  describe('close method', () => {
    it('should close connection and channel', async () => {
      await sut.connect()
      await sut.close()
      expect(channelMock.close).toHaveBeenCalledTimes(1)
      expect(connectionMock.close).toHaveBeenCalledTimes(1)
    })
  })
})
