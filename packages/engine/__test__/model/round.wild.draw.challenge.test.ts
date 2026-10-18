import { describe, expect, it } from 'vitest'

import type { RoundMemento } from '../../src/index'
import { createRoundFromMemento } from '../utils/test_adapter'

function setup(guilty = true, currentDirection = 'clockwise', players = ['A', 'B', 'C']) {
  const state: RoundMemento = {
    players,
    dealer: players.length - 1,
    playerInTurn: 0,
    currentDirection,
    currentColor: 'BLUE',
    discardPile: [{ type: 'NUMBERED', color: 'BLUE', number: 5 }],
    hands: players.map((_, index) =>
      index === 0
        ? [{ type: 'WILD DRAW' }, { type: 'NUMBERED', color: guilty ? 'BLUE' : 'RED', number: 5 }]
        : [{ type: 'WILD' }, { type: 'NUMBERED', color: 'GREEN', number: 1 }],
    ),
    drawPile: Array.from({ length: 30 }, () => ({ type: 'NUMBERED', color: 'YELLOW', number: 2 })),
  }
  return createRoundFromMemento(state)
}
const reload = (round: ReturnType<typeof setup>) =>
  createRoundFromMemento(JSON.parse(JSON.stringify(round.toMemento())))

describe('Wild Draw Four bluff and challenge', () => {
  it.each([true, false])('holds the turn until a +4 is accepted (guilty: %s)', guilty => {
    const round = setup(guilty)
    expect(round.playableCardIndices(0)).toContain(0)
    round.play(0, 'RED')
    expect(round.playerInTurn()).toBe(1)
    expect(round.playerHand(1)).toHaveLength(2)
    expect(round.playableCardIndices(1)).toEqual([])
    expect(round.canPlayAny()).toBe(false)
    const before = round.toMemento()
    expect(() => round.play(0, 'GREEN')).toThrow('Card cannot be played')
    expect(() => round.challengeWildDrawFour(2)).toThrow()
    expect(round.toMemento()).toEqual(before)
    round.draw()
    expect(round.playerHand(1)).toHaveLength(6)
    expect(round.playerHand(0)).toHaveLength(1)
    expect(round.playerInTurn()).toBe(2)
    expect(round.challenger()).toBeUndefined()
    expect(() => round.challengeWildDrawFour(1)).toThrow()
  })

  it.each([true, false])('restores and resolves a challenge (guilty: %s)', guilty => {
    const original = setup(guilty)
    original.play(0, 'RED')
    const restored = reload(original)
    for (const round of [original, restored]) {
      round.challengeWildDrawFour(1)
      expect(round.playerHand(0)).toHaveLength(guilty ? 5 : 1)
      expect(round.playerHand(1)).toHaveLength(guilty ? 2 : 8)
      expect(round.playerInTurn()).toBe(guilty ? 1 : 2)
      expect(round.challenger()).toBeUndefined()
      expect(round.challengeResult(0)).toBeUndefined()
      expect(round.challengeResult(2)).toBeUndefined()
      expect(round.challengeResult(1)).toEqual({
        offender: 0,
        guilty,
        hand: [{ type: 'NUMBERED', color: guilty ? 'BLUE' : 'RED', number: 5 }],
      })
      expect(() => round.challengeWildDrawFour(1)).toThrow()
      expect(reload(round).challengeResult(1)).toEqual(round.challengeResult(1))
      round.play(0, 'GREEN')
      expect(round.challengeResult(1)).toBeUndefined()
    }
    expect(restored.toMemento()).toEqual(original.toMemento())
  })

  it.each([true, false])('resolves counterclockwise challenges (guilty: %s)', guilty => {
    const round = setup(guilty, 'counterclockwise')
    round.play(0, 'RED')
    expect(round.challenger()).toBe(2)
    round.challengeWildDrawFour(2)
    expect(round.playerInTurn()).toBe(guilty ? 2 : 1)
  })

  it.each([true, false])('resolves two-player challenges (guilty: %s)', guilty => {
    const round = setup(guilty, 'clockwise', ['A', 'B'])
    round.play(0, 'RED')
    round.challengeWildDrawFour(1)
    expect(round.playerInTurn()).toBe(guilty ? 1 : 0)
  })

  it('uses the previous chosen color after a Wild, before naming a new color', () => {
    const state = setup().toMemento()
    state.discardPile = [{ type: 'WILD' }]
    const round = createRoundFromMemento(state)
    round.play(0, 'RED')
    round.challengeWildDrawFour(1)
    expect(round.challengeResult(1)?.guilty).toBe(true)
    expect(round.currentColor()).toBe('RED')
  })

  it('uses the hand at play time even if a missed-UNO penalty changes it', () => {
    const round = setup(false)
    round.play(0, 'RED')
    round.catchUnoFailure({ accuser: 1, accused: 0 })
    round.challengeWildDrawFour(1)
    expect(round.challengeResult(1)?.guilty).toBe(false)
    expect(round.playerHand(1)).toHaveLength(8)
  })

  it('accepts a restored pending bluff', () => {
    const original = setup()
    original.play(0, 'RED')
    const round = reload(original)
    round.draw()
    expect(round.playerHand(1)).toHaveLength(6)
    expect(round.challenger()).toBeUndefined()
  })

  it('finishes a last-card +4 immediately and includes its penalty in scoring', () => {
    const state = setup().toMemento()
    state.hands[0] = [{ type: 'WILD DRAW' }]
    const round = createRoundFromMemento(state)
    round.play(0, 'RED')
    expect(round.hasEnded()).toBe(true)
    expect(round.playerHand(1)).toHaveLength(6)
    expect(round.score()).toBe(110)
    expect(round.challenger()).toBeUndefined()
  })

  it.each([
    { offender: -1, guilty: true },
    { offender: 0, guilty: 'yes' },
    { offender: 1, guilty: true },
  ])('rejects malformed pending state %j', invalid => {
    const round = setup()
    round.play(0, 'RED')
    const state = round.toMemento()
    state.wildDrawChallenge = invalid as NonNullable<RoundMemento['wildDrawChallenge']>
    expect(() => createRoundFromMemento(state)).toThrow()
  })
})
