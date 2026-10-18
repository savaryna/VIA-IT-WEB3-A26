import type { GameConfig, GameMode } from './game'

export function validateGameMode(mode: GameMode): void {
  if (mode !== 'round' && mode !== 'score') throw new Error('Choose a valid game mode')
}

export function validatePlayerCount(playerCount: number): void {
  if (!Number.isInteger(playerCount) || playerCount < 2 || playerCount > 10) {
    throw new Error('A game requires 2 to 10 players')
  }
}

export function validateTargetScore(targetScore: number): void {
  if (!Number.isSafeInteger(targetScore) || targetScore < 1) {
    throw new Error('Target score must be a positive safe integer')
  }
}

export function validateCardsPerPlayer(cardsPerPlayer: number, playerCount: number): void {
  if (!Number.isInteger(cardsPerPlayer) || cardsPerPlayer < 1 || playerCount * cardsPerPlayer >= 108) {
    throw new Error('Invalid cards per player')
  }
}

export function validateGameConfig({
  mode,
  players,
  targetScore,
  cardsPerPlayer,
}: Pick<GameConfig, 'mode' | 'players' | 'targetScore' | 'cardsPerPlayer'>): void {
  validateGameMode(mode)
  validatePlayerCount(players.length)
  validateTargetScore(targetScore)
  validateCardsPerPlayer(cardsPerPlayer, players.length)
}
