import type { Shuffler } from '../utils/random_utils'
import { colors, isColor, isNumber, isType, numbers, types, type Card } from './card'
import type { DeckMemento } from './deck.memento'

export * from './card'

export type Deck = {
  readonly size: number
  add(card: Card): void
  top(): Card | undefined
  deal(): Card | undefined
  shuffle(shuffler: Shuffler<Card>): void
  filter(predicate: (card: Card) => boolean): Deck
  toMemento(): DeckMemento
}

export function createDeck(initialCards?: Card[]): Deck {
  const cards =
    initialCards ??
    types.flatMap<Card>(type => {
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
      cards.unshift(card)
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
      return cards
    },
  }
}

export function fromMemento(memento: DeckMemento): Deck {
  const cards = memento.map(({ type, color, number }) => {
    if (!isType(type)) throw new Error(`[${type}] Unsupported card type`)

    switch (type) {
      case 'NUMBERED':
        if (!isNumber(number)) throw new Error(`[${type}] Cards must specify a valid number`)
        if (!isColor(color)) throw new Error(`[${type}] Cards must specify a valid color`)
        return { type, color, number }
      case 'SKIP':
      case 'REVERSE':
      case 'DRAW':
        if (!isColor(color)) throw new Error(`[${type}] Cards must specify a valid color`)
        return { type, color }
      default:
        return { type }
    }
  })

  return createDeck(cards)
}
