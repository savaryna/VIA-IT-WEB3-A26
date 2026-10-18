import { cardPoints, hasColor, isColor, type Card, type CardColor } from '../domain/card'
import type { Deck } from '../domain/deck'
import type { Hand } from '../domain/hand'
// oxlint-disable prefer-destructuring -- explicit assignments keep closure state initialization readable
import { standardShuffler, type Shuffler } from '../domain/random'
import type { Direction, Round, RoundEnd, RoundConfig } from '../domain/round'
import { validateCardsPerPlayer, validatePlayerCount } from '../domain/validation'
import { roundMementoSchema } from '../schemas'
import { createDeck } from './deck'
import { createHand } from './hand'
import { validateRestoredRound } from './round.validation'

export type { RoundMemento } from '../domain/round.memento'

export function createRound(config: RoundConfig): Round {
  const { shuffler } = config
  const players = [...config.players]
  let dealer = config.dealer
  let hands: Hand[]
  let drawPile: Deck
  let discardPile: Deck
  let currentColor: CardColor
  let currentDirection: Direction
  let playerInTurn: number | undefined
  let drawnCardIndex: number | undefined
  let wildDrawResult: NonNullable<RoundConfig['restored']>['wildDrawResult']
  let wildDrawChallenge: NonNullable<RoundConfig['restored']>['wildDrawChallenge']
  let unoDeclaration: number | undefined
  let unoFailure: number | undefined
  const endCallbacks: ((event: RoundEnd) => void)[] = []

  if (config.restored) {
    validateRestoredRound(config)
    const restored = config.restored
    hands = restored.hands.map(hand => createHand(hand.cards()))
    drawPile = restored.drawPile
    discardPile = restored.discardPile
    currentColor = restored.currentColor
    currentDirection = restored.currentDirection
    playerInTurn = restored.playerInTurn
    drawnCardIndex = restored.drawnCardIndex
    wildDrawResult = restored.wildDrawResult
    wildDrawChallenge = restored.wildDrawChallenge
    unoDeclaration = restored.unoDeclaration
    unoFailure = restored.unoFailure
  } else {
    const { cardsPerPlayer = 7 } = config
    validatePlayerCount(players.length)
    validateCardsPerPlayer(cardsPerPlayer, players.length)

    if (!Number.isInteger(config.dealer) || config.dealer < 0) {
      throw new Error('Dealer index is out of bounds')
    }

    // Fresh deals historically accept rotating dealer counters; store their seat index.
    dealer = config.dealer % players.length
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

    if (topCard.type === 'DRAW') drawCards(movePlayer(dealer, 1), 2)
  }

  function validatePlayer(player: number) {
    if (!Number.isInteger(player) || player < 0 || player >= players.length)
      throw new Error('Player index is out of bounds')
  }

  function movePlayer(player: number, distance: number) {
    const step = currentDirection === 'clockwise' ? 1 : -1
    return (((player + distance * step) % players.length) + players.length) % players.length
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
    if (playerInTurn === undefined || wildDrawChallenge !== undefined) return false
    if (drawnCardIndex !== undefined && cardIndex !== drawnCardIndex) return false
    const hand = hands[playerInTurn]
    const card = hand.get(cardIndex)
    if (card === undefined) return false
    if (card.type === 'WILD DRAW') return true
    const cardSymbol = card.type === 'NUMBERED' ? card.number : card.type
    const topCard = discardPile.top()
    const topCardSymbol = topCard?.type === 'NUMBERED' ? topCard.number : topCard?.type

    return hasColor(card, currentColor) || cardSymbol === topCardSymbol || card.type === 'WILD'
  }

  function canSayUno(player: number) {
    validatePlayer(player)
    return (
      playerInTurn !== undefined &&
      (unoFailure === player ||
        (wildDrawChallenge === undefined && player === playerInTurn && hands[player].size === 2))
    )
  }

  function sayUno(player: number) {
    if (playerInTurn === undefined) throw new Error('The round has ended')
    if (!canSayUno(player)) return false
    if (unoFailure === player) unoFailure = undefined
    if (player === playerInTurn && hands[player].size === 2) unoDeclaration = player
    return true
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
    currentColor() {
      return currentColor
    },
    currentDirection() {
      return currentDirection
    },
    playableCardIndices(player) {
      validatePlayer(player)
      if (player !== playerInTurn) return []
      return hands[player].cards().flatMap((_, index) => (canPlay(index) ? [index] : []))
    },
    mustPlayDrawn() {
      return playerInTurn !== undefined && drawnCardIndex !== undefined
    },
    declaredUno() {
      return playerInTurn === undefined ? undefined : unoDeclaration
    },
    catchablePlayer() {
      return playerInTurn === undefined ? undefined : unoFailure
    },
    challenger() {
      return wildDrawChallenge === undefined ? undefined : playerInTurn
    },
    challengeResult(player) {
      validatePlayer(player)
      if (wildDrawResult?.viewer !== player) return undefined
      const { offender, guilty, hand } = wildDrawResult
      return { offender, guilty, hand: hand.map(card => ({ ...card })) }
    },
    hasEnded() {
      return playerInTurn === undefined
    },
    winner() {
      return playerInTurn === undefined ? hands.findIndex(hand => hand.size === 0) : undefined
    },
    score() {
      if (playerInTurn !== undefined) return undefined
      return hands.reduce((total, hand) => total + hand.cards().reduce((sum, card) => sum + cardPoints(card), 0), 0)
    },
    onEnd(callback) {
      endCallbacks.push(callback)
    },
    canPlay,
    canPlayAny() {
      return playerInTurn !== undefined && hands[playerInTurn].some((_, index) => canPlay(index))
    },
    canSayUno,
    sayUno,
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
      if (!wildDrawChallenge || challenger !== playerInTurn) {
        throw new Error('Only the affected player can challenge immediately after Wild Draw Four')
      }
      const { offender, guilty } = wildDrawChallenge
      wildDrawResult = {
        viewer: challenger,
        offender,
        guilty,
        hand: hands[offender].cards().map(card => ({ ...card })),
      }
      drawCards(guilty ? offender : challenger, guilty ? 4 : 6)
      if (!guilty) playerInTurn = movePlayer(challenger, 1)
      if (guilty && unoFailure === offender) unoFailure = undefined
      wildDrawChallenge = undefined
    },
    draw() {
      if (playerInTurn === undefined) throw new Error('The round has ended')
      wildDrawResult = undefined
      if (wildDrawChallenge !== undefined) {
        drawCards(playerInTurn, 4)
        playerInTurn = movePlayer(playerInTurn, 1)
        wildDrawChallenge = undefined
        unoDeclaration = undefined
        unoFailure = undefined
        return
      }
      if (drawnCardIndex !== undefined) throw new Error('The drawn card must be played')
      const hand = hands[playerInTurn]
      drawCards(playerInTurn, 1)
      unoDeclaration = undefined
      unoFailure = undefined
      if (canPlay(hand.size - 1)) drawnCardIndex = hand.size - 1
      else playerInTurn = movePlayer(playerInTurn, 1)
    },
    play(cardIndex, newColor, options = {}) {
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

      wildDrawResult = undefined
      // A valid play starts a turn and closes the previous accusation window.
      if (options.sayUno) sayUno(playerInTurn)
      const saidUno = unoDeclaration === playerInTurn
      unoDeclaration = undefined
      unoFailure = undefined
      const guilty = card.type === 'WILD DRAW' && hand.some(c => hasColor(c, currentColor))
      hand.remove(cardIndex)
      if (hand.size === 1 && !saidUno) unoFailure = playerInTurn
      drawnCardIndex = undefined
      discardPile.add(card)
      currentColor = playedColor
      if (card.type === 'REVERSE') {
        currentDirection = currentDirection === 'clockwise' ? 'counterclockwise' : 'clockwise'
      }
      const penalty = card.type === 'DRAW' ? 2 : card.type === 'WILD DRAW' ? 4 : 0
      if (card.type === 'WILD DRAW' && hand.size > 0) {
        wildDrawChallenge = { offender: playerInTurn, guilty }
      } else if (penalty > 0) drawCards(movePlayer(playerInTurn, 1), penalty)
      const skipsNextPlayer = card.type === 'SKIP' || penalty > 0 || (card.type === 'REVERSE' && players.length === 2)
      const distance = skipsNextPlayer ? 2 : 1
      const winner = playerInTurn
      playerInTurn = hand.size === 0 ? undefined : movePlayer(playerInTurn, wildDrawChallenge ? 1 : distance)
      if (playerInTurn === undefined) {
        endCallbacks.forEach(callback => callback({ winner }))
      }
      return card
    },
    toMemento() {
      return {
        players: [...players],
        hands: hands.map(hand => hand.toMemento()),
        drawPile: drawPile.toMemento(),
        discardPile: discardPile.toMemento(),
        currentColor,
        currentDirection,
        dealer,
        playerInTurn,
        ...(drawnCardIndex !== undefined ? { drawnCardIndex } : {}),
        ...(wildDrawResult !== undefined
          ? { wildDrawResult: { ...wildDrawResult, hand: wildDrawResult.hand.map(card => ({ ...card })) } }
          : {}),
        ...(wildDrawChallenge !== undefined ? { wildDrawChallenge: { ...wildDrawChallenge } } : {}),
        ...(unoDeclaration !== undefined ? { unoDeclaration } : {}),
        ...(unoFailure !== undefined ? { unoFailure } : {}),
      }
    },
  }
}

export function fromMemento(input: unknown, shuffler: Shuffler<Card> = standardShuffler): Round {
  const { players, dealer, hands, drawPile, discardPile, ...restored } = roundMementoSchema.parse(input)
  return createRound({
    players,
    dealer,
    shuffler,
    restored: {
      ...restored,
      playerInTurn: restored.playerInTurn,
      hands: hands.map(createHand),
      drawPile: createDeck(drawPile),
      discardPile: createDeck(discardPile),
    },
  })
}
