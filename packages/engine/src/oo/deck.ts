import { colors, numbers, types, type Card } from '../domain/card'
import type { Deck } from '../domain/deck'
import { cardsSchema } from '../schemas'

export function createDeck(initialCards?: readonly Card[]): Deck {
  const cards = initialCards
    ? [...initialCards]
    : types.flatMap<Card>(type => {
        switch (type) {
          case 'NUMBERED':
            return colors
              .flatMap(color => numbers.map(number => ({ type, color, number })))
              .flatMap(card => (card.number === 0 ? [card] : [card, card]))
          case 'SKIP':
          case 'REVERSE':
          case 'DRAW':
            return colors.map(color => ({ type, color })).flatMap(card => [card, card])
          default:
            return colors.map(() => ({ type }))
        }
      })

  return {
    get size() {
      return cards.length
    },
    add(card) {
      cards.unshift({ ...card })
    },
    top() {
      return cards.at(0)
    },
    deal() {
      return cards.shift()
    },
    shuffle(shuffler) {
      shuffler(cards)
    },
    filter(predicate) {
      return createDeck(cards.filter(card => predicate(card)))
    },
    toMemento() {
      return cards.map(card => ({ ...card }))
    },
  }
}

export function fromMemento(memento: unknown): Deck {
  return createDeck(cardsSchema.parse(memento))
}
