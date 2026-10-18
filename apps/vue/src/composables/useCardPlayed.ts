import { watch, type Ref } from 'vue'

import type { RoundView } from '../graphql/models'

export function useCardPlayed(state: Ref<RoundView | undefined>, onPlay: (round: RoundView) => void) {
  watch(
    state,
    (next, previous) => {
      // Confirmed plays reduce a hand; duplicate snapshots and draws do not.
      if (
        next &&
        previous &&
        next.players.some((player, index) => player.cardCount < (previous.players[index]?.cardCount ?? 0))
      ) {
        onPlay(next)
      }
    },
    { flush: 'post' },
  )
}
