import { describe, expect, it, vi } from 'vitest'

import type { GameMemento } from '../../src/index'
import { createGameFromMemento } from '../utils/test_adapter'

function snapshot(): GameMemento {
  return {
    players: ['A', 'B', 'C'],
    targetScore: 500,
    cardsPerPlayer: 1,
    scores: [0, 0, 0],
    mode: 'score' as const,
    roundNumber: 1,
    currentRound: {
      players: ['A', 'B', 'C'],
      dealer: 2,
      playerInTurn: 0,
      hands: [
        [{ type: 'NUMBERED', color: 'BLUE', number: 1 }],
        [{ type: 'NUMBERED', color: 'RED', number: 4 }],
        [{ type: 'NUMBERED', color: 'GREEN', number: 5 }],
      ],
      drawPile: [{ type: 'NUMBERED', color: 'BLUE', number: 2 }],
      discardPile: [{ type: 'NUMBERED', color: 'BLUE', number: 3 }],
      currentColor: 'BLUE',
      currentDirection: 'clockwise',
    },
  }
}

function completed(targetScore = 500) {
  const game = createGameFromMemento({ ...snapshot(), targetScore })
  game.currentRound().play(0)
  return game.toMemento()
}

function stored(memento: GameMemento): GameMemento {
  return JSON.parse(JSON.stringify(memento))
}

describe('explicit game round transitions', () => {
  it('scores once and keeps the completed round without dealing the next one', () => {
    const shuffler = vi.fn()
    const game = createGameFromMemento(snapshot(), undefined, shuffler)
    const round = game.currentRound()
    expect(game.roundNumber).toBe(1)
    round.play(0)
    expect(game.roundNumber).toBe(1)
    expect(game.currentRound()).toBe(round)
    expect(round.winner()).toBe(0)
    expect(round.score()).toBe(9)
    expect(game.score(0)).toBe(9)
    expect(game.winner()).toBeUndefined()
    expect(shuffler).not.toHaveBeenCalled()
    expect(() => round.play(0)).toThrow()
    expect(game.score(0)).toBe(9)
  })

  it('rejects advancing an active round without changing it', () => {
    const game = createGameFromMemento(snapshot())
    expect(() => game.startNextRound()).toThrow('The current round is not complete')
    expect(game.toMemento()).toEqual(snapshot())
  })

  it('restores completed rounds repeatedly without scoring or consuming randomness', () => {
    let memento = completed()
    const shuffler = vi.fn()
    const randomizer = vi.fn(() => 0)
    for (let attempt = 0; attempt < 3; attempt++) {
      const game = createGameFromMemento(stored(memento), randomizer, shuffler)
      expect(game.currentRound().hasEnded()).toBe(true)
      expect(game.currentRound().winner()).toBe(0)
      expect(game.currentRound().score()).toBe(9)
      expect(game.score(0)).toBe(9)
      expect(game.roundNumber).toBe(1)
      expect(game.toMemento()).toEqual(memento)
      memento = game.toMemento()
    }
    expect(shuffler).not.toHaveBeenCalled()
    expect(randomizer).not.toHaveBeenCalled()
  })

  it('advances the dealer, deals once, and preserves scores when explicitly resumed', () => {
    const shuffler = vi.fn()
    const game = createGameFromMemento(stored(completed()), undefined, shuffler)
    const previous = game.currentRound()
    game.startNextRound()
    const round = game.currentRound()
    expect(game.roundNumber).toBe(2)
    expect(round).not.toBe(previous)
    expect(round.dealer).toBe(0)
    expect(round.hasEnded()).toBe(false)
    expect(round.playerHand(0)).toHaveLength(1)
    expect(round.playerHand(1)).toHaveLength(1)
    expect(round.playerHand(2)).toHaveLength(1)
    expect(game.score(0)).toBe(9)
    expect(shuffler).toHaveBeenCalledTimes(1)
    expect(() => game.startNextRound()).toThrow('The current round is not complete')
    expect(game.currentRound()).toBe(round)
    expect(shuffler).toHaveBeenCalledTimes(1)

    // The deterministic, unshuffled deck gives the next player a matching blue card.
    const winner = round.playerInTurn()!
    round.play(0)
    expect(game.currentRound()).toBe(round)
    expect(game.score(winner)).toBe(round.score())
    expect(game.roundNumber).toBe(2)
    const reloaded = createGameFromMemento(stored(game.toMemento()))
    expect(reloaded.roundNumber).toBe(2)
    expect(reloaded.toMemento()).toEqual(game.toMemento())
  })

  it('retains a game-winning round and rejects any further round after restoration', () => {
    const memento = completed(1)
    const shuffler = vi.fn()
    const game = createGameFromMemento(stored(memento), undefined, shuffler)
    expect(game.winner()).toBe(0)
    expect(game.currentRound().winner()).toBe(0)
    expect(game.currentRound().hasEnded()).toBe(true)
    expect(game.score(0)).toBe(9)
    expect(() => game.startNextRound()).toThrow('The game has ended')
    expect(game.toMemento()).toEqual(memento)
    expect(shuffler).not.toHaveBeenCalled()
  })

  it('rejects a game winner whose retained round is still active', () => {
    const memento = snapshot()
    memento.targetScore = 1
    memento.scores = [1, 0, 0]
    expect(() => createGameFromMemento(memento)).toThrow('A finished game requires a completed round')
  })

  it('rejects a game winner different from the completed round winner', () => {
    const memento = completed(1)
    memento.scores = [0, 9, 0]
    expect(() => createGameFromMemento(memento)).toThrow('won by the game winner')
  })

  it('rejects completed-round snapshots whose points are missing from the scores', () => {
    const memento = completed()
    memento.scores = [0, 0, 0]
    expect(() => createGameFromMemento(memento)).toThrow('Scores must include the completed round points')
  })

  it('rejects snapshots with different round players', () => {
    const memento = completed()
    memento.currentRound.players[0] = 'Different player'
    expect(() => createGameFromMemento(memento)).toThrow('same players as the game')
  })

  it('preserves a restored round counter and increments it once on advancement', () => {
    const memento = completed()
    memento.roundNumber = 7
    const game = createGameFromMemento(stored(memento), undefined, () => {})
    expect(game.roundNumber).toBe(7)
    game.startNextRound()
    expect(game.roundNumber).toBe(8)
    expect(() => game.startNextRound()).toThrow('The current round is not complete')
    expect(game.roundNumber).toBe(8)
    expect(createGameFromMemento(stored(game.toMemento())).roundNumber).toBe(8)
  })

  it.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects invalid round counter %s', roundNumber => {
    expect(() => createGameFromMemento({ ...snapshot(), roundNumber })).toThrow(
      'Round number must be a positive safe integer',
    )
  })

  it('requires a saved round counter', () => {
    const memento = JSON.parse(JSON.stringify(completed()))
    delete memento.roundNumber
    expect(() => createGameFromMemento(memento)).toThrow('Round number must be a positive safe integer')
  })

  it('does not increment the counter if creating the next round fails', () => {
    const memento = completed()
    const game = createGameFromMemento(memento, undefined, () => {
      throw new Error('Shuffle failed')
    })
    expect(() => game.startNextRound()).toThrow('Shuffle failed')
    expect(game.roundNumber).toBe(1)
    expect(game.toMemento()).toEqual(memento)
  })

  it('rejects counter overflow without advancing', () => {
    const memento = { ...completed(), roundNumber: Number.MAX_SAFE_INTEGER }
    const game = createGameFromMemento(memento)
    expect(() => game.startNextRound()).toThrow('Round number cannot be incremented')
    expect(game.toMemento()).toEqual(memento)
  })
})

describe('single-round games', () => {
  it.each([false, true])('finishes and restores a single round, zero-point result: %s', zeroPoints => {
    const memento = snapshot()
    memento.mode = 'round'
    if (zeroPoints) {
      memento.currentRound.hands[1] = [{ type: 'NUMBERED', color: 'RED', number: 0 }]
      memento.currentRound.hands[2] = [{ type: 'NUMBERED', color: 'GREEN', number: 0 }]
    }
    const game = createGameFromMemento(stored(memento))
    expect(game.mode).toBe('round')
    expect(game.winner()).toBeUndefined()
    game.currentRound().play(0)
    expect(game.winner()).toBe(0)
    expect(game.score(0)).toBe(zeroPoints ? 0 : 9)
    expect(() => game.startNextRound()).toThrow('The game has ended')
    const restored = createGameFromMemento(stored(game.toMemento()))
    expect(restored.mode).toBe('round')
    expect(restored.winner()).toBe(0)
    expect(restored.toMemento()).toEqual(game.toMemento())
    expect(() => restored.startNextRound()).toThrow('The game has ended')
  })

  it('rejects extra rounds and scores from earlier rounds', () => {
    expect(() => createGameFromMemento({ ...snapshot(), mode: 'round', roundNumber: 2 })).toThrow(
      'A single-round game must have round number 1',
    )
    expect(() => createGameFromMemento({ ...snapshot(), mode: 'round', scores: [1, 0, 0] })).toThrow(
      'Single-round scores must match the current round result',
    )
  })

  it.each([undefined, 'unknown'])('requires a valid persisted mode: %s', mode => {
    const memento = { ...snapshot(), mode } as unknown as GameMemento
    expect(() => createGameFromMemento(memento)).toThrow('Choose a valid game mode')
  })
})
