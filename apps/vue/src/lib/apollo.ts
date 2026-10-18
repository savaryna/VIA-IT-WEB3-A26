import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client/core'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'

export const serverURL = import.meta.env.VITE_SERVER_URL || window.location.origin
const wsURL = new URL('/graphql', serverURL)
wsURL.protocol = wsURL.protocol === 'https:' ? 'wss:' : 'ws:'
const wsClient = createClient({ url: wsURL.toString(), lazy: true, retryAttempts: 10 })
const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
  },
  new GraphQLWsLink(wsClient),
  new HttpLink({ uri: new URL('/graphql', serverURL).toString(), credentials: 'include' }),
)
export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  defaultOptions: {
    query: { fetchPolicy: 'network-only' },
    watchQuery: { fetchPolicy: 'network-only' },
  },
})
