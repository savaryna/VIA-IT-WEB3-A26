import { fileURLToPath } from 'node:url'

import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

import { db, sqlite } from './client'

try {
  migrate(db, { migrationsFolder: fileURLToPath(new URL('../../drizzle', import.meta.url)) })
  if (sqlite.prepare('PRAGMA foreign_key_check').all().length > 0) throw new Error('Database foreign key check failed')
  console.info('Database migrations applied')
} finally {
  sqlite.close()
}
