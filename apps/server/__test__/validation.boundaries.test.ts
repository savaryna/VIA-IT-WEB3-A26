import {
  createGame,
  createGameFromMemento,
  createDeckFromMemento,
  createHandFromMemento,
  createRoundFromMemento,
} from '@uno/engine/oo'
import { describe, expect, it } from 'vitest'
import { ZodError } from 'zod'

import { createRoomSchema, playerActionSchema } from '../src/rooms/inputs'

describe('untrusted snapshot boundaries', () => {
  it.each([null, {}, { players: null }, { players: [42] }])(
    'rejects malformed games with validation errors: %j',
    input => {
      expect(() => createGameFromMemento(input)).toThrow(ZodError)
    },
  )

  it('rejects malformed nested snapshots before restoration', () => {
    const snapshot = createGame().toMemento()
    expect(() =>
      createGameFromMemento({ ...snapshot, currentRound: { ...snapshot.currentRound, hands: [null] } }),
    ).toThrow(ZodError)
    expect(() => createRoundFromMemento({ ...snapshot.currentRound, wildDrawResult: null })).toThrow(ZodError)
    expect(() => createDeckFromMemento([null])).toThrow(ZodError)
    expect(() => createHandFromMemento('not an array')).toThrow(ZodError)
  })

  it('rejects inconsistent engine state after parsing its structure', () => {
    const snapshot = createGame().toMemento()
    expect(() => createRoundFromMemento({ ...snapshot.currentRound, dealer: -1 })).toThrow(
      'Dealer index is out of bounds',
    )
    expect(() => createGameFromMemento({ ...snapshot, currentRound: { ...snapshot.currentRound, hands: [] } })).toThrow(
      'Each player must have one hand',
    )
  })

  it('retains domain invariants after structural validation', () => {
    const snapshot = createGame().toMemento()
    expect(() => createGameFromMemento({ ...snapshot, scores: [] })).toThrow(
      'Each player must have a nonnegative score',
    )
    expect(createGameFromMemento(JSON.parse(JSON.stringify(snapshot))).toMemento()).toEqual(snapshot)
  })
})

describe('action and room input boundaries', () => {
  it.each([
    { type: 'play' },
    { type: 'play', cardIndex: -1 },
    { type: 'play', cardIndex: 0.5 },
    { type: 'play', cardIndex: 0, newColor: 'PURPLE' },
    { type: 'catchUnoFailure', accused: null },
    { type: 'catchUnoFailure', accused: -1 },
    { type: 'unknown' },
  ])('rejects invalid actions: %j', action => {
    expect(playerActionSchema.safeParse(action).success).toBe(false)
  })

  it('preserves GraphQL null defaults and ignores fields irrelevant to an action', () => {
    expect(playerActionSchema.parse({ type: 'play', cardIndex: 0, newColor: null, sayUno: null })).toEqual({
      type: 'play',
      cardIndex: 0,
      newColor: undefined,
      sayUno: false,
    })
    expect(playerActionSchema.parse({ type: 'draw', cardIndex: 99 })).toEqual({ type: 'draw' })
  })

  it('uses room limits instead of engine player limits', () => {
    expect(createRoomSchema.safeParse({ mode: 'score', targetScore: 500, capacity: 5 }).success).toBe(false)
    expect(createRoomSchema.safeParse({ mode: 'score', targetScore: '500', capacity: 2 }).success).toBe(false)
  })
})
