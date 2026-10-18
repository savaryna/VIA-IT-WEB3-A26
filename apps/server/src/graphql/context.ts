import { GraphQLError } from 'graphql'

import { auth, type AuthUser } from '../auth'

export type Context = { user: AuthUser; authenticate(): Promise<AuthUser> }

export async function createContext(headers: Headers): Promise<Context> {
  async function authenticate() {
    const session = await auth.api.getSession({ headers })
    if (!session) throw new GraphQLError('Please sign in', { extensions: { code: 'UNAUTHENTICATED' } })
    return session.user
  }

  return { user: await authenticate(), authenticate }
}
