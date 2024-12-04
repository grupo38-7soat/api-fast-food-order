export interface IAMQPServer {
  run(queue: string): Promise<void>
}
