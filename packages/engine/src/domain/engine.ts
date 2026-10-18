import type { Card } from './card'
import type { Deck } from './deck'
import type { Game, GameConfig } from './game'
import type { Hand } from './hand'
import type { Randomizer, Shuffler } from './random'
import type { Round, RoundConfig } from './round'

export type Engine = {
  createDeck(initialCards?: readonly Card[]): Deck
  createDeckFromMemento(memento: unknown): Deck
  createHand(initialCards?: readonly Card[]): Hand
  createHandFromMemento(memento: unknown): Hand
  createRound(config: RoundConfig): Round
  createRoundFromMemento(memento: unknown, shuffler?: Shuffler<Card>): Round
  createGame(config?: Partial<GameConfig>): Game
  createGameFromMemento(memento: unknown, randomizer?: Randomizer, shuffler?: Shuffler<Card>): Game
}
