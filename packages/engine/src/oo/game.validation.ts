import type { GameConfig } from '../domain/game'

export function validateRestoredGame(config: GameConfig): void {
  if (!config.restored) return
  const { players, targetScore, mode } = config
  const { scores, currentRound: round, roundNumber } = config.restored
  if (scores.length !== players.length || scores.some(score => !Number.isFinite(score) || score < 0)) {
    throw new Error('Each player must have a nonnegative score')
  }
  const winners = scores.flatMap((score, player) => (score >= targetScore ? [player] : []))
  if (winners.length > 1) throw new Error('A game cannot have several winners')
  if (round.playerCount !== players.length || players.some((player, index) => round.player(index) !== player)) {
    throw new Error('Current round must have the same players as the game')
  }
  const winner = round.winner()
  if (winners.length > 0 && (!round.hasEnded() || winner !== winners[0])) {
    throw new Error('A finished game requires a completed round won by the game winner')
  }
  if (winner !== undefined && scores[winner] < round.score()!)
    throw new Error('Scores must include the completed round points')
  if (!Number.isSafeInteger(roundNumber) || roundNumber < 1)
    throw new Error('Round number must be a positive safe integer')
  if (mode === 'round') {
    if (roundNumber !== 1) throw new Error('A single-round game must have round number 1')
    if (scores.some((score, player) => score !== (player === winner ? round.score()! : 0))) {
      throw new Error('Single-round scores must match the current round result')
    }
  }
}
