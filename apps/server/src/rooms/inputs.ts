import { cardColorSchema, gameModeSchema } from '@uno/engine/schemas'
import { z } from 'zod'

const indexSchema = z.number().int().nonnegative()

export const playerActionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('play'),
    cardIndex: indexSchema,
    newColor: cardColorSchema
      .nullish()
      .transform(value => value ?? undefined)
      .optional(),
    sayUno: z
      .boolean()
      .nullish()
      .transform(value => value ?? false)
      .optional(),
  }),
  z.object({ type: z.literal('draw') }),
  z.object({ type: z.literal('sayUno') }),
  z.object({ type: z.literal('catchUnoFailure'), accused: indexSchema }),
  z.object({ type: z.literal('challenge') }),
])

export type PlayerAction = z.output<typeof playerActionSchema>

// Room limits are narrower than the engine's 2–10 player limit.
export const createRoomSchema = z.object({
  mode: gameModeSchema,
  targetScore: z
    .number({ error: 'Target score must be a positive safe integer' })
    .int({ error: 'Target score must be a positive safe integer' })
    .positive({ error: 'Target score must be a positive safe integer' }),
  capacity: z
    .number({ error: 'Choose 2–4 players' })
    .int({ error: 'Choose 2–4 players' })
    .min(2, 'Choose 2–4 players')
    .max(4, 'Choose 2–4 players'),
})
