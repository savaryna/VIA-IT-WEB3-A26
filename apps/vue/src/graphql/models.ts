import { cardSchema } from '@uno/engine/schemas'

import type { RoomFieldsFragment } from './generated'

// Convert GraphQL's nullable card fields into the engine's card variants.
export function roomFromGraphQL(room: RoomFieldsFragment) {
  const { round } = room
  return {
    ...room,
    round: round
      ? {
          ...round,
          hand: round.hand.map(card => cardSchema.parse(card)),
          discardTop: cardSchema.parse(round.discardTop),
          challengeResult: round.challengeResult
            ? {
                ...round.challengeResult,
                hand: round.challengeResult.hand.map(card => cardSchema.parse(card)),
              }
            : undefined,
        }
      : null,
  }
}

export type RoomView = ReturnType<typeof roomFromGraphQL>
export type RoundView = NonNullable<RoomView['round']>
