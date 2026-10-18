import type { Card } from './card'
import type { GameMemento } from './game.memento'
import type { Randomizer, Shuffler } from './random'
import type { Round } from './round'

export type GameMode = 'round' | 'score'

export type Game = {
  readonly mode: GameMode
  readonly playerCount: number
  readonly targetScore: number
  readonly roundNumber: number
  player(position: number): string
  score(position: number): number
  winner(): number | undefined
  // The current round remains available after completion, including a game win.
  currentRound(): Round
  // Advance only after the current round ends and while the game has no winner.
  startNextRound(): void
  toMemento(): GameMemento
}

export type GameConfig = {
  mode: GameMode
  players: string[]
  targetScore: number
  cardsPerPlayer: number
  randomizer: Randomizer
  shuffler: Shuffler<Card>
  restored?: { scores: number[]; currentRound: Round; roundNumber: number }
}
