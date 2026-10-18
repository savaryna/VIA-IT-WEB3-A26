import { defineConfig } from 'drizzle-kit'

import { config } from './src/config'

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema',
  out: './drizzle',
  dbCredentials: { url: config.databasePath },
})
