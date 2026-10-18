<script setup lang="ts">
import { computed, ref } from 'vue'

import CopyButton from '../components/CopyButton.vue'
import Lobby from '../components/Lobby.vue'
import { useAccountStore } from '../stores/account'
import { useRoomStore } from '../stores/room'

const account = useAccountStore()
const roomStore = useRoomStore()
const error = ref('')
const isOwner = computed(() => roomStore.room?.ownerId === account.user?.id)
const lobbySeats = computed(() =>
  Array.from({ length: roomStore.room?.capacity ?? 0 }, (_, index) => {
    const member = roomStore.room?.members[index]
    return {
      id: member?.userId ?? index,
      name: member?.connected ? member.name : 'Waiting...',
      empty: !member?.connected,
      info: member?.userId === roomStore.room?.ownerId ? 'Host' : `Player ${index + 1}`,
    }
  }),
)
const lobbyTitle = computed(() => {
  const { room } = roomStore
  if (!room) return ''
  if (room.members.length < room.capacity) return 'Waiting for players'
  return isOwner.value ? 'Ready to play' : 'Waiting for the host to start the game'
})
</script>

<template>
  <section v-if="roomStore.room" class="centered-screen" aria-label="Room lobby">
    <p v-if="error" role="alert">{{ error }}</p>
    <Lobby
      :title="lobbyTitle"
      :description="`${roomStore.room.members.length} / ${roomStore.room.capacity} seats filled`"
      :seats="lobbySeats"
    >
      <div class="lobby-room-code">
        <span
          >Room code: <code>{{ roomStore.room.id }}</code></span
        >
      </div>
      <div class="lobby-actions">
        <CopyButton :text="roomStore.room.id" @error="error = $event" />
        <button
          v-if="isOwner"
          :disabled="roomStore.busy || roomStore.room.members.length !== roomStore.room.capacity"
          @click="roomStore.start"
        >
          Start game
        </button>
      </div>
    </Lobby>
  </section>
</template>
