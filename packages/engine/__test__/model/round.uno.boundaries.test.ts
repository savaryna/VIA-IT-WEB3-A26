import { describe, expect, it } from 'vitest'

import { createRoundFromMemento as fromMemento } from '../utils/test_adapter'

function createRound() {
  return fromMemento({
    players: ['a', 'b'],
    dealer: 1,
    playerInTurn: 0,
    hands: [
      [
        { type: 'SKIP', color: 'BLUE' },
        { type: 'NUMBERED', color: 'BLUE', number: 1 },
      ],
      [{ type: 'NUMBERED', color: 'RED', number: 2 }],
    ],
    drawPile: Array.from({ length: 8 }, () => ({ type: 'NUMBERED', color: 'GREEN', number: 3 })),
    discardPile: [{ type: 'NUMBERED', color: 'BLUE', number: 3 }],
    currentColor: 'BLUE',
    currentDirection: 'clockwise',
  })
}

describe('UNO boundary behaviour', () => {
  it('reports whether a declaration is allowed and whether it succeeded', () => {
    const round = createRound()
    const before = round.toMemento()
    expect(round.canSayUno(1)).toBe(false)
    expect(round.sayUno(1)).toBe(false)
    expect(round.toMemento()).toEqual(before)
    expect(round.canSayUno(0)).toBe(true)
    expect(round.sayUno(0)).toBe(true)
    expect(round.declaredUno()).toBe(0)
    round.play(1)
    expect(round.canSayUno(0)).toBe(false)
    expect(round.sayUno(0)).toBe(false)
  })

  it('allows a missed declaration to be corrected outside the player turn', () => {
    const round = createRound()
    round.play(1)
    expect(round.playerInTurn()).toBe(1)
    expect(round.canSayUno(0)).toBe(true)
    expect(round.sayUno(0)).toBe(true)
    expect(round.catchablePlayer()).toBeUndefined()
    expect(round.canSayUno(0)).toBe(false)
    expect(round.sayUno(0)).toBe(false)
  })

  it('reports no declarations available after round completion', () => {
    const round = createRound()
    round.play(0)
    round.play(0)
    expect(round.hasEnded()).toBe(true)
    expect(round.canSayUno(0)).toBe(false)
    expect(round.canSayUno(1)).toBe(false)
    expect(() => round.sayUno(0)).toThrow('The round has ended')
  })

  it('can declare UNO as part of a play', () => {
    const round = createRound()
    round.play(1, undefined, { sayUno: true })
    expect(round.playerHand(0)).toHaveLength(1)
    expect(round.catchablePlayer()).toBeUndefined()
    expect(round.catchUnoFailure({ accuser: 1, accused: 0 })).toBe(false)
  })

  it('does not remember an accompanying declaration when the play is rejected', () => {
    const round = createRound()
    const before = round.toMemento()
    expect(() => round.play(10, undefined, { sayUno: true })).toThrow('Card index is out of bounds')
    expect(round.toMemento()).toEqual(before)
    expect(() => round.play(1, 'RED', { sayUno: true })).toThrow('Only wild cards can name a new color')
    expect(round.toMemento()).toEqual(before)
    round.play(1)
    expect(round.catchUnoFailure({ accuser: 1, accused: 0 })).toBe(true)
  })

  it('keeps a missed-UNO window open after a rejected play with a declaration', () => {
    const round = createRound()
    round.play(0)
    const before = round.toMemento()
    expect(() => round.play(10, undefined, { sayUno: true })).toThrow()
    expect(round.toMemento()).toEqual(before)
    expect(round.catchUnoFailure({ accuser: 1, accused: 0 })).toBe(true)
  })

  it('allows catching a player who retained the turn after a skip', () => {
    const round = createRound()
    round.play(0)
    expect(round.playerInTurn()).toBe(0)
    expect(round.catchUnoFailure({ accuser: 1, accused: 0 })).toBe(true)
    expect(round.playerHand(0)).toHaveLength(5)
    expect(round.playerInTurn()).toBe(0)
  })

  it('keeps the accusation window open after a rejected move or wrong accusation', () => {
    const round = createRound()
    round.play(0)
    expect(() => round.play(10)).toThrow()
    expect(round.catchUnoFailure({ accuser: 0, accused: 1 })).toBe(false)
    expect(round.catchUnoFailure({ accuser: 1, accused: 0 })).toBe(true)
  })

  it('allows self-correction without drawing a penalty', () => {
    const round = createRound()
    round.play(0)
    expect(round.catchUnoFailure({ accuser: 0, accused: 0 })).toBe(false)
    round.sayUno(0)
    expect(round.catchUnoFailure({ accuser: 1, accused: 0 })).toBe(false)
    expect(round.playerHand(0)).toHaveLength(1)
  })

  it('rejects invalid accusers and fractional player indexes', () => {
    const round = createRound()
    for (const player of [-1, 2, 0.5, NaN]) {
      expect(() => round.canSayUno(player)).toThrow()
      expect(() => round.sayUno(player)).toThrow()
      expect(() => round.catchUnoFailure({ accuser: player, accused: 0 })).toThrow()
    }
  })
})
