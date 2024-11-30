/* eslint-disable @typescript-eslint/no-explicit-any */
import { IMessageBroker } from '@core/application/message-broker'
import { IAMQPServer } from './types/message-broker'

export class AMQPServerAdapter implements IAMQPServer {
  constructor(
    private readonly messageBroker: IMessageBroker,
    private readonly targetUseCase: any,
  ) {}

  async run(queue: string): Promise<void> {
    await this.messageBroker.connect()
    await this.messageBroker.consume(queue, async content => {
      try {
        await this.targetUseCase.execute(content.payload)
      } catch (error) {
        console.error('[AMQPServer] Erro ao processar mensagem:', error)
      }
    })
    console.log(`[AMQPServer] Monitorando fila: ${queue}`)
  }
}
