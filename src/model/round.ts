import type { Shuffler } from '../utils/random_utils'
import type { Card, CardColor } from './card'
import { createDeck, hasColor, type Deck } from './deck'

export type { RoundMemento } from './round.memento'

export type Round = {
  readonly playerCount: number
  readonly dealer: number
  drawPile(): Deck
  discardPile(): Deck
  player(position: number): string
  playerHand(position: number): Card[]
  playerInTurn(): number
  canPlay(cardIndex: number): boolean
  play(cardIndex: number, newColor?: CardColor): void
}

export function createRound(
  players: string[],
  dealer: number,
  shuffler: Shuffler<Card>,
  // UNO rule: Each player is dealt 7 cards
  cardsPerPlayer: number = 7,
): Round {
  // UNO rule: Minimum 2 players, maximum 10 players
  if (players.length < 2) throw new Error('At least 2 players are required')
  if (players.length > 10) throw new Error('At most 10 players are allowed')

  const drawPile = createDeck()

  // UNO rule: Shuffle the deck before dealing cards
  drawPile.shuffle(shuffler)

  const hands: Card[][] = players.map(() =>
    Array.from({ length: cardsPerPlayer }, () => {
      const card = drawPile.deal()
      if (card === undefined) throw new Error('No more cards in the draw pile')
      return card
    }),
  )

  let topCard = drawPile.top()

  // UNO rule: If the top card is a Wild or Wild Draw 4, return it to the deck and pick another card
  while (topCard?.type === 'WILD' || topCard?.type === 'WILD DRAW') {
    drawPile.shuffle(shuffler)
    topCard = drawPile.top()
  }

  topCard = drawPile.deal()
  if (topCard === undefined) throw new Error('No more cards in the draw pile')
  if (topCard.type === 'WILD' || topCard.type === 'WILD DRAW') {
    throw new Error('The initial discard cannot be a wild card')
  }

  // UNO rule: Turn over the top card of the DRAW pile to begin a DISCARD pile
  const discardPile = createDeck([topCard])

  let currentColor: CardColor = topCard.color
  let direction = topCard.type === 'REVERSE' ? -1 : 1
  const initialDistance = topCard.type === 'SKIP' || topCard.type === 'DRAW' ? 2 : 1
  let playerInTurn = moveFrom(dealer, initialDistance)

  // UNO rule: If this card is turned up at the beginning of play, the first player must draw two cards
  if (topCard.type === 'DRAW') {
    const firstPlayer = moveFrom(dealer, 1)
    const card1 = drawPile.deal()
    const card2 = drawPile.deal()
    if (!card1 || !card2) throw new Error('No more cards in the draw pile')

    hands[firstPlayer].push(card1, card2)
  }

  function moveFrom(player: number, distance: number) {
    const numPlayers = players.length
    return (((player + distance * direction) % numPlayers) + numPlayers) % numPlayers
  }

  function canPlay(cardIndex: number) {
    const hand = hands[playerInTurn]
    const card = hand[cardIndex]
    if (card === undefined) return false
    const cardSymbol = card.type === 'NUMBERED' ? card.number : card.type
    const topCardSymbol = topCard?.type === 'NUMBERED' ? topCard.number : topCard?.type

    return (
      hasColor(card, currentColor) ||
      cardSymbol === topCardSymbol ||
      card.type === 'WILD' ||
      (card.type === 'WILD DRAW' && hand.every(c => !hasColor(c, currentColor)))
    )
  }

  return {
    get playerCount() {
      return players.length
    },
    get dealer() {
      return dealer
    },
    drawPile() {
      return drawPile
    },
    discardPile() {
      return discardPile
    },
    player(position) {
      const player = players[position]
      if (player === undefined) throw new Error('Player index is out of bounds')
      return player
    },
    playerHand(position) {
      const hand = hands[position]
      if (hand === undefined) throw new Error('Player index is out of bounds')
      return hand
    },
    playerInTurn() {
      return playerInTurn
    },
    canPlay,
    play(cardIndex, newColor) {
      const hand = hands[playerInTurn]
      const card = hand[cardIndex]
      if (card === undefined) throw new Error('Card index is out of bounds')

      if (!canPlay(cardIndex)) throw new Error('Card cannot be played')

      hand.splice(cardIndex, 1)
      discardPile.add(card)
      if (card.type === 'WILD' || card.type === 'WILD DRAW') {
        if (newColor === undefined) throw new Error('New color is required for wild cards')
        currentColor = newColor
      } else {
        currentColor = card.color
      }
      topCard = card
      if (card.type === 'REVERSE') direction *= -1
      const distance = card.type === 'SKIP' || card.type === 'DRAW' || card.type === 'WILD DRAW' ? 2 : 1
      playerInTurn = moveFrom(playerInTurn, distance)
    },
  }
}
