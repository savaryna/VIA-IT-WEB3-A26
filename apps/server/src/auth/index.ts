import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { betterAuth } from 'better-auth'

import { config } from '../config'
import { db } from '../db/client'
import * as schema from '../db/schema/auth'

export const auth = betterAuth({
  baseURL: config.baseURL,
  secret: config.secret,
  trustedOrigins: config.origins,
  database: drizzleAdapter(db, { provider: 'sqlite', schema }),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  session: { cookieCache: { enabled: false } },
  advanced: { useSecureCookies: config.production },
})

export type AuthUser = typeof auth.$Infer.Session.user
