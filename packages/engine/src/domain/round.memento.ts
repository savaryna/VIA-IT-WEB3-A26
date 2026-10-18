import type { DeckMemento } from './deck.memento'
import type { HandMemento } from './hand.memento'

// Serializable round state, including pending action windows. Absent optional fields
// mean there is no pending action.
export type RoundMemento = {
  players: string[]
  hands: HandMemento[]
  drawPile: DeckMemento
  discardPile: DeckMemento
  currentColor: string
  currentDirection: string
  dealer: number
  playerInTurn: number | undefined
  drawnCardIndex?: number
  wildDrawResult?: { viewer: number; offender: number; guilty: boolean; hand: HandMemento }
  wildDrawChallenge?: { offender: number; guilty: boolean }
  unoDeclaration?: number
  unoFailure?: number
}
