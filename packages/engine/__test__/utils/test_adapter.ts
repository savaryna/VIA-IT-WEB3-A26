import {
  standardRandomizer,
  standardShuffler,
  type Card,
  type Deck,
  type DeckMemento,
  type Engine,
  type Game,
  type GameConfig,
  type GameMemento,
  type Randomizer,
  type Round,
  type RoundMemento,
  type Shuffler,
} from '../../src/index'
import * as implementation from '../../src/oo/index'

const engine: Engine = implementation

export type { GameConfig } from '../../src/index'

export function createInitialDeck(): Deck {
  return engine.createDeck()
}

export function createDeckFromMemento(memento: DeckMemento): Deck {
  return engine.createDeckFromMemento(memento)
}

export type HandConfig = {
  players: string[]
  dealer: number
  shuffler?: Shuffler<Card>
  cardsPerPlayer?: number
}

export function createRound({ players, dealer, shuffler = standardShuffler, cardsPerPlayer = 7 }: HandConfig): Round {
  return engine.createRound({ players, dealer, shuffler, cardsPerPlayer })
}

export function createRoundFromMemento(memento: RoundMemento, shuffler: Shuffler<Card> = standardShuffler): Round {
  return engine.createRoundFromMemento(memento, shuffler)
}

export function createGame(props: Partial<GameConfig>): Game {
  return engine.createGame(props)
}

export function createGameFromMemento(
  memento: GameMemento,
  randomizer: Randomizer = standardRandomizer,
  shuffler: Shuffler<Card> = standardShuffler,
): Game {
  return engine.createGameFromMemento(memento, randomizer, shuffler)
}
