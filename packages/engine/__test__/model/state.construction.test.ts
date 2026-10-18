import { describe, expect, it, vi } from 'vitest'

import {
  createGame,
  createGameFromMemento,
  createRound,
  createRoundFromMemento,
  createHandFromMemento,
  createDeckFromMemento,
} from '../../src/oo'

// Keep the initial discard deterministic without depending on random shuffling.
const shuffler = () => {}

describe('new and restored state construction', () => {
  it('stores a rotating dealer counter as a restorable seat index', () => {
    const round = createRound({ players: ['A', 'B'], dealer: 3, shuffler })
    expect(round.dealer).toBe(1)
    const saved = round.toMemento()
    expect(createRoundFromMemento(saved, shuffler).toMemento()).toEqual(saved)
  })

  it('does not deal, shuffle, or choose a dealer when restoring a game', () => {
    const game = createGame({ players: ['A', 'B'], randomizer: () => 0, shuffler })
    const randomizer = vi.fn(() => 0)
    const shuffle = vi.fn()
    const saved = game.toMemento()
    const restored = createGameFromMemento(saved, randomizer, shuffle)
    expect(restored.toMemento()).toEqual(saved)
    expect(randomizer).not.toHaveBeenCalled()
    expect(shuffle).not.toHaveBeenCalled()
    restored.currentRound().draw()
    expect(game.toMemento()).toEqual(saved)
  })

  it('accepts hydrated round config without dealing and validates its consistency', () => {
    const saved = createRound({ players: ['A', 'B'], dealer: 0, shuffler }).toMemento()
    const shuffle = vi.fn()
    const config = {
      players: saved.players,
      dealer: saved.dealer,
      shuffler: shuffle,
      restored: {
        hands: saved.hands.map(createHandFromMemento),
        drawPile: createDeckFromMemento(saved.drawPile),
        discardPile: createDeckFromMemento(saved.discardPile),
        currentColor: 'BLUE' as const,
        currentDirection: 'clockwise' as const,
        playerInTurn: saved.playerInTurn,
      },
    }
    expect(createRound(config).toMemento()).toEqual(saved)
    expect(shuffle).not.toHaveBeenCalled()
    expect(() => createRound({ ...config, restored: { ...config.restored, hands: [] } })).toThrow(
      'Each player must have one hand',
    )
  })

  it('accepts restored game config without randomness and owns its score array', () => {
    const original = createGame({ players: ['A', 'B'], shuffler, randomizer: () => 0 })
    const saved = original.toMemento()
    const randomizer = vi.fn(() => 0)
    const shuffle = vi.fn()
    const scores = [...saved.scores]
    const config = {
      ...saved,
      randomizer,
      shuffler: shuffle,
      restored: {
        scores,
        currentRound: createRoundFromMemento(saved.currentRound),
        roundNumber: saved.roundNumber,
      },
    }
    const restored = createGame(config)
    scores[0] = 123
    expect(restored.toMemento()).toEqual(saved)
    expect(randomizer).not.toHaveBeenCalled()
    expect(shuffle).not.toHaveBeenCalled()
    expect(() => createGame({ ...config, restored: { ...config.restored, scores: [] } })).toThrow(
      'Each player must have a nonnegative score',
    )
  })

  it('rejects an invalid random dealer before dealing', () => {
    const shuffle = vi.fn()
    expect(() => createGame({ players: ['A', 'B'], randomizer: () => 2, shuffler: shuffle })).toThrow(
      'Dealer index is out of bounds',
    )
    expect(shuffle).not.toHaveBeenCalled()
  })
})
