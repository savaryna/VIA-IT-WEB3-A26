import type { GameMode } from './game'
import type { RoundMemento } from './round.memento'

export type GameMemento = {
  mode: GameMode
  players: string[]
  targetScore: number
  cardsPerPlayer: number
  scores: number[]
  roundNumber: number
  // Completed rounds remain here; their points are already included in scores.
  currentRound: RoundMemento
}
