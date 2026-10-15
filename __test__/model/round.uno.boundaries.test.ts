import { describe, expect, it } from 'vitest'

import { fromMemento } from '../../src/model/round'

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
      expect(() => round.sayUno(player)).toThrow()
      expect(() => round.catchUnoFailure({ accuser: player, accused: 0 })).toThrow()
    }
  })
})
