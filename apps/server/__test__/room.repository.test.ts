import { fileURLToPath } from 'node:url'

import { createGameFromMemento } from '@uno/engine/oo'
import { eq } from 'drizzle-orm'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { db, sqlite } from '../src/db/client'
import { rooms, participants, user } from '../src/db/schema'
import { roomRepository } from '../src/rooms/repository'
import { roomService } from '../src/rooms/service'

vi.mock('../src/db/client', async () => {
  const { default: Database } = await import('better-sqlite3')
  const { drizzle } = await import('drizzle-orm/better-sqlite3')
  const { migrate } = await import('drizzle-orm/better-sqlite3/migrator')
  const schema = await import('../src/db/schema')
  const testSqlite = new Database(':memory:')
  const testDb = drizzle(testSqlite, { schema })
  migrate(testDb, { migrationsFolder: fileURLToPath(new URL('../drizzle', import.meta.url)) })
  testSqlite.pragma('foreign_keys = ON')
  return { sqlite: testSqlite, db: testDb }
})

function createUser(id: string, name: string) {
  return db
    .insert(user)
    .values({ id, name, email: `${id}@example.com` })
    .returning()
    .get()
}

beforeEach(() => {
  db.delete(participants).run()
  db.delete(rooms).run()
  db.delete(user).run()
})
afterAll(() => sqlite.close())

describe('relational rooms and engine mementos', () => {
  it('stores lobby metadata in columns and derives ordered members from participants and users', () => {
    const a = createUser('a', 'Alice')
    const b = createUser('b', 'Bob')
    const created = roomService.create(a, 'score', 500, 2)
    roomService.join(created.id, b)
    const room = roomRepository.get(created.id)!
    expect(room.game).toBeNull()
    expect(room).toMatchObject({ ownerId: 'a', capacity: 2, mode: 'score', targetScore: 500, version: 2 })
    expect(room.members).toEqual([
      { userId: 'a', name: 'Alice', seatIndex: 0 },
      { userId: 'b', name: 'Bob', seatIndex: 1 },
    ])

    // Insertion order must not determine which engine hand belongs to a user.
    db.delete(participants).run()
    roomRepository.save({ ...room, members: [room.members[1], room.members[0]] })
    expect(roomRepository.get(created.id)!.members).toEqual(room.members)
    db.update(user).set({ name: 'Alicia' }).where(eq(user.id, 'a')).run()
    expect(roomRepository.get(created.id)!.members[0].name).toBe('Alicia')
    expect(roomService.list('a').map(view => view.id)).toEqual([created.id])
    expect(roomService.list('b').map(view => view.id)).toEqual([created.id])
    expect(roomService.list('outsider')).toEqual([])
  })

  it('saves only the engine memento and restores actions without rewriting membership', () => {
    const a = createUser('a', 'Alice')
    const b = createUser('b', 'Bob')
    const created = roomService.create(a, 'score', 500, 2)
    roomService.join(created.id, b)
    roomService.start(created.id, 'a', 2)
    const room = roomRepository.get(created.id)!
    expect(room.game).toEqual(createGameFromMemento(room.game!).toMemento())
    expect(room.game).not.toHaveProperty('ownerId')
    expect(room.game).not.toHaveProperty('members')
    const player = room.game!.currentRound.playerInTurn!
    const { userId } = room.members[player]
    const game = createGameFromMemento(room.game!)
    game.currentRound().draw()
    const expected = game.toMemento()

    sqlite.exec(
      "CREATE TRIGGER preserve_members BEFORE DELETE ON participants BEGIN SELECT RAISE(ABORT, 'Membership was deleted'); END",
    )
    try {
      const view = roomService.act(room.id, userId, room.version, { type: 'draw' })
      expect(roomRepository.get(room.id)!.game).toEqual(expected)
      expect(roomService.get(room.id, userId).round).toEqual(view.round)
      expect(roomService.join(room.id, userId === 'a' ? a : b)).toEqual(view)
      expect(roomRepository.get(room.id)!.members).toEqual(room.members)
    } finally {
      sqlite.exec('DROP TRIGGER preserve_members')
    }
  })

  it('restores UNO windows and scores completed rounds once from engine mementos', () => {
    const a = createUser('a', 'Alice')
    const b = createUser('b', 'Bob')
    const created = roomService.create(a, 'score', 500, 2)
    roomService.join(created.id, b)
    roomService.start(created.id, 'a', 2)
    const room = roomRepository.get(created.id)!
    room.game!.currentRound = {
      players: ['Alice', 'Bob'],
      dealer: 1,
      playerInTurn: 0,
      hands: [
        [
          { type: 'SKIP', color: 'BLUE' },
          { type: 'NUMBERED', color: 'BLUE', number: 1 },
        ],
        [{ type: 'NUMBERED', color: 'RED', number: 2 }, { type: 'WILD' }],
      ],
      drawPile: Array.from({ length: 10 }, () => ({ type: 'NUMBERED', color: 'GREEN', number: 3 })),
      discardPile: [{ type: 'NUMBERED', color: 'BLUE', number: 5 }],
      currentColor: 'BLUE',
      currentDirection: 'clockwise',
    }
    roomRepository.save(room)
    roomService.act(room.id, 'a', 3, { type: 'play', cardIndex: 0 })
    expect(roomService.get(room.id, 'b').round!.catchablePlayer).toBe(0)
    roomService.act(room.id, 'a', 4, { type: 'sayUno' })
    expect(roomRepository.get(room.id)!.game!.currentRound.unoFailure).toBeUndefined()
    const finished = roomService.act(room.id, 'a', 5, { type: 'play', cardIndex: 0 })
    expect(finished.status).toBe('between')
    expect(finished.members.map(member => member.score)).toEqual([52, 0])
    expect(roomService.get(room.id, 'a').members.map(member => member.score)).toEqual([52, 0])
    expect(roomService.join(room.id, a)).toEqual(finished)
    expect(roomRepository.get(room.id)!.version).toBe(6)
    const resumed = roomService.next(room.id, 'a', 6)
    expect(resumed.roundNumber).toBe(2)
    expect(resumed.members.map(member => member.score)).toEqual([52, 0])
    expect(roomRepository.get(room.id)!.game!.scores).toEqual([52, 0])
    expect(sqlite.prepare('PRAGMA foreign_key_check').all()).toEqual([])
  })

  it('enforces one user per room and one player per seat', () => {
    const a = createUser('a', 'Alice')
    createUser('b', 'Bob')
    const room = roomService.create(a, 'round', 500, 2)
    expect(() => db.insert(participants).values({ roomId: room.id, userId: 'b', seatIndex: 0 }).run()).toThrow()
    expect(() => db.insert(participants).values({ roomId: room.id, userId: 'a', seatIndex: 1 }).run()).toThrow()
    expect(() => db.insert(participants).values({ roomId: room.id, userId: 'missing', seatIndex: 1 }).run()).toThrow()
  })
})
