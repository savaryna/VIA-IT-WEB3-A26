import { type Card } from '../domain/card'
import type { Hand } from '../domain/hand'
import { cardsSchema } from '../schemas'

export type { HandMemento } from '../domain/hand.memento'

export function createHand(initialCards: readonly Card[] = []): Hand {
  const cards = [...initialCards]

  function get(index: number) {
    return Number.isInteger(index) && index >= 0 ? cards[index] : undefined
  }

  return {
    get size() {
      return cards.length
    },
    get,
    add(card) {
      cards.push({ ...card })
    },
    remove(index) {
      const card = get(index)
      if (card === undefined) throw new Error('Card index is out of bounds')
      cards.splice(index, 1)
      return card
    },
    some(predicate) {
      return cards.some(predicate)
    },
    cards() {
      return cards
    },
    toMemento() {
      return cards.map(card => ({ ...card }))
    },
  }
}

export function fromMemento(memento: unknown): Hand {
  return createHand(cardsSchema.parse(memento))
}
