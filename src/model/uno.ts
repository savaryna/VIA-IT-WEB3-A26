import { standardRandomizer, standardShuffler, type Randomizer, type Shuffler } from '../utils/random_utils'
import type { Card } from './card'
import { createRound, fromMemento as restoreRound, type Round } from './round'
import type { GameMemento } from './uno.memento'

export type { GameMemento } from './uno.memento'

export type Game = {
  readonly playerCount: number
  readonly targetScore: number
  player(position: number): string
  score(position: number): number
  winner(): number | undefined
  currentRound(): Round | undefined
  toMemento(): GameMemento
}

export type GameConfig = {
  players: string[]
  targetScore: number
  cardsPerPlayer: number
  randomizer: Randomizer
  shuffler: Shuffler<Card>
}

function validateConfig(players: string[], targetScore: number, cardsPerPlayer: number) {
  if (players.length < 2 || players.length > 10) throw new Error('A game requires 2 to 10 players')
  if (!Number.isFinite(targetScore) || targetScore <= 0) throw new Error('Target score must be positive')
  if (!Number.isInteger(cardsPerPlayer) || cardsPerPlayer < 1 || players.length * cardsPerPlayer >= 108) {
    throw new Error('Invalid cards per player')
  }
}

function createGameState(config: GameConfig, initialScores: number[], initialRound?: Round): Game {
  const players = [...config.players]
  const { targetScore, cardsPerPlayer, shuffler, randomizer } = config
  const scores = [...initialScores]
  let round = initialRound
  let winningPlayer: number | undefined = scores.findIndex(score => score >= targetScore)
  if (winningPlayer === -1) winningPlayer = undefined

  function watchRound(current: Round) {
    current.onEnd(({ winner }) => {
      scores[winner] += current.score()!
      if (scores[winner] >= targetScore) {
        winningPlayer = winner
        round = undefined
      } else {
        startRound((current.dealer + 1) % players.length)
      }
    })
  }

  function startRound(dealer: number) {
    if (!Number.isInteger(dealer) || dealer < 0 || dealer >= players.length) {
      throw new Error('Dealer index is out of bounds')
    }
    round = createRound({ players, dealer, cardsPerPlayer, shuffler })
    watchRound(round)
  }

  function validatePosition(position: number) {
    if (!Number.isInteger(position) || position < 0 || position >= players.length) {
      throw new Error('Player index is out of bounds')
    }
  }

  if (round) watchRound(round)
  else if (winningPlayer === undefined) startRound(randomizer(players.length))

  return {
    get playerCount() {
      return players.length
    },
    get targetScore() {
      return targetScore
    },
    player(position) {
      validatePosition(position)
      return players[position]
    },
    score(position) {
      validatePosition(position)
      return scores[position]
    },
    winner() {
      return winningPlayer
    },
    currentRound() {
      return round
    },
    toMemento() {
      return {
        players: [...players],
        targetScore,
        cardsPerPlayer,
        scores: [...scores],
        ...(round ? { currentRound: round.toMemento() } : {}),
      }
    },
  }
}

export function createGame({
  players = ['A', 'B'],
  targetScore = 500,
  cardsPerPlayer = 7,
  randomizer = standardRandomizer,
  shuffler = standardShuffler,
}: Partial<GameConfig> = {}): Game {
  validateConfig(players, targetScore, cardsPerPlayer)
  return createGameState(
    { players, targetScore, cardsPerPlayer, randomizer, shuffler },
    players.map(() => 0),
  )
}

export function fromMemento(
  memento: GameMemento,
  randomizer: Randomizer = standardRandomizer,
  shuffler: Shuffler<Card> = standardShuffler,
): Game {
  const { players, targetScore, cardsPerPlayer, scores, currentRound } = memento
  validateConfig(players, targetScore, cardsPerPlayer)
  if (scores.length !== players.length || scores.some(score => !Number.isFinite(score) || score < 0)) {
    throw new Error('Each player must have a nonnegative score')
  }
  const winners = scores.filter(score => score >= targetScore).length
  if (winners > 1) throw new Error('A game cannot have several winners')
  if (winners === 0 && !currentRound) throw new Error('An unfinished game requires a current round')
  if (winners > 0 && currentRound) throw new Error('A finished game cannot have a current round')
  const restoredRound = currentRound ? restoreRound(currentRound, shuffler) : undefined
  if (
    restoredRound &&
    (restoredRound.hasEnded() ||
      restoredRound.playerCount !== players.length ||
      players.some((player, index) => restoredRound.player(index) !== player))
  ) {
    throw new Error('Current round must be unfinished and have the same players as the game')
  }
  return createGameState({ players, targetScore, cardsPerPlayer, randomizer, shuffler }, scores, restoredRound)
}
