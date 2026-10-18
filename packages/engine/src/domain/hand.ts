import type { Card } from './card'
import type { HandMemento } from './hand.memento'

export type Hand = {
  readonly size: number
  get(index: number): Card | undefined
  add(card: Card): void
  remove(index: number): Card
  some(predicate: (card: Card, index: number) => boolean): boolean
  cards(): readonly Card[]
  toMemento(): HandMemento
}
