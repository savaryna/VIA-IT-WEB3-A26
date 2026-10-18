<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import Lobby from '../components/Lobby.vue'
import { useAccountStore } from '../stores/account'
import { useRoomStore } from '../stores/room'

const roomStore = useRoomStore()
const account = useAccountStore()
const { state, roundNumber, targetScore, room } = storeToRefs(roomStore)
const isOwner = computed(() => room.value?.ownerId === account.user?.id)
const seats = computed(() =>
  (room.value?.members ?? []).map(member => ({
    id: member.userId,
    name: member.name,
    empty: !member.connected,
    info: `${member.score} points`,
  })),
)
</script>

<template>
  <section v-if="state && state.winner != null && room" class="centered-screen" aria-label="Between rounds lobby">
    <Lobby
      :title="isOwner ? `Round ${roundNumber} complete` : 'Waiting for the host to start the next round'"
      :description="`${state.players[state.winner]?.name} won round ${roundNumber} (+${state.score} points). Target: ${targetScore} points.`"
      :seats="seats"
    >
      <div class="lobby-actions">
        <button class="secondary" @click="roomStore.reset">Back to rooms</button>
        <button v-if="isOwner" :disabled="roomStore.busy" @click="roomStore.nextRound">Next round</button>
      </div>
    </Lobby>
  </section>
</template>
