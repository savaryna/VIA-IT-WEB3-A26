import { describe, expect, it } from 'vitest'

import { validateGameConfig, validatePlayerCount, validateTargetScore } from '../../src/index'
import { createGame } from '../utils/test_adapter'

const config = { mode: 'score' as const, players: ['A', 'B'], targetScore: 500, cardsPerPlayer: 7 }

describe('shared game configuration rules', () => {
  it('defaults to score mode and supports explicit round mode', () => {
    expect(createGame({}).mode).toBe('score')
    const game = createGame({ mode: 'round' })
    expect(game.mode).toBe('round')
    expect(game.toMemento().mode).toBe('round')
    expect(game.winner()).toBeUndefined()
  })

  it.each([0, -1, 0.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1])(
    'rejects target %s both directly and at game creation',
    targetScore => {
      expect(() => validateTargetScore(targetScore)).toThrow('Target score must be a positive safe integer')
      expect(() => createGame({ ...config, targetScore })).toThrow('Target score must be a positive safe integer')
    },
  )

  it('keeps engine support for more than four players', () => {
    expect(() => validatePlayerCount(10)).not.toThrow()
    const game = createGame({ ...config, players: ['A', 'B', 'C', 'D', 'E'] })
    expect(game.playerCount).toBe(5)
  })

  it.each([1, 11, 2.5])('rejects invalid player count %s', playerCount => {
    expect(() => validatePlayerCount(playerCount)).toThrow('2 to 10 players')
  })

  it('validates card supply as part of the shared configuration', () => {
    expect(() => validateGameConfig({ ...config, cardsPerPlayer: 54 })).toThrow('Invalid cards per player')
    expect(() => createGame({ ...config, cardsPerPlayer: 54 })).toThrow('Invalid cards per player')
  })
})
