import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Room } from '../src/rooms/repository'
import { roomService } from '../src/rooms/service'

const storage = vi.hoisted(() => new Map<string, Room>())
vi.mock('../src/rooms/repository', () => ({
  roomRepository: {
    get: (id: string) => {
      const room = storage.get(id)
      return room && JSON.parse(JSON.stringify(room))
    },
    save: (room: Room) => storage.set(room.id, JSON.parse(JSON.stringify(room))),
  },
}))

function createRoom(): Room {
  return {
    id: 'room',
    ownerId: 'a',
    members: [
      { userId: 'a', name: 'A', seatIndex: 0 },
      { userId: 'b', name: 'B', seatIndex: 1 },
    ],
    capacity: 2,
    mode: 'score',
    targetScore: 500,
    status: 'playing',
    version: 1,
    updatedAt: 0,
    game: {
      players: ['A', 'B'],
      scores: [0, 0],
      mode: 'score' as const,
      roundNumber: 1,
      targetScore: 500,
      cardsPerPlayer: 7,
      currentRound: {
        players: ['A', 'B'],
        dealer: 1,
        playerInTurn: 0,
        hands: [
          [
            { type: 'SKIP', color: 'BLUE' },
            { type: 'NUMBERED', color: 'BLUE', number: 1 },
          ],
          [{ type: 'NUMBERED', color: 'RED', number: 2 }, { type: 'WILD' }],
        ],
        drawPile: Array.from({ length: 20 }, () => ({ type: 'NUMBERED', color: 'BLUE', number: 3 })),
        discardPile: [{ type: 'NUMBERED', color: 'BLUE', number: 5 }],
        currentColor: 'BLUE',
        currentDirection: 'clockwise',
      },
    },
  }
}

beforeEach(() => storage.clear())

describe('snapshot persistence', () => {
  it('rejects another player playing or drawing without persisting changes', () => {
    const saved = createRoom()
    storage.set('room', saved)
    expect(() => roomService.act('room', 'b', 1, { type: 'play', cardIndex: 0, sayUno: true })).toThrow(
      'It is not your turn',
    )
    expect(() => roomService.act('room', 'b', 1, { type: 'draw' })).toThrow('It is not your turn')
    expect(storage.get('room')).toEqual(saved)
  })

  it('uses engine declaration eligibility in actions and views', () => {
    const saved = createRoom()
    storage.set('room', saved)
    expect(roomService.get('room', 'a').round!.canSayUno).toBe(true)
    expect(roomService.get('room', 'b').round!.canSayUno).toBe(false)
    expect(() => roomService.act('room', 'b', 1, { type: 'sayUno' })).toThrow('UNO cannot be declared now')
    expect(storage.get('room')).toEqual(saved)

    roomService.act('room', 'a', 1, { type: 'play', cardIndex: 1 })
    expect(roomService.get('room', 'a').round!.canSayUno).toBe(true)
    const view = roomService.act('room', 'a', 2, { type: 'sayUno' })
    expect(view.round!.catchablePlayer).toBeUndefined()
    expect(view.round!.canSayUno).toBe(false)
    expect(view.version).toBe(3)
    expect(() => roomService.act('room', 'a', 3, { type: 'sayUno' })).toThrow('UNO cannot be declared now')
    expect(storage.get('room')!.version).toBe(3)
  })

  it('persists a declaration bundled with a valid play and rejects invalid plays', () => {
    const saved = createRoom()
    storage.set('room', saved)
    expect(() => roomService.act('room', 'a', 1, { type: 'play', cardIndex: 10, sayUno: true })).toThrow()
    expect(storage.get('room')).toEqual(saved)
    const view = roomService.act('room', 'a', 1, { type: 'play', cardIndex: 1, sayUno: true })
    expect(view.round!.hand).toHaveLength(1)
    expect(view.round!.catchablePlayer).toBeUndefined()
    expect(roomService.get('room', 'a').round).toEqual(view.round)
  })

  it('saves each action as a complete game without a replay log', () => {
    storage.set('room', createRoom())
    const view = roomService.act('room', 'a', 1, { type: 'draw' })
    expect(view.round!.mustPlayDrawn).toBe(true)
    const saved = storage.get('room')!
    expect(saved.game!.currentRound!.drawnCardIndex).toBe(2)
    expect(roomService.get('room', 'a').round).toEqual(view.round)
    expect(() => roomService.act('room', 'a', 2, { type: 'play', cardIndex: 0 })).toThrow()
    roomService.act('room', 'a', 2, { type: 'play', cardIndex: 2 })
    expect(roomService.get('room', 'a').round!.mustPlayDrawn).toBe(false)
  })

  it('uses engine UNO state for views and actions after a reload', () => {
    storage.set('room', createRoom())
    roomService.act('room', 'a', 1, { type: 'sayUno' })
    expect(roomService.get('room', 'a').round!.declaredUno).toBe(true)
    roomService.act('room', 'a', 2, { type: 'play', cardIndex: 0 })
    expect(roomService.get('room', 'b').round!.catchablePlayer).toBeUndefined()
    expect(() => roomService.act('room', 'b', 3, { type: 'catchUnoFailure', accused: 0 })).toThrow()
  })

  it('preserves missed-UNO and challenge windows in server views after reloading', () => {
    storage.set('room', createRoom())
    roomService.act('room', 'a', 1, { type: 'play', cardIndex: 0 })
    expect(roomService.get('room', 'b').round!.catchablePlayer).toBe(0)
    roomService.act('room', 'b', 2, { type: 'catchUnoFailure', accused: 0 })
    expect(roomService.get('room', 'a').round!.hand).toHaveLength(5)
    expect(roomService.get('room', 'b').round!.catchablePlayer).toBeUndefined()

    const saved = createRoom()
    saved.game!.currentRound!.hands[0] = [{ type: 'WILD DRAW' }, { type: 'NUMBERED', color: 'RED', number: 1 }]
    storage.set('room', saved)
    roomService.act('room', 'a', 1, { type: 'play', cardIndex: 0, newColor: 'RED' })
    expect(roomService.get('room', 'b').round!.canChallenge).toBe(true)
    roomService.act('room', 'b', 2, { type: 'challenge' })
    expect(roomService.get('room', 'b').round!.hand).toHaveLength(8)
    expect(roomService.get('room', 'b').round!.canChallenge).toBe(false)
  })

  it.each([true, false])('persists a bluff decision and privately shows challenge evidence (guilty: %s)', guilty => {
    const saved = createRoom()
    saved.game!.currentRound.hands[0] = [
      { type: 'WILD DRAW' },
      { type: 'NUMBERED', color: guilty ? 'BLUE' : 'RED', number: 1 },
    ]
    storage.set('room', saved)
    expect(roomService.get('room', 'a').round!.playableCardIndices).toContain(0)
    roomService.act('room', 'a', 1, { type: 'play', cardIndex: 0, newColor: 'RED' })
    const pending = roomService.get('room', 'b').round!
    expect(pending.turn).toBe(1)
    expect(pending.canChallenge).toBe(true)
    expect(pending.playableCardIndices).toEqual([])
    expect(pending.hand).toHaveLength(2)
    expect(pending.canSayUno).toBe(false)
    expect(() => roomService.act('room', 'a', 2, { type: 'draw' })).toThrow('It is not your turn')
    expect(() => roomService.act('room', 'b', 2, { type: 'play', cardIndex: 1, newColor: 'GREEN' })).toThrow()
    const resolved = roomService.act('room', 'b', 2, { type: 'challenge' }).round!
    expect(resolved.turn).toBe(guilty ? 1 : 0)
    expect(resolved.hand).toHaveLength(guilty ? 2 : 8)
    expect(resolved.challengeResult?.guilty).toBe(guilty)
    expect(resolved.challengeResult?.hand).toHaveLength(1)
    expect(roomService.get('room', 'b').round!.challengeResult).toEqual(resolved.challengeResult)
    expect(roomService.get('room', 'a').round!.challengeResult).toBeUndefined()
    expect(roomService.get('room', 'a').round!.hand).toHaveLength(guilty ? 5 : 1)
  })

  it('lets the affected player accept a saved bluff instead of challenging', () => {
    const saved = createRoom()
    saved.game!.currentRound.hands[0][0] = { type: 'WILD DRAW' }
    storage.set('room', saved)
    roomService.act('room', 'a', 1, { type: 'play', cardIndex: 0, newColor: 'RED' })
    const result = roomService.act('room', 'b', 2, { type: 'draw' }).round!
    expect(result.hand).toHaveLength(6)
    expect(result.turn).toBe(0)
    expect(result.canChallenge).toBe(false)
    expect(result.challengeResult).toBeUndefined()
  })

  it.each([1, 500])('persists round completion and scoring (target %i)', target => {
    const saved = createRoom()
    saved.targetScore = target
    saved.game!.targetScore = target
    saved.game!.currentRound!.hands[0] = [{ type: 'NUMBERED', color: 'BLUE', number: 1 }]
    storage.set('room', saved)
    const view = roomService.act('room', 'a', 1, { type: 'play', cardIndex: 0 })
    expect(view.round!.winner).toBe(0)
    expect(view.round!.gameWinner).toBe(target === 1 ? 0 : undefined)
    expect(roomService.get('room', 'a').round).toEqual(view.round)
    expect(view.members[0].score).toBe(52)
    expect(view.roundNumber).toBe(1)
    expect(storage.get('room')!.game!.currentRound.dealer).toBe(1)
    expect(storage.get('room')!.game!.currentRound.hands[0]).toEqual([])
    expect(() => roomService.act('room', 'a', 2, { type: 'draw' })).toThrow('Game is not playing')
    if (target === 1) {
      expect(view.status).toBe('finished')
      expect(storage.get('room')!.game!.currentRound.hands[0]).toEqual([])
      expect(view.round!.gameWinner).toBe(0)
      expect(() => roomService.next('room', 'a', 2)).toThrow('Round is not complete')
    } else {
      expect(view.status).toBe('between')
      const completedRound = storage.get('room')!.game!.currentRound
      expect(roomService.get('room', 'a').members[0].score).toBe(52)
      expect(storage.get('room')!.game!.currentRound).toEqual(completedRound)
      expect(() => roomService.next('room', 'b', 2)).toThrow('Only the room owner')
      const resumed = roomService.next('room', 'a', 2)
      expect(resumed.status).toBe('playing')
      expect(resumed.roundNumber).toBe(2)
      expect(storage.get('room')!.game!.roundNumber).toBe(2)
      expect(resumed.round!.winner).toBeUndefined()
      expect(resumed.members[0].score).toBe(52)
      expect(storage.get('room')!.game!.currentRound.dealer).toBe(0)
      expect(roomService.get('room', 'a').round).toEqual(resumed.round)
    }
  })
  it('keeps single-round results in the game snapshot without starting another round', () => {
    const saved = createRoom()
    saved.mode = 'round'
    saved.game!.mode = 'round'
    saved.game!.currentRound.hands[0] = [{ type: 'NUMBERED', color: 'BLUE', number: 1 }]
    storage.set('room', saved)
    const view = roomService.act('room', 'a', 1, { type: 'play', cardIndex: 0 })
    expect(view.status).toBe('finished')
    expect(view.round!.winner).toBe(0)
    expect(view.round!.gameWinner).toBe(0)
    expect(view.members[0].score).toBe(52)
    expect(view.roundNumber).toBe(1)
    expect(roomService.get('room', 'a')).toEqual(view)
    expect(storage.get('room')!.game!.currentRound.hands[0]).toEqual([])
    expect(() => roomService.next('room', 'a', 2)).toThrow('Round is not complete')
  })
  it('shares engine setting rules but keeps a four-player server limit', () => {
    const user = {
      id: 'a',
      name: 'A',
      email: 'a@example.com',
      emailVerified: false,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    expect(roomService.create(user, 'score', 500, 4).capacity).toBe(4)
    expect(() => roomService.create(user, 'score', 500, 5)).toThrow('Choose 2–4 players')
    for (const target of [0, -1, 0.5, Infinity]) {
      expect(() => roomService.create(user, 'score', target, 2)).toThrow('Target score must be a positive safe integer')
    }
  })
})
