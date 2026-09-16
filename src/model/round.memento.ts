import type { DeckMemento } from './deck.memento'

export type Direction = 'clockwise' | 'counterclockwise'

export type RoundMemento = {
  players: string[]
  hands: DeckMemento[]
  drawPile: DeckMemento
  discardPile: DeckMemento
  currentColor: string
  currentDirection: string
  dealer: number
  playerInTurn: number | undefined
}
