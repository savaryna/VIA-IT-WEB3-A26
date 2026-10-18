import { z } from 'zod'

import { colors, numbers } from './domain/card'

export const cardColorSchema = z.enum(colors)
export const gameModeSchema = z.enum(['round', 'score'], { error: 'Choose a valid game mode' })

// Object parsing strips irrelevant fields, matching the existing memento readers.
export const cardSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('NUMBERED'), color: cardColorSchema, number: z.union(numbers.map(n => z.literal(n))) }),
  z.object({ type: z.literal('SKIP'), color: cardColorSchema }),
  z.object({ type: z.literal('REVERSE'), color: cardColorSchema }),
  z.object({ type: z.literal('DRAW'), color: cardColorSchema }),
  z.object({ type: z.literal('WILD') }),
  z.object({ type: z.literal('WILD DRAW') }),
])

export const cardsSchema = z.array(cardSchema)

const playersSchema = z
  .array(z.string())
  .min(2, 'A game requires 2 to 10 players')
  .max(10, 'A game requires 2 to 10 players')

// Schemas validate serialized shape; engine construction validates state relationships.
export const roundMementoSchema = z.object({
  players: playersSchema,
  hands: z.array(cardsSchema),
  drawPile: cardsSchema,
  discardPile: cardsSchema,
  currentColor: cardColorSchema,
  currentDirection: z.enum(['clockwise', 'counterclockwise']),
  dealer: z.number(),
  playerInTurn: z.number().optional(),
  drawnCardIndex: z.number().optional(),
  wildDrawResult: z
    .object({ viewer: z.number(), offender: z.number(), guilty: z.boolean(), hand: cardsSchema })
    .optional(),
  wildDrawChallenge: z.object({ offender: z.number(), guilty: z.boolean() }).optional(),
  unoDeclaration: z.number().optional(),
  unoFailure: z.number().optional(),
})

export const gameMementoSchema = z.object({
  mode: gameModeSchema,
  players: playersSchema,
  targetScore: z.number().int().positive(),
  cardsPerPlayer: z.number().int().positive(),
  scores: z.array(z.number()),
  roundNumber: z
    .number({ error: 'Round number must be a positive safe integer' })
    .int('Round number must be a positive safe integer')
    .positive('Round number must be a positive safe integer'),
  currentRound: roundMementoSchema,
})
