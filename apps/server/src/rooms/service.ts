import { randomUUID } from 'node:crypto'

import type { Game } from '@uno/engine'
import type { GameMode } from '@uno/engine'
import { createGame, createGameFromMemento } from '@uno/engine/oo'
import { GraphQLError } from 'graphql'

import type { AuthUser } from '../auth'
import { events, roomTopic } from './events'
import { createRoomSchema, type PlayerAction } from './inputs'
import { isConnected } from './presence'
import { roomRepository, type Room } from './repository'

function fail(message: string, code = 'BAD_USER_INPUT'): never {
  throw new GraphQLError(message, { extensions: { code } })
}

export function requireRoom(id: string, userId: string): Room {
  const room = roomRepository.get(id)
  if (!room) fail('Room not found', 'NOT_FOUND')
  if (!room.members.some(member => member.userId === userId)) fail('You are not a participant', 'FORBIDDEN')
  return room
}

function restoreGame(room: Room): Game {
  if (!room.game) fail('Game has not started')
  return createGameFromMemento(room.game)
}

function owner(room: Room, userId: string) {
  if (room.ownerId !== userId) fail('Only the room owner can do that', 'FORBIDDEN')
}

function current(room: Room, version: number) {
  if (room.version !== version) fail('The room changed. Please try again.', 'CONFLICT')
}

export function viewRoom(room: Room, userId: string, game = room.game ? restoreGame(room) : undefined) {
  const localPlayer = room.members.findIndex(member => member.userId === userId)
  if (localPlayer < 0) fail('You are not a participant', 'FORBIDDEN')
  const scores = room.members.map((_, index) => game?.score(index) ?? 0)
  const round = game?.currentRound()
  const hand = round?.playerHand(localPlayer) ?? []

  return {
    id: room.id,
    ownerId: room.ownerId,
    status: room.status,
    version: room.version,
    mode: room.mode,
    targetScore: room.targetScore,
    capacity: room.capacity,
    roundNumber: game?.roundNumber ?? 0,
    localPlayer,
    members: room.members.map((member, index) => ({
      userId: member.userId,
      name: member.name,
      score: scores[index],
      connected: isConnected(room.id, member.userId),
    })),
    round:
      round && game
        ? {
            players: room.members.map((member, index) => ({
              name: member.name,
              connected: isConnected(room.id, member.userId),
              cardCount: round.playerHand(index).length,
              score: scores[index],
            })),
            hand: hand.map(card => ({ ...card })),
            playableCardIndices: round.playableCardIndices(localPlayer),
            turn: round.playerInTurn(),
            discardTop: { ...round.discardPile().top()! },
            color: round.currentColor(),
            direction: round.currentDirection(),
            drawPileSize: round.drawPile().size,
            mustPlayDrawn: round.mustPlayDrawn(),
            declaredUno: round.declaredUno() === localPlayer,
            canSayUno: round.canSayUno(localPlayer),
            catchablePlayer: round.catchablePlayer(),
            challengeResult: round.challengeResult(localPlayer),
            canChallenge: round.challenger() === localPlayer,
            winner: round.winner(),
            score: round.score(),
            gameWinner: game.winner(),
          }
        : null,
  }
}

function commit(room: Room, game?: Game) {
  if (game) room.game = game.toMemento()
  room.version++
  roomRepository.save(room)
  void events.publish(roomTopic(room.id), { roomChanged: room })
}

export const roomService = {
  list(userId: string) {
    return roomRepository.forUser(userId).map(room => viewRoom(room, userId))
  },
  get(id: string, userId: string) {
    return viewRoom(requireRoom(id, userId), userId)
  },
  create(user: AuthUser, mode: GameMode, targetScore: number, capacity: number) {
    const settings = createRoomSchema.safeParse({ mode, targetScore, capacity })
    if (!settings.success) fail(settings.error.issues[0]!.message)
    const room: Room = {
      id: randomUUID(),
      ownerId: user.id,
      mode,
      targetScore,
      capacity,
      members: [{ userId: user.id, name: user.name, seatIndex: 0 }],
      status: 'waiting',
      version: 0,
      updatedAt: Date.now(),
      game: null,
    }
    commit(room)
    return viewRoom(room, user.id)
  },
  join(id: string, user: AuthUser) {
    const room = roomRepository.get(id)
    if (!room) fail('Room not found', 'NOT_FOUND')
    if (room.status === 'finished') fail('This game has finished')
    if (room.members.some(member => member.userId === user.id)) return viewRoom(room, user.id)
    if (room.status !== 'waiting') fail('This game has already started')
    if (room.members.length >= room.capacity) fail('This room is full')
    room.members.push({ userId: user.id, name: user.name, seatIndex: room.members.length })
    commit(room)
    return viewRoom(room, user.id)
  },
  start(id: string, userId: string, version: number) {
    const room = requireRoom(id, userId)
    owner(room, userId)
    current(room, version)
    if (room.status !== 'waiting' || room.members.length !== room.capacity) fail('Wait for all players to join')
    const game = createGame({
      mode: room.mode,
      players: room.members.map(member => member.name),
      targetScore: room.targetScore,
    })
    room.status = 'playing'
    commit(room, game)
    return viewRoom(room, userId, game)
  },
  act(id: string, userId: string, version: number, action: PlayerAction) {
    const room = requireRoom(id, userId)
    const player = room.members.findIndex(member => member.userId === userId)
    current(room, version)
    if (room.status !== 'playing') fail('Game is not playing')
    const game = restoreGame(room)
    try {
      const round = game.currentRound()
      switch (action.type) {
        case 'play':
          if (round.playerInTurn() !== player) throw new Error('It is not your turn')
          round.play(action.cardIndex, action.newColor, { sayUno: action.sayUno })
          break
        case 'draw':
          if (round.playerInTurn() !== player) throw new Error('It is not your turn')
          round.draw()
          break
        case 'sayUno':
          if (!round.sayUno(player)) throw new Error('UNO cannot be declared now')
          break
        case 'catchUnoFailure':
          if (!round.catchUnoFailure({ accuser: player, accused: action.accused })) {
            throw new Error('No UNO failure to catch')
          }
          break
        case 'challenge':
          round.challengeWildDrawFour(player)
          break
        default:
          throw new Error('Unknown action')
      }
    } catch (cause) {
      fail(cause instanceof Error ? cause.message : 'Invalid action')
    }
    if (game.currentRound().hasEnded()) {
      room.status = game.winner() !== undefined ? 'finished' : 'between'
    }
    commit(room, game)
    return viewRoom(room, userId, game)
  },
  next(id: string, userId: string, version: number) {
    const room = requireRoom(id, userId)
    owner(room, userId)
    current(room, version)
    if (room.status !== 'between') fail('Round is not complete')
    const game = restoreGame(room)
    game.startNextRound()
    room.status = 'playing'
    commit(room, game)
    return viewRoom(room, userId, game)
  },
}

export type RoomView = ReturnType<typeof viewRoom>
