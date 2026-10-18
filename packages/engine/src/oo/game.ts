import type { Card } from '../domain/card'
import type { Game, GameConfig } from '../domain/game'
import { standardRandomizer, standardShuffler, type Randomizer, type Shuffler } from '../domain/random'
import type { Round } from '../domain/round'
import { validateGameConfig } from '../domain/validation'
import { gameMementoSchema } from '../schemas'
import { validateRestoredGame } from './game.validation'
import { createRound, fromMemento as createRoundFromMemento } from './round'

export type { GameMemento } from '../domain/game.memento'

export function createGame({
  mode = 'score',
  players: initialPlayers = ['A', 'B'],
  targetScore = 500,
  cardsPerPlayer = 7,
  randomizer = standardRandomizer,
  shuffler = standardShuffler,
  restored,
}: Partial<GameConfig> = {}): Game {
  const config = { mode, players: [...initialPlayers], targetScore, cardsPerPlayer }
  validateGameConfig(config)
  validateRestoredGame({ ...config, randomizer, shuffler, restored })
  const { players } = config
  const scores = restored ? [...restored.scores] : players.map(() => 0)
  let roundNumber = restored?.roundNumber ?? 1
  let round: Round
  if (restored) {
    round = restored.currentRound
  } else {
    const dealer = randomizer(players.length)
    if (!Number.isInteger(dealer) || dealer < 0 || dealer >= players.length)
      throw new Error('Dealer index is out of bounds')
    round = createRound({ players, dealer, cardsPerPlayer, shuffler })
  }
  let winningPlayer = mode === 'round' ? round.winner() : scores.findIndex(score => score >= targetScore)
  if (winningPlayer === -1) winningPlayer = undefined

  function watchRound(current: Round) {
    current.onEnd(({ winner }) => {
      const points = current.score()!
      scores[winner] += points
      if (mode === 'round' || scores[winner] >= targetScore) winningPlayer = winner
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

  if (!round.hasEnded()) watchRound(round)

  return {
    get mode() {
      return mode
    },
    get playerCount() {
      return players.length
    },
    get targetScore() {
      return targetScore
    },
    get roundNumber() {
      return roundNumber
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
    startNextRound() {
      if (winningPlayer !== undefined) throw new Error('The game has ended')
      if (!round.hasEnded()) throw new Error('The current round is not complete')
      if (roundNumber === Number.MAX_SAFE_INTEGER) throw new Error('Round number cannot be incremented')
      startRound((round.dealer + 1) % players.length)
      roundNumber++
    },
    toMemento() {
      return {
        mode,
        players: [...players],
        targetScore,
        cardsPerPlayer,
        scores: [...scores],
        roundNumber,
        currentRound: round.toMemento(),
      }
    },
  }
}

export function fromMemento(
  input: unknown,
  _randomizer: Randomizer = standardRandomizer,
  shuffler: Shuffler<Card> = standardShuffler,
): Game {
  const { scores, currentRound, roundNumber, ...config } = gameMementoSchema.parse(input)
  return createGame({
    ...config,
    shuffler,
    restored: { scores, currentRound: createRoundFromMemento(currentRound, shuffler), roundNumber },
  })
}
