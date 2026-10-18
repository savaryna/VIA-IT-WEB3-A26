import type { RoundConfig } from '../domain/round'
import { validatePlayerCount } from '../domain/validation'

function fail(message: string): never {
  throw new Error(message)
}

export function validateRestoredRound(config: RoundConfig): void {
  if (!config.restored) return
  const { players, dealer, restored } = config
  validatePlayerCount(players.length)
  const { hands, playerInTurn, drawnCardIndex, unoDeclaration, unoFailure, wildDrawChallenge, wildDrawResult } =
    restored
  const validPlayer = (index: number) => Number.isInteger(index) && index >= 0 && index < players.length
  if (hands.length !== players.length) fail('Each player must have one hand')
  if (!validPlayer(dealer)) fail('Dealer index is out of bounds')
  if (playerInTurn !== undefined && !validPlayer(playerInTurn)) fail('Player in turn index is out of bounds')
  const winners = hands.filter(hand => hand.size === 0).length
  if (winners > 1) fail('A round cannot have more than one winner')
  if (winners === 0 && playerInTurn === undefined) fail('An unfinished round needs a player in turn')
  if (winners > 0 && playerInTurn !== undefined) fail('A finished round cannot have a player in turn')
  for (const [name, player] of Object.entries({ unoDeclaration, unoFailure })) {
    if (player !== undefined && !validPlayer(player)) fail(`${name} index is out of bounds`)
  }
  if (
    drawnCardIndex !== undefined &&
    (playerInTurn === undefined ||
      !Number.isInteger(drawnCardIndex) ||
      drawnCardIndex < 0 ||
      drawnCardIndex !== hands[playerInTurn].size - 1)
  ) {
    fail('Drawn card must be the last card in the current player hand')
  }
  if (unoDeclaration !== undefined && (unoDeclaration !== playerInTurn || hands[unoDeclaration].size !== 2)) {
    fail('UNO declaration requires the current player to have two cards')
  }
  if (unoFailure !== undefined && hands[unoFailure].size !== 1) fail('UNO failure requires a player with one card')
  const topCard = restored.discardPile.top()
  if (!topCard) fail('The discard pile cannot be empty')
  if (topCard.type !== 'WILD' && topCard.type !== 'WILD DRAW' && topCard.color !== restored.currentColor) {
    fail('Current color must match the top discard')
  }
  if (wildDrawChallenge) {
    const step = restored.currentDirection === 'clockwise' ? 1 : -1
    const affected = (wildDrawChallenge.offender + step + players.length) % players.length
    if (
      !validPlayer(wildDrawChallenge.offender) ||
      topCard.type !== 'WILD DRAW' ||
      playerInTurn !== affected ||
      drawnCardIndex !== undefined
    ) {
      fail('Invalid pending Wild Draw Four challenge')
    }
  }
  if (
    wildDrawResult &&
    (!validPlayer(wildDrawResult.viewer) ||
      !validPlayer(wildDrawResult.offender) ||
      wildDrawResult.viewer === wildDrawResult.offender)
  ) {
    fail('Invalid Wild Draw Four result')
  }
}
