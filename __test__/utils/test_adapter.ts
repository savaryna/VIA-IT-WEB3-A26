import type { Card } from '../../src/model/card'
import { createDeck, fromMemento, type Deck } from '../../src/model/deck'
import type { DeckMemento } from '../../src/model/deck.memento'
import { type Round, type RoundMemento } from '../../src/model/round'
import { createRound as createInitialRound, fromMemento as restoreRound } from '../../src/model/round'
import {
  createGame as createInitialGame,
  fromMemento as restoreGame,
  type Game,
  type GameMemento,
} from '../../src/model/uno'
import { type Randomizer, type Shuffler, standardRandomizer, standardShuffler } from '../../src/utils/random_utils'

export function createInitialDeck(): Deck {
  return createDeck()
}

export function createDeckFromMemento(memento: DeckMemento): Deck {
  return fromMemento(memento)
}

export type HandConfig = {
  players: string[]
  dealer: number
  shuffler?: Shuffler<Card>
  cardsPerPlayer?: number
}

export function createRound({ players, dealer, shuffler = standardShuffler, cardsPerPlayer = 7 }: HandConfig): Round {
  return createInitialRound({ players, dealer, shuffler, cardsPerPlayer })
}

export function createRoundFromMemento(memento: RoundMemento, shuffler: Shuffler<Card> = standardShuffler): Round {
  return restoreRound(memento, shuffler)
}

export type GameConfig = {
  players: string[]
  targetScore: number
  randomizer: Randomizer
  shuffler: Shuffler<Card>
  cardsPerPlayer: number
}

export function createGame(props: Partial<GameConfig>): Game {
  return createInitialGame(props)
}

export function createGameFromMemento(
  memento: GameMemento,
  randomizer: Randomizer = standardRandomizer,
  shuffler: Shuffler<Card> = standardShuffler,
): Game {
  return restoreGame(memento, randomizer, shuffler)
}
