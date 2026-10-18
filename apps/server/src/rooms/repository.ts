import { and, asc, desc, eq, inArray } from 'drizzle-orm'

import { db } from '../db/client'
import { rooms, participants, user } from '../db/schema'

function withMembers(row: typeof rooms.$inferSelect) {
  const members = db
    .select({ userId: participants.userId, name: user.name, seatIndex: participants.seatIndex })
    .from(participants)
    .innerJoin(user, eq(user.id, participants.userId))
    .where(eq(participants.roomId, row.id))
    .orderBy(asc(participants.seatIndex))
    .all()
  return { ...row, members }
}

export const roomRepository = {
  get(id: string) {
    const row = db.select().from(rooms).where(eq(rooms.id, id)).get()
    return row && withMembers(row)
  },
  forUser(userId: string) {
    return db
      .select({ room: rooms })
      .from(rooms)
      .innerJoin(participants, eq(participants.roomId, rooms.id))
      .where(and(eq(participants.userId, userId), inArray(rooms.status, ['waiting', 'playing', 'between'])))
      .orderBy(desc(rooms.updatedAt))
      .all()
      .map(row => withMembers(row.room))
  },
  save(room: Room) {
    const { members, ...row } = room
    row.updatedAt = Date.now()
    db.transaction(tx => {
      tx.insert(rooms).values(row).onConflictDoUpdate({ target: rooms.id, set: row }).run()
      for (const member of members) {
        tx.insert(participants)
          .values({ roomId: room.id, userId: member.userId, seatIndex: member.seatIndex })
          .onConflictDoNothing({ target: [participants.roomId, participants.userId] })
          .run()
      }
    })
  },
}

export type Room = ReturnType<typeof withMembers>
