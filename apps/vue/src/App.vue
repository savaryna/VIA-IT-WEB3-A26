<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onUnmounted, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'

import { useRoomStore } from './stores/room'

const roomStore = useRoomStore()
const router = useRouter()
const route = useRoute()
const { error } = storeToRefs(roomStore)
watch([() => roomStore.room?.id, () => roomStore.screen], ([id, screen], [previousId]) => {
  if (!id) {
    if (previousId && route.params.id === previousId) void router.replace({ name: 'home' })
    return
  }
  const name = screen === 'setup' ? 'room' : screen
  if (route.name === name && route.params.id === id) return
  const location = { name, params: { id } }
  // Keep home in history; transitions within a room replace the current entry.
  if (!previousId && !route.query.room) void router.push(location)
  else void router.replace(location)
})
onUnmounted(roomStore.reset)
</script>

<template>
  <main>
    <div v-if="error" role="alert">
      <p>{{ error }}</p>
      <button v-if="roomStore.room" @click="roomStore.reconnect">Reconnect</button>
    </div>
    <RouterView />
  </main>
</template>
