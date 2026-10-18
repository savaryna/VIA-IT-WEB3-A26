import type { GameMemento } from '@uno/engine'
import type { GameMode } from '@uno/engine'
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

import type { RoomStatus } from '../../graphql/generated'
import { user } from './auth'

export const rooms = sqliteTable('rooms', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id')
    .notNull()
    .references(() => user.id),
  status: text('status').$type<RoomStatus>().notNull(),
  capacity: integer('capacity').notNull(),
  mode: text('mode').$type<GameMode>().notNull(),
  targetScore: integer('target_score').notNull(),
  version: integer('version').notNull(),
  game: text('game', { mode: 'json' }).$type<GameMemento>(),
  updatedAt: integer('updated_at').notNull(),
})

export const participants = sqliteTable(
  'participants',
  {
    roomId: text('room_id')
      .notNull()
      .references(() => rooms.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    seatIndex: integer('seat_index').notNull(),
  },
  table => [
    primaryKey({ columns: [table.roomId, table.userId] }),
    index('participant_user_idx').on(table.userId),
    uniqueIndex('participant_seat_idx').on(table.roomId, table.seatIndex),
  ],
)
