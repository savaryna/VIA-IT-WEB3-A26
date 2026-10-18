import { resolve } from 'node:path'
import { loadEnvFile } from 'node:process'
import { fileURLToPath } from 'node:url'

import { z } from 'zod'

const serverDirectory = fileURLToPath(new URL('..', import.meta.url))
try {
  loadEnvFile(resolve(serverDirectory, '.env'))
} catch (cause) {
  throw new Error('Cannot load apps/server/.env. Copy .env.example to .env and configure all required values.', {
    cause,
  })
}

function required(name: string) {
  const message = `Missing ${name} in apps/server/.env`
  return z.string({ error: message }).trim().min(1, message)
}

function httpURL(name: string) {
  return required(name)
    .pipe(z.url({ protocol: /^https?$/, error: `${name} must be an absolute HTTP or HTTPS URL` }))
    .transform(value => new URL(value))
    .refine(url => !url.username && !url.password && !url.search && !url.hash, {
      error: `${name} must be an HTTP or HTTPS URL without credentials, a query, or a fragment`,
    })
}

const portMessage = 'PORT must be an integer between 1 and 65535'
const environmentSchema = z.object({
  NODE_ENV: required('NODE_ENV').pipe(
    z.enum(['development', 'production', 'test'], {
      error: 'NODE_ENV must be development, production, or test',
    }),
  ),
  PORT: required('PORT')
    .regex(/^\d+$/, portMessage)
    .transform(Number)
    .pipe(z.number().int(portMessage).min(1, portMessage).max(65535, portMessage)),
  CLIENT_ORIGINS: required('CLIENT_ORIGINS')
    .transform(value => value.split(',').map(origin => origin.trim()))
    .pipe(
      z.array(
        httpURL('CLIENT_ORIGINS')
          .refine(url => url.pathname === '/', {
            error: 'CLIENT_ORIGINS entries must be origins without a path',
          })
          .transform(url => url.origin),
      ),
    ),
  BETTER_AUTH_URL: httpURL('BETTER_AUTH_URL').transform(url => url.href.replace(/\/$/, '')),
  BETTER_AUTH_SECRET: required('BETTER_AUTH_SECRET').min(
    32,
    'BETTER_AUTH_SECRET must contain at least 32 characters in every environment',
  ),
  DATABASE_PATH: required('DATABASE_PATH').transform(value => resolve(serverDirectory, value)),
})

const result = environmentSchema.safeParse(process.env)
// Report field errors without including environment values (especially secrets).
if (!result.success) throw new Error(result.error.issues[0]!.message)
const env = result.data
export const config = {
  port: env.PORT,
  origins: env.CLIENT_ORIGINS,
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  databasePath: env.DATABASE_PATH,
  production: env.NODE_ENV === 'production',
}
