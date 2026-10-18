import { events, roomTopic } from './events'
import { roomRepository } from './repository'

const connections = new Map<string, Map<string, number>>()

export function isConnected(roomId: string, userId: string) {
  return (connections.get(roomId)?.get(userId) ?? 0) > 0
}

function notify(roomId: string) {
  const room = roomRepository.get(roomId)
  if (room) void events.publish(roomTopic(roomId), { roomChanged: room })
}

export function connectPlayer(roomId: string, userId: string) {
  let players = connections.get(roomId)

  if (!players) {
    players = new Map()
    connections.set(roomId, players)
  }

  const count = players.get(userId) ?? 0
  players.set(userId, count + 1)

  if (count === 0) notify(roomId)

  let disconnected = false

  return () => {
    if (disconnected) return
    disconnected = true
    const remaining = players.get(userId)! - 1
    if (remaining > 0) {
      players.set(userId, remaining)
      return
    }

    players.delete(userId)

    if (players.size === 0) connections.delete(roomId)

    notify(roomId)
  }
}
