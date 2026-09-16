// oxlint-disable prefer-destructuring -- explicit state assignment is clearer than parenthesized reassignment
import { standardShuffler, type Shuffler } from '../utils/random_utils'
import { isColor, type Card, type CardColor } from './card'
import { createDeck, fromMemento as createDeckFromMemento, hasColor, type Deck } from './deck'
import type { Direction, RoundMemento } from './round.memento'

export type { RoundMemento } from './round.memento'

export type Round = {
  readonly playerCount: number
  readonly dealer: number
  drawPile(): Deck
  discardPile(): Deck
  player(position: number): string
  playerHand(position: number): Card[]
  playerInTurn(): number | undefined
  canPlay(cardIndex: number): boolean
  play(cardIndex: number, newColor?: CardColor): void
  toMemento(): RoundMemento
}

export type RoundState = {
  players: string[]
  dealer: number
  hands: Card[][]
  drawPile: Deck
  discardPile: Deck
  currentColor: CardColor
  currentDirection: Direction
  playerInTurn: number | undefined
}

type CreateRoundProps = {
  shuffler: Shuffler<Card>
} & (
  | {
      players: string[]
      dealer: number
      cardsPerPlayer?: number
      initialState?: never
    }
  | {
      initialState: RoundState
      players?: never
      dealer?: never
      cardsPerPlayer?: never
    }
)

export function createRound(props: CreateRoundProps): Round {
  const { shuffler } = props
  let players: string[]
  let dealer: number
  let hands: Card[][]
  let drawPile: Deck
  let discardPile: Deck
  let currentColor: CardColor
  let currentDirection: Direction
  let playerInTurn: number | undefined

  function movePlayer(player: number, distance: number) {
    const step = currentDirection === 'clockwise' ? 1 : -1
    return (((player + distance * step) % players.length) + players.length) % players.length
  }

  if (props.initialState) {
    const state = props.initialState
    players = state.players
    dealer = state.dealer
    hands = state.hands
    drawPile = state.drawPile
    discardPile = state.discardPile
    currentColor = state.currentColor
    currentDirection = state.currentDirection
    playerInTurn = state.playerInTurn
  } else {
    players = props.players
    dealer = props.dealer
    const { cardsPerPlayer = 7 } = props
    if (players.length < 2) throw new Error('At least 2 players are required')
    if (players.length > 10) throw new Error('At most 10 players are allowed')

    drawPile = createDeck()
    drawPile.shuffle(shuffler)
    hands = players.map(() =>
      Array.from({ length: cardsPerPlayer }, () => {
        const card = drawPile.deal()
        if (card === undefined) throw new Error('No more cards in the draw pile')
        return card
      }),
    )

    let topCard = drawPile.top()
    while (topCard?.type === 'WILD' || topCard?.type === 'WILD DRAW') {
      drawPile.shuffle(shuffler)
      topCard = drawPile.top()
    }

    topCard = drawPile.deal()
    if (topCard === undefined) throw new Error('No more cards in the draw pile')
    if (topCard.type === 'WILD' || topCard.type === 'WILD DRAW') {
      throw new Error('The initial discard cannot be a wild card')
    }

    discardPile = createDeck([topCard])
    currentColor = topCard.color
    currentDirection = topCard.type === 'REVERSE' ? 'counterclockwise' : 'clockwise'
    const initialDistance = topCard.type === 'SKIP' || topCard.type === 'DRAW' ? 2 : 1
    playerInTurn = movePlayer(dealer, initialDistance)

    if (topCard.type === 'DRAW') {
      const firstPlayer = movePlayer(dealer, 1)
      const card1 = drawPile.deal()
      const card2 = drawPile.deal()
      if (!card1 || !card2) throw new Error('No more cards in the draw pile')
      hands[firstPlayer].push(card1, card2)
    }
  }

  function canPlay(cardIndex: number) {
    if (playerInTurn === undefined) return false
    const hand = hands[playerInTurn]
    const card = hand[cardIndex]
    if (card === undefined) return false
    const cardSymbol = card.type === 'NUMBERED' ? card.number : card.type
    const topCard = discardPile.top()
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
      if (playerInTurn === undefined) throw new Error('The round has ended')
      const hand = hands[playerInTurn]
      const card = hand[cardIndex]
      if (card === undefined) throw new Error('Card index is out of bounds')
      if (!canPlay(cardIndex)) throw new Error('Card cannot be played')
      if ((card.type === 'WILD' || card.type === 'WILD DRAW') && newColor === undefined) {
        throw new Error('New color is required for wild cards')
      }

      hand.splice(cardIndex, 1)
      discardPile.add(card)
      if (card.type === 'WILD' || card.type === 'WILD DRAW') {
        currentColor = newColor as CardColor
      } else {
        currentColor = card.color
      }
      if (card.type === 'REVERSE') {
        currentDirection = currentDirection === 'clockwise' ? 'counterclockwise' : 'clockwise'
      }
      const distance = card.type === 'SKIP' || card.type === 'DRAW' || card.type === 'WILD DRAW' ? 2 : 1
      playerInTurn = hand.length === 0 ? undefined : movePlayer(playerInTurn, distance)
    },
    toMemento() {
      return {
        players: [...players],
        hands: hands.map(hand => hand.map(card => ({ ...card }))),
        drawPile: drawPile.toMemento().map(card => ({ ...card })),
        discardPile: discardPile.toMemento().map(card => ({ ...card })),
        currentColor,
        currentDirection,
        dealer,
        playerInTurn,
      }
    },
  }
}

export function fromMemento(memento: RoundMemento, shuffler: Shuffler<Card> = standardShuffler): Round {
  const { players, hands, currentColor, currentDirection, dealer, playerInTurn } = memento

  if (players.length < 2) throw new Error('At least 2 players are required')
  if (players.length > 10) throw new Error('At most 10 players are allowed')
  if (players.length !== hands.length) throw new Error('Each player must have one hand')
  if (!isColor(currentColor)) throw new Error(`[${currentColor}] Unsupported current color`)
  if (currentDirection !== 'clockwise' && currentDirection !== 'counterclockwise') {
    throw new Error(`[${currentDirection}] Unsupported direction`)
  }
  if (!Number.isInteger(dealer) || dealer < 0 || dealer >= players.length) {
    throw new Error('Dealer index is out of bounds')
  }
  if (
    playerInTurn !== undefined &&
    (!Number.isInteger(playerInTurn) || playerInTurn < 0 || playerInTurn >= players.length)
  ) {
    throw new Error('Player in turn index is out of bounds')
  }

  const restoredHands = hands.map(createDeckFromMemento).map(deck => deck.toMemento() as Card[])
  const winners = restoredHands.filter(hand => hand.length === 0).length
  if (winners > 1) throw new Error('A round cannot have more than one winner')
  if (winners === 0 && playerInTurn === undefined) throw new Error('An unfinished round needs a player in turn')

  const drawPile = createDeckFromMemento(memento.drawPile)
  const discardPile = createDeckFromMemento(memento.discardPile)
  const topCard = discardPile.top()
  if (topCard === undefined) throw new Error('The discard pile cannot be empty')
  if (topCard.type !== 'WILD' && topCard.type !== 'WILD DRAW' && topCard.color !== currentColor) {
    throw new Error('Current color must match the top discard')
  }

  return createRound({
    shuffler,
    initialState: {
      players: [...players],
      hands: restoredHands,
      drawPile,
      discardPile,
      currentColor,
      currentDirection,
      dealer,
      playerInTurn,
    },
  })
}
