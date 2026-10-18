import { describe, expect, it } from 'vitest'

import type { Game, RoundMemento } from '../../src/index'
import { createGameFromMemento } from '../utils/test_adapter'

const snapshot = (): RoundMemento => ({
  players: ['A', 'B', 'C'],
  hands: [
    [
      { type: 'SKIP', color: 'BLUE' },
      { type: 'NUMBERED', color: 'BLUE', number: 1 },
    ],
    [{ type: 'NUMBERED', color: 'RED', number: 2 }, { type: 'WILD' }],
    [{ type: 'NUMBERED', color: 'GREEN', number: 4 }, { type: 'WILD' }],
  ],
  drawPile: Array.from({ length: 20 }, () => ({ type: 'NUMBERED', color: 'BLUE', number: 3 })),
  discardPile: [{ type: 'NUMBERED', color: 'BLUE', number: 5 }],
  currentColor: 'BLUE',
  currentDirection: 'clockwise',
  dealer: 2,
  playerInTurn: 0,
})

function createTestGame(round = snapshot(), targetScore = 500) {
  return createGameFromMemento(
    {
      players: round.players,
      scores: [0, 0, 0],
      mode: 'score' as const,
      roundNumber: 1,
      targetScore,
      cardsPerPlayer: 7,
      currentRound: round,
    },
    undefined,
    () => {},
  )
}

function reload(original: Game) {
  return createGameFromMemento(JSON.parse(JSON.stringify(original.toMemento())), undefined, () => {})
}

describe('complete game snapshots', () => {
  it('preserves the drawn-card restriction through JSON storage', () => {
    const original = createTestGame()
    original.currentRound()!.draw()
    const restored = reload(original)
    for (const game of [original, restored]) {
      const round = game.currentRound()!
      expect(round.mustPlayDrawn()).toBe(true)
      expect(round.canPlay(0)).toBe(false)
      expect(round.canPlay(2)).toBe(true)
      expect(() => round.draw()).toThrow('drawn card must be played')
      expect(() => round.play(0)).toThrow('Card cannot be played')
      round.play(2)
      expect(round.mustPlayDrawn()).toBe(false)
    }
    expect(restored.toMemento()).toEqual(original.toMemento())
  })

  it('preserves a pending UNO declaration', () => {
    const original = createTestGame()
    original.currentRound()!.sayUno(0)
    const restored = reload(original)
    for (const game of [original, restored]) {
      const round = game.currentRound()!
      expect(round.declaredUno()).toBe(0)
      round.play(0)
      expect(round.catchablePlayer()).toBeUndefined()
      expect(round.catchUnoFailure({ accuser: 1, accused: 0 })).toBe(false)
    }
    expect(restored.toMemento()).toEqual(original.toMemento())
  })

  it('preserves an open missed-UNO accusation and its penalty', () => {
    const original = createTestGame()
    original.currentRound()!.play(0)
    const restored = reload(original)
    for (const game of [original, restored]) {
      const round = game.currentRound()!
      expect(round.catchablePlayer()).toBe(0)
      expect(round.catchUnoFailure({ accuser: 1, accused: 0 })).toBe(true)
      expect(round.playerHand(0)).toHaveLength(5)
      expect(round.catchablePlayer()).toBeUndefined()
    }
    expect(restored.toMemento()).toEqual(original.toMemento())
  })

  it('preserves the opportunity to correct a missed UNO', () => {
    const original = createTestGame()
    original.currentRound()!.play(0)
    const restored = reload(original)
    restored.currentRound()!.sayUno(0)
    expect(restored.currentRound()!.catchUnoFailure({ accuser: 1, accused: 0 })).toBe(false)
    expect(restored.currentRound()!.playerHand(0)).toHaveLength(1)
  })

  it('preserves a Wild Draw Four challenge and its penalty', () => {
    const state = snapshot()
    state.hands[0] = [{ type: 'WILD DRAW' }, { type: 'NUMBERED', color: 'RED', number: 1 }]
    const original = createTestGame(state)
    original.currentRound()!.play(0, 'RED')
    const restored = reload(original)
    for (const game of [original, restored]) {
      const round = game.currentRound()!
      expect(round.challenger()).toBe(1)
      expect(() => round.challengeWildDrawFour(2)).toThrow()
      round.challengeWildDrawFour(1)
      expect(round.playerHand(1)).toHaveLength(8)
      expect(round.challenger()).toBeUndefined()
      expect(() => round.challengeWildDrawFour(1)).toThrow()
    }
    expect(restored.toMemento()).toEqual(original.toMemento())
  })

  it.each([1, 500])('reattaches game scoring when restoring before a win (target %i)', target => {
    const state = snapshot()
    state.hands[0] = [{ type: 'NUMBERED', color: 'BLUE', number: 1 }]
    const original = createTestGame(state, target)
    const restored = reload(original)
    for (const game of [original, restored]) game.currentRound()!.play(0)
    expect(restored.score(0)).toBeGreaterThan(0)
    expect(restored.toMemento()).toEqual(original.toMemento())
    expect(reload(restored).toMemento()).toEqual(restored.toMemento())
    expect(restored.currentRound().hasEnded()).toBe(true)
    expect(restored.currentRound().dealer).toBe(2)
    if (target === 1) {
      expect(restored.winner()).toBe(0)
      expect(() => restored.startNextRound()).toThrow('The game has ended')
    } else {
      for (const game of [original, restored]) game.startNextRound()
      expect(restored.currentRound().dealer).toBe(0)
      expect(restored.toMemento()).toEqual(original.toMemento())
    }
  })

  it.each([
    { drawnCardIndex: -1 },
    { drawnCardIndex: 0 },
    { wildDrawChallenge: { offender: 3, guilty: true } },
    { wildDrawChallenge: { offender: 1, guilty: false } },
    { unoDeclaration: 1 },
    { unoFailure: 0 },
  ])('rejects inconsistent transient state %j', invalid => {
    expect(() => createTestGame({ ...snapshot(), ...invalid })).toThrow()
  })
})
