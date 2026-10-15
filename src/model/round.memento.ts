import type { DeckMemento } from './deck.memento'
import type { HandMemento } from './hand.memento'

export type RoundMemento = {
  players: string[]
  hands: HandMemento[]
  drawPile: DeckMemento
  discardPile: DeckMemento
  currentColor: string
  currentDirection: string
  dealer: number
  playerInTurn: number | undefined
}
