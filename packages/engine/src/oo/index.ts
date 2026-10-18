import type { Engine } from '../domain/engine'
import * as deck from './deck'
import * as game from './game'
import * as hand from './hand'
import * as round from './round'

export * from '../index'

export const createDeck: Engine['createDeck'] = deck.createDeck
export const createDeckFromMemento: Engine['createDeckFromMemento'] = deck.fromMemento
export const createHand: Engine['createHand'] = hand.createHand
export const createHandFromMemento: Engine['createHandFromMemento'] = hand.fromMemento
export const createRound: Engine['createRound'] = round.createRound
export const createRoundFromMemento: Engine['createRoundFromMemento'] = round.fromMemento
export const createGame: Engine['createGame'] = game.createGame
export const createGameFromMemento: Engine['createGameFromMemento'] = game.fromMemento
