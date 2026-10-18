import { createApp } from './app'
import { config } from './config'
import { sqlite } from './db/client'

const { httpServer, apollo } = await createApp()

await new Promise<void>(resolve => httpServer.listen(config.port, resolve))

console.info(`UNO server: ${config.baseURL}/graphql`)

async function shutdown() {
  await apollo.stop()
  sqlite.close()
}

process.once('SIGINT', () => {
  void shutdown()
})

process.once('SIGTERM', () => {
  void shutdown()
})
