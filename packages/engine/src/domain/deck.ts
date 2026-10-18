import type { Card } from './card'
import type { DeckMemento } from './deck.memento'
import type { Shuffler } from './random'

export type Deck = {
  readonly size: number
  add(card: Card): void
  top(): Card | undefined
  deal(): Card | undefined
  shuffle(shuffler: Shuffler<Card>): void
  filter(predicate: (card: Card) => boolean): Deck
  toMemento(): DeckMemento
}
