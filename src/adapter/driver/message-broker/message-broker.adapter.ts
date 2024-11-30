import amqplib, { Connection, Channel } from 'amqplib'
import {
  IMessageBroker,
  MessageContent,
} from '@core/application/message-broker'

export class MessageBrokerAdapter implements IMessageBroker {
  private connection: Connection
  private channel: Channel

  constructor(private readonly url: string) {}

  async connect(): Promise<void> {
    this.connection = await amqplib.connect(this.url)
    this.channel = await this.connection.createChannel()
  }

  async publish(queue: string, content: MessageContent): Promise<void> {
    await this.channel.assertQueue(queue)
    console.log(
      `[MessageBrokerAdapter] Mensagem com id ${content.id} enviada para a fila ${queue}`,
    )
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(content)))
  }

  async consume(
    queue: string,
    handler: (content: MessageContent) => Promise<void>,
  ): Promise<void> {
    await this.channel.assertQueue(queue, { durable: true })
    this.channel.consume(queue, async msg => {
      if (msg) {
        const content = JSON.parse(msg.content.toString()) as MessageContent
        console.log(
          `[MessageBrokerAdapter] Mensagem com o id ${content.id} recebida da fila ${queue}`,
        )
        await handler(content)
        this.channel.ack(msg)
      }
    })
  }

  async close(): Promise<void> {
    await this.channel.close()
    await this.connection.close()
  }
}
