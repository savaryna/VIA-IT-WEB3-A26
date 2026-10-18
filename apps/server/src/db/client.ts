import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'

import { config } from '../config'
import * as schema from './schema'

// Create the database directory if it doesn't exist
mkdirSync(dirname(config.databasePath), { recursive: true })

export const sqlite = new Database(config.databasePath)

// Set SQLite pragmas for better performance and foreign key support
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })
