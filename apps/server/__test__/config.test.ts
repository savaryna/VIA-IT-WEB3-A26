import { resolve } from 'node:path'
import { loadEnvFile } from 'node:process'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('node:process', () => ({ loadEnvFile: vi.fn() }))

const environment = {
  NODE_ENV: 'development',
  PORT: '3000',
  CLIENT_ORIGINS: 'http://localhost:5173, https://example-tunnel.trycloudflare.com/',
  DATABASE_PATH: 'data/test.sqlite',
  BETTER_AUTH_URL: 'http://localhost:3000',
  BETTER_AUTH_SECRET: 'a'.repeat(32),
}

beforeEach(() => {
  vi.resetModules()
  vi.mocked(loadEnvFile).mockReset()
  for (const [key, value] of Object.entries(environment)) vi.stubEnv(key, value)
})

afterEach(() => vi.unstubAllEnvs())

describe('required server configuration', () => {
  it('loads the server .env and resolves its database path independently of the working directory', async () => {
    const { config } = await import('../src/config')
    expect(loadEnvFile).toHaveBeenCalledWith(resolve(import.meta.dirname, '../.env'))
    expect(config).toMatchObject({
      port: 3000,
      production: false,
      origins: ['http://localhost:5173', 'https://example-tunnel.trycloudflare.com'],
      baseURL: 'http://localhost:3000',
      databasePath: resolve(import.meta.dirname, '../data/test.sqlite'),
    })
  })

  it('requires a .env file even when the process has configuration values', async () => {
    vi.mocked(loadEnvFile).mockImplementation(() => {
      throw new Error('ENOENT')
    })
    await expect(import('../src/config')).rejects.toThrow('Cannot load apps/server/.env')
  })

  it.each(Object.keys(environment))('rejects a missing %s', async key => {
    vi.stubEnv(key, undefined)
    await expect(import('../src/config')).rejects.toThrow(`Missing ${key}`)
  })

  it.each(Object.keys(environment))('rejects a blank %s', async key => {
    vi.stubEnv(key, '   ')
    await expect(import('../src/config')).rejects.toThrow(`Missing ${key}`)
  })

  it.each(['development', 'production', 'test'])('requires a strong secret in %s', async mode => {
    vi.stubEnv('NODE_ENV', mode)
    vi.stubEnv('BETTER_AUTH_SECRET', 'short-secret')
    await expect(import('../src/config')).rejects.toThrow('BETTER_AUTH_SECRET must contain at least 32 characters')
  })

  it('enables secure-cookie mode in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect((await import('../src/config')).config.production).toBe(true)
  })

  it.each(['0', '65536', '3000.5', 'not-a-port', 'Infinity'])('rejects invalid port %s', async port => {
    vi.stubEnv('PORT', port)
    await expect(import('../src/config')).rejects.toThrow('PORT must be an integer between 1 and 65535')
  })

  it('rejects an unrecognized environment', async () => {
    vi.stubEnv('NODE_ENV', 'prod')
    await expect(import('../src/config')).rejects.toThrow('NODE_ENV must be development, production, or test')
  })

  it.each([
    ['BETTER_AUTH_URL', 'localhost:3000'],
    ['BETTER_AUTH_URL', 'ftp://example.com'],
    ['BETTER_AUTH_URL', 'http://user:password@example.com'],
    ['CLIENT_ORIGINS', 'http://localhost:5173,'],
    ['CLIENT_ORIGINS', 'http://localhost:5173/path'],
    ['CLIENT_ORIGINS', 'https://example.com?query=1'],
  ])('rejects invalid %s value %s', async (key, value) => {
    vi.stubEnv(key, value)
    await expect(import('../src/config')).rejects.toThrow(key)
  })
})
