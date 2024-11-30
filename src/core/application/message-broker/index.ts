export type MessageContent = {
  id: string
  payload: Record<string, unknown>
}

export interface IMessageBroker {
  connect(): Promise<void>
  close(): Promise<void>
  publish(queue: string, content: MessageContent): Promise<void>
  consume(
    queue: string,
    handler: (content: MessageContent) => Promise<void>,
  ): Promise<void>
}
