import type { Card, CardColor } from './card'
import type { Deck } from './deck'
import type { Hand } from './hand'
import type { Shuffler } from './random'
import type { RoundMemento } from './round.memento'

export type Direction = 'clockwise' | 'counterclockwise'

export type RoundEnd = { winner: number }

export type Round = {
  readonly playerCount: number
  readonly dealer: number
  drawPile(): Deck
  discardPile(): Deck
  player(position: number): string
  playerHand(position: number): readonly Card[]
  playerInTurn(): number | undefined
  currentColor(): CardColor
  currentDirection(): Direction
  playableCardIndices(player: number): number[]
  mustPlayDrawn(): boolean
  declaredUno(): number | undefined
  catchablePlayer(): number | undefined
  challenger(): number | undefined
  challengeResult(player: number): { offender: number; guilty: boolean; hand: readonly Card[] } | undefined
  hasEnded(): boolean
  winner(): number | undefined
  score(): number | undefined
  onEnd(callback: (event: RoundEnd) => void): void
  canPlay(cardIndex: number): boolean
  canPlayAny(): boolean
  canSayUno(player: number): boolean
  // False means a valid player cannot declare UNO now; invalid players and ended rounds throw.
  sayUno(player: number): boolean
  catchUnoFailure(accusation: { accuser: number; accused: number }): boolean
  challengeWildDrawFour(challenger: number): void
  // During a pending Wild Draw Four, drawing accepts four cards and forfeits the turn.
  draw(): void
  // An accompanying UNO declaration takes effect only after the play is validated.
  play(cardIndex: number, newColor?: CardColor, options?: { sayUno?: boolean }): Card
  toMemento(): RoundMemento
}

export type RoundConfig = {
  players: string[]
  dealer: number
  shuffler: Shuffler<Card>
} & (
  | { cardsPerPlayer?: number; restored?: never }
  | {
      cardsPerPlayer?: never
      restored: {
        hands: Hand[]
        drawPile: Deck
        discardPile: Deck
        currentColor: CardColor
        currentDirection: Direction
        playerInTurn: number | undefined
        drawnCardIndex?: number
        wildDrawResult?: { viewer: number; offender: number; guilty: boolean; hand: readonly Card[] }
        wildDrawChallenge?: { offender: number; guilty: boolean }
        unoDeclaration?: number
        unoFailure?: number
      }
    }
)
