<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import Lobby from '../components/Lobby.vue'
import { useRoomStore } from '../stores/room'

const roomStore = useRoomStore()
const { state, mode, localPlayer } = storeToRefs(roomStore)
const seats = computed(() =>
  (state.value?.players ?? []).map((player, index) => ({
    id: index,
    name: player.name,
    info: mode.value === 'score' ? `${player.score} points` : `${player.cardCount} cards remaining`,
  })),
)
</script>

<template>
  <section v-if="state && state.gameWinner != null" class="centered-screen" aria-label="Game results">
    <Lobby
      :title="state.gameWinner === localPlayer ? 'You won!' : `${state.players[state.gameWinner]?.name} won!`"
      :description="`${mode === 'score' ? 'Game complete. Final round' : 'Round'} score: ${state.score} points.`"
      :seats="seats"
    >
      <div class="lobby-actions">
        <button class="secondary" @click="roomStore.reset">Back to rooms</button>
      </div>
    </Lobby>
  </section>
</template>
