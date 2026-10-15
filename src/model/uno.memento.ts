import type { RoundMemento } from './round.memento'

export type GameMemento = {
  players: string[]
  targetScore: number
  cardsPerPlayer: number
  scores: number[]
  currentRound?: RoundMemento
}
