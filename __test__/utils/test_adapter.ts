// oxlint-disable no-unused-vars until an actual implementation is provided
import { type Card, type Deck } from '../../src/model/deck'
import { type Round, type RoundMemento } from '../../src/model/round'
import { type Game, type GameMemento } from '../../src/model/uno'
import { type Randomizer, type Shuffler, standardRandomizer, standardShuffler } from '../../src/utils/random_utils'

// TODO: Fill out the empty functions
export function createInitialDeck(): Deck {}

export function createDeckFromMemento(cards: Record<string, string | number>[]): Deck {}

export type HandConfig = {
  players: string[]
  dealer: number
  shuffler?: Shuffler<Card>
  cardsPerPlayer?: number
}

export function createRound({ players, dealer, shuffler = standardShuffler, cardsPerPlayer = 7 }: HandConfig): Round {}

export function createRoundFromMemento(memento: RoundMemento, shuffler: Shuffler<Card> = standardShuffler): Round {}

export type GameConfig = {
  players: string[]
  targetScore: number
  randomizer: Randomizer
  shuffler: Shuffler<Card>
  cardsPerPlayer: number
}

export function createGame(props: Partial<GameConfig>): Game {}

export function createGameFromMemento(
  memento: GameMemento,
  randomizer: Randomizer = standardRandomizer,
  shuffler: Shuffler<Card> = standardShuffler,
): Game {}
