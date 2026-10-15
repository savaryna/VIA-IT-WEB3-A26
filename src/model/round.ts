// oxlint-disable prefer-destructuring -- explicit state assignment is clearer than parenthesized reassignment
import { standardShuffler, type Shuffler } from '../utils/random_utils'
import { isColor, type Card, type CardColor } from './card'
import { createDeck, fromMemento as createDeckFromMemento, hasColor, type Deck } from './deck'
import { createHand, fromMemento as createHandFromMemento, type Hand } from './hand'
import type { Direction, RoundMemento } from './round.memento'

export type { RoundMemento } from './round.memento'

export type Round = {
  readonly playerCount: number
  readonly dealer: number
  drawPile(): Deck
  discardPile(): Deck
  player(position: number): string
  playerHand(position: number): readonly Card[]
  playerInTurn(): number | undefined
  hasEnded(): boolean
  winner(): number | undefined
  score(): number | undefined
  canPlay(cardIndex: number): boolean
  canPlayAny(): boolean
  sayUno(player: number): void
  catchUnoFailure(accusation: { accuser: number; accused: number }): boolean
  challengeWildDrawFour(challenger: number): void
  draw(): void
  play(cardIndex: number, newColor?: CardColor): Card
  toMemento(): RoundMemento
}

export type RoundState = {
  players: string[]
  dealer: number
  hands: Hand[]
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
  let hands: Hand[]
  let drawPile: Deck
  let discardPile: Deck
  let currentColor: CardColor
  let currentDirection: Direction
  let playerInTurn: number | undefined
  let drawnCardIndex: number | undefined
  let wildDrawChallenger: number | undefined
  let unoDeclaration: number | undefined
  let unoFailure: number | undefined

  function validatePlayer(player: number) {
    if (!Number.isInteger(player) || player < 0 || player >= players.length) {
      throw new Error('Player index is out of bounds')
    }
  }

  function movePlayer(player: number, distance: number) {
    const step = currentDirection === 'clockwise' ? 1 : -1
    return (((player + distance * step) % players.length) + players.length) % players.length
  }

  if (props.initialState) {
    const state = props.initialState
    players = [...state.players]
    dealer = state.dealer
    hands = state.hands.map(hand => createHand(hand.cards()))
    drawPile = state.drawPile
    discardPile = state.discardPile
    currentColor = state.currentColor
    currentDirection = state.currentDirection
    playerInTurn = state.playerInTurn
  } else {
    players = [...props.players]
    dealer = props.dealer
    const { cardsPerPlayer = 7 } = props
    if (players.length < 2) throw new Error('At least 2 players are required')
    if (players.length > 10) throw new Error('At most 10 players are allowed')
    if (!Number.isInteger(cardsPerPlayer) || cardsPerPlayer < 1) {
      throw new Error('Cards per player must be a positive integer')
    }

    if (!Number.isInteger(dealer) || dealer < 0) {
      throw new Error('Dealer index is out of bounds')
    }
    if (players.length * cardsPerPlayer >= 108) {
      throw new Error('Not enough cards to deal and start the discard pile')
    }

    drawPile = createDeck()
    drawPile.shuffle(shuffler)
    hands = players.map(() =>
      createHand(
        Array.from({ length: cardsPerPlayer }, () => {
          const card = drawPile.deal()
          if (card === undefined) throw new Error('No more cards in the draw pile')
          return card
        }),
      ),
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
      drawCards(movePlayer(dealer, 1), 2)
    }
  }

  function replenishDrawPile() {
    if (drawPile.size > 0 || discardPile.size <= 1) return
    const topCard = discardPile.deal()!
    drawPile = discardPile
    discardPile = createDeck([topCard])
    drawPile.shuffle(shuffler)
  }

  function drawCards(player: number, count: number) {
    for (let i = 0; i < count; i++) {
      replenishDrawPile()
      const card = drawPile.deal()
      if (card === undefined) throw new Error('No more cards in the draw pile')
      hands[player].add(card)
      replenishDrawPile()
    }
  }

  function canPlay(cardIndex: number) {
    if (playerInTurn === undefined) return false
    if (drawnCardIndex !== undefined && cardIndex !== drawnCardIndex) return false
    const hand = hands[playerInTurn]
    const card = hand.get(cardIndex)
    if (card === undefined) return false
    if (card.type === 'WILD DRAW') return !hand.some(c => hasColor(c, currentColor))
    const cardSymbol = card.type === 'NUMBERED' ? card.number : card.type
    const topCard = discardPile.top()
    const topCardSymbol = topCard?.type === 'NUMBERED' ? topCard.number : topCard?.type

    return hasColor(card, currentColor) || cardSymbol === topCardSymbol || card.type === 'WILD'
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
      return hand.cards()
    },
    playerInTurn() {
      return playerInTurn
    },
    hasEnded() {
      return playerInTurn === undefined
    },
    winner() {
      return playerInTurn === undefined ? hands.findIndex(hand => hand.size === 0) : undefined
    },
    score() {
      if (playerInTurn !== undefined) return undefined
      return hands.reduce(
        (total, hand) =>
          total +
          hand.cards().reduce((sum, card) => {
            if (card.type === 'NUMBERED') return sum + card.number
            return sum + (card.type === 'WILD' || card.type === 'WILD DRAW' ? 50 : 20)
          }, 0),
        0,
      )
    },
    canPlay,
    canPlayAny() {
      return playerInTurn !== undefined && hands[playerInTurn].some((_, index) => canPlay(index))
    },
    sayUno(player) {
      if (playerInTurn === undefined) throw new Error('The round has ended')
      validatePlayer(player)
      if (unoFailure === player) unoFailure = undefined
      if (player === playerInTurn && hands[player].size === 2) unoDeclaration = player
    },
    catchUnoFailure({ accuser, accused }) {
      if (playerInTurn === undefined) throw new Error('The round has ended')
      validatePlayer(accuser)
      validatePlayer(accused)
      if (accuser === accused || unoFailure !== accused) return false
      drawCards(accused, 4)
      unoFailure = undefined
      return true
    },
    challengeWildDrawFour(challenger) {
      if (playerInTurn === undefined) throw new Error('The round has ended')
      if (challenger !== wildDrawChallenger || wildDrawChallenger === undefined) {
        throw new Error('Only the affected player can challenge immediately after Wild Draw Four')
      }
      // Illegal Wild Draw Four plays are rejected by canPlay, so a challenge
      // always fails: the challenger already drew four and now draws two more.
      drawCards(challenger, 2)
      wildDrawChallenger = undefined
    },
    draw() {
      if (playerInTurn === undefined) throw new Error('The round has ended')
      if (drawnCardIndex !== undefined) throw new Error('The drawn card must be played')
      const hand = hands[playerInTurn]
      drawCards(playerInTurn, 1)
      unoDeclaration = undefined
      unoFailure = undefined
      wildDrawChallenger = undefined
      if (canPlay(hand.size - 1)) drawnCardIndex = hand.size - 1
      else playerInTurn = movePlayer(playerInTurn, 1)
    },
    play(cardIndex, newColor) {
      if (playerInTurn === undefined) throw new Error('The round has ended')
      const hand = hands[playerInTurn]
      const card = hand.get(cardIndex)
      if (card === undefined) throw new Error('Card index is out of bounds')
      if (!canPlay(cardIndex)) throw new Error('Card cannot be played')
      let playedColor: CardColor
      if (card.type === 'WILD' || card.type === 'WILD DRAW') {
        if (!isColor(newColor)) throw new Error('A valid new color is required for wild cards')
        playedColor = newColor
      } else {
        if (newColor !== undefined) throw new Error('Only wild cards can name a new color')
        playedColor = card.color
      }

      // A valid play starts a turn and closes the previous accusation window.
      const saidUno = unoDeclaration === playerInTurn
      unoDeclaration = undefined
      unoFailure = undefined
      wildDrawChallenger = undefined
      hand.remove(cardIndex)
      if (hand.size === 1 && !saidUno) unoFailure = playerInTurn
      drawnCardIndex = undefined
      discardPile.add(card)
      currentColor = playedColor
      if (card.type === 'REVERSE') {
        currentDirection = currentDirection === 'clockwise' ? 'counterclockwise' : 'clockwise'
      }
      const penalty = card.type === 'DRAW' ? 2 : card.type === 'WILD DRAW' ? 4 : 0
      if (penalty > 0) drawCards(movePlayer(playerInTurn, 1), penalty)
      if (card.type === 'WILD DRAW') wildDrawChallenger = movePlayer(playerInTurn, 1)
      const skipsNextPlayer = card.type === 'SKIP' || penalty > 0 || (card.type === 'REVERSE' && players.length === 2)
      const distance = skipsNextPlayer ? 2 : 1
      playerInTurn = hand.size === 0 ? undefined : movePlayer(playerInTurn, distance)
      return card
    },
    toMemento() {
      return {
        players: [...players],
        hands: hands.map(hand => hand.toMemento()),
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

  const restoredHands = hands.map(createHandFromMemento)
  const winners = restoredHands.filter(hand => hand.size === 0).length
  if (winners > 1) throw new Error('A round cannot have more than one winner')
  if (winners === 0 && playerInTurn === undefined) throw new Error('An unfinished round needs a player in turn')
  if (winners > 0 && playerInTurn !== undefined) throw new Error('A finished round cannot have a player in turn')

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
