import type { Shuffler } from '../utils/random_utils'
import type { Card } from './card'
import { createDeck, type Deck } from './deck'

export type { RoundMemento } from './round.memento'

export type Round = {
  readonly playerCount: number
  readonly dealer: number
  drawPile(): Deck
  discardPile(): Deck
  player(position: number): string
  playerHand(position: number): Card[]
  playerInTurn(): number
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

  // UNO rule: Turn over the top card of the DRAW pile to begin a DISCARD pile
  const discardPile = createDeck([topCard])

  // UNO rule: If this card is turned up at the beginning of play, the first player must draw two cards
  if (topCard.type === 'DRAW') {
    const firstPlayer = playerInTurn()
    const card1 = drawPile.deal()
    const card2 = drawPile.deal()
    if (!card1 || !card2) throw new Error('No more cards in the draw pile')

    hands[firstPlayer].push(card1, card2)
  }

  function playerInTurn() {
    // UNO rule: This card reverses direction of play
    const direction = topCard?.type === 'REVERSE' ? -1 : 1
    // UNO rule: The next person in line to play after this card is played loses his/her turn
    const distance = topCard?.type === 'SKIP' ? 2 : 1
    const numPlayers = players.length

    return (((dealer + distance * direction) % numPlayers) + numPlayers) % numPlayers
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
    playerInTurn,
  }
}
