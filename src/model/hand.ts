import { isColor, isNumber, isType, type Card } from './card'
import type { HandMemento } from './hand.memento'

export type { HandMemento } from './hand.memento'

export type Hand = {
  readonly size: number
  get(index: number): Card | undefined
  add(card: Card): void
  remove(index: number): Card
  some(predicate: (card: Card, index: number) => boolean): boolean
  cards(): readonly Card[]
  toMemento(): HandMemento
}

export function createHand(initialCards: readonly Card[] = []): Hand {
  const cards = [...initialCards].map(card => ({ ...card }))

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

export function fromMemento(memento: HandMemento): Hand {
  const cards = memento.map<Card>(({ type, color, number }) => {
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

  return createHand(cards)
}
