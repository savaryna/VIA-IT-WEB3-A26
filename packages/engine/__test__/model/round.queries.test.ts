import { describe, expect, it } from 'vitest'

import type { RoundMemento } from '../../src/index'
import { createRoundFromMemento } from '../utils/test_adapter'

function snapshot(): RoundMemento {
  return {
    players: ['A', 'B'],
    dealer: 1,
    playerInTurn: 0,
    hands: [
      [
        { type: 'NUMBERED', color: 'BLUE', number: 1 },
        { type: 'NUMBERED', color: 'RED', number: 5 },
        { type: 'WILD' },
        { type: 'REVERSE', color: 'BLUE' },
      ],
      [{ type: 'NUMBERED', color: 'GREEN', number: 2 }],
    ],
    drawPile: [{ type: 'NUMBERED', color: 'BLUE', number: 7 }],
    discardPile: [{ type: 'NUMBERED', color: 'BLUE', number: 9 }],
    currentColor: 'BLUE',
    currentDirection: 'clockwise',
  }
}

describe('round queries', () => {
  it('reports legal cards only for the player in turn without changing state', () => {
    const state = snapshot()
    const round = createRoundFromMemento(state)
    expect(round.currentColor()).toBe('BLUE')
    expect(round.currentDirection()).toBe('clockwise')
    expect(round.playableCardIndices(0)).toEqual([0, 2, 3])
    expect(round.playableCardIndices(1)).toEqual([])
    expect(round.toMemento()).toEqual(state)
  })

  it('reflects the drawn-card restriction after restoring a snapshot', () => {
    const original = createRoundFromMemento(snapshot())
    original.draw()
    const round = createRoundFromMemento(JSON.parse(JSON.stringify(original.toMemento())))
    expect(round.playableCardIndices(0)).toEqual([4])
    expect(round.playableCardIndices(1)).toEqual([])
    round.play(4)
    expect(round.playableCardIndices(0)).toEqual([])
  })

  it('reflects wild color choices and reversals', () => {
    const wild = createRoundFromMemento(snapshot())
    wild.play(2, 'RED')
    expect(wild.currentColor()).toBe('RED')
    expect(wild.currentDirection()).toBe('clockwise')

    const reverse = createRoundFromMemento(snapshot())
    reverse.play(3)
    expect(reverse.currentDirection()).toBe('counterclockwise')
    expect(reverse.playableCardIndices(0)).toEqual([0, 2])
    const restored = createRoundFromMemento(JSON.parse(JSON.stringify(reverse.toMemento())))
    expect(restored.currentDirection()).toBe('counterclockwise')
  })

  it('has no playable cards for either player after the round ends', () => {
    const state = snapshot()
    state.hands[0] = [state.hands[0][0]]
    const round = createRoundFromMemento(state)
    round.play(0)
    expect(round.playableCardIndices(0)).toEqual([])
    expect(round.playableCardIndices(1)).toEqual([])
  })

  it.each([-1, 2, 0.5, NaN])('rejects invalid player %s', player => {
    expect(() => createRoundFromMemento(snapshot()).playableCardIndices(player)).toThrow(
      'Player index is out of bounds',
    )
  })
})
