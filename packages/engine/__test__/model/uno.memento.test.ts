import { describe, it, expect, beforeEach } from 'vitest'

import { createGameFromMemento } from '../utils/test_adapter'

const currentRoundMemento = {
  players: ['A', 'B', 'C'],
  hands: [
    [{ type: 'WILD' }, { type: 'DRAW', color: 'GREEN' }],
    [{ type: 'NUMBERED', color: 'RED', number: 7 }],
    [{ type: 'SKIP', color: 'RED' }],
  ],
  drawPile: [{ type: 'WILD DRAW' }],
  discardPile: [
    { type: 'NUMBERED', color: 'BLUE', number: 7 },
    { type: 'SKIP', color: 'BLUE' },
  ],
  currentColor: 'BLUE',
  currentDirection: 'clockwise',
  dealer: 2,
  playerInTurn: 1,
}

const unoMemento = {
  players: ['A', 'B', 'C'],
  currentRound: currentRoundMemento,
  targetScore: 500,
  scores: [220, 430, 80],
  mode: 'score' as const,
  roundNumber: 4,
  cardsPerPlayer: 7,
}

describe('create unfinished game from valid memento', () => {
  let game = createGameFromMemento(unoMemento)
  beforeEach(() => {
    game = createGameFromMemento(unoMemento)
  })
  it('reads the players from the memento', () => {
    expect(game.player(0)).toEqual('A')
    expect(game.player(1)).toEqual('B')
    expect(game.player(2)).toEqual('C')
  })
  it('reads the round from the memento', () => {
    expect(game.currentRound()?.toMemento()).toEqual(currentRoundMemento)
  })
  it('reads the target score from the memento', () => {
    expect(game.targetScore).toEqual(500)
  })
  it('reads the scores from the memento', () => {
    expect(game.score(0)).toEqual(220)
    expect(game.score(1)).toEqual(430)
    expect(game.score(2)).toEqual(80)
  })
  it("doesn't declare a winner on an unfinished game", () => {
    expect(game.winner()).toBeUndefined()
  })
  it('updates on changes in the current round', () => {
    game.currentRound()?.play(0) // Last card from player 1
    expect(game.winner()).toEqual(1)
  })
})

describe('create game from invalid memento', () => {
  it('fails on too few players', () => {
    expect(() => createGameFromMemento({ ...unoMemento, players: ['A'] })).toThrow()
  })
  it('fails on 0 target score', () => {
    expect(() => createGameFromMemento({ ...unoMemento, targetScore: 0 })).toThrow()
  })
  it('fails on negative scores', () => {
    expect(() => createGameFromMemento({ ...unoMemento, scores: [220, 430, -80] })).toThrow()
  })
  it('fails with fewer scores than players', () => {
    expect(() => createGameFromMemento({ ...unoMemento, scores: [220, 430] })).toThrow()
  })
  it('fails on several winners', () => {
    expect(() => createGameFromMemento({ ...unoMemento, targetScore: 200 })).toThrow()
  })
  it('fails on missing current round', () => {
    expect(() =>
      createGameFromMemento(JSON.parse(JSON.stringify({ ...unoMemento, currentRound: undefined }))),
    ).toThrow()
  })
})

const finishedUnoMemento = {
  players: ['A', 'B', 'C'],
  targetScore: 500,
  scores: [220, 530, 80],
  mode: 'score' as const,
  roundNumber: 4,
  cardsPerPlayer: 7,
  currentRound: {
    ...currentRoundMemento,
    hands: [currentRoundMemento.hands[0], [], currentRoundMemento.hands[2]],
    playerInTurn: undefined,
  },
}

describe('create finished game from valid memento', () => {
  const game = createGameFromMemento(finishedUnoMemento)
  it('retains the completed round on a finished game', () => {
    expect(game.currentRound().hasEnded()).toBe(true)
    expect(game.currentRound().winner()).toBe(1)
  })
  it('reads the scores from the memento', () => {
    expect(game.score(0)).toEqual(220)
    expect(game.score(1)).toEqual(530)
    expect(game.score(2)).toEqual(80)
  })
  it('declares a winner on a finished game', () => {
    expect(game.winner()).toBeDefined()
  })
})

describe('toMemento', () => {
  it('an unfinished game returns the Memento used to create it', () => {
    const created = createGameFromMemento(unoMemento)
    expect(created.toMemento()).toEqual(unoMemento)
  })
  it('a finished game returns the Memento used to create it', () => {
    const created = createGameFromMemento(finishedUnoMemento)
    expect(created.toMemento()).toEqual(finishedUnoMemento)
  })
})
