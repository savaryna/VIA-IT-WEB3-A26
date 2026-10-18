import { createServer } from 'node:http'

import { ApolloServer } from '@apollo/server'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { expressMiddleware } from '@as-integrations/express5'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { fromNodeHeaders, toNodeHandler } from 'better-auth/node'
import cors from 'cors'
import express from 'express'
import { useServer } from 'graphql-ws/use/ws'
import { WebSocketServer } from 'ws'

import { auth } from './auth'
import { config } from './config'
import { createContext, type Context } from './graphql/context'
import { resolvers } from './graphql/resolvers'
import { typeDefs } from './graphql/typeDefs'

export async function createApp() {
  const app = express()
  app.disable('x-powered-by')
  app.use(cors({ origin: config.origins, credentials: true }))
  // Better Auth must read the request stream before Express's JSON parser.
  app.all('/api/auth/*splat', toNodeHandler(auth))
  const httpServer = createServer(app)
  const schema = makeExecutableSchema({ typeDefs, resolvers })
  const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' })
  const cleanup = useServer(
    {
      schema,
      onConnect: async context => {
        if (context.extra.request.headers.origin && !config.origins.includes(context.extra.request.headers.origin))
          return false
        await createContext(fromNodeHeaders(context.extra.request.headers))
        return true
      },
      context: context => createContext(fromNodeHeaders(context.extra.request.headers)),
    },
    wsServer,
  )
  const apollo = new ApolloServer<Context>({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await cleanup.dispose()
            },
          }
        },
      },
    ],
    formatError: error => {
      if (error.extensions?.code === 'INTERNAL_SERVER_ERROR') {
        console.error(error)
        return { message: 'Internal server error', extensions: { code: 'INTERNAL_SERVER_ERROR' } }
      }
      return error
    },
  })

  await apollo.start()

  app.use(
    '/graphql',
    express.json({ limit: '32kb' }),
    expressMiddleware(apollo, {
      context: ({ req }) => createContext(fromNodeHeaders(req.headers)),
    }),
  )

  return { app, httpServer, apollo }
}
