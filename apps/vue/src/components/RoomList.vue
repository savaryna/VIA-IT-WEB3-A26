<script setup lang="ts">
import type { RoomView } from '../graphql/models'

defineProps<{
  rooms: readonly RoomView[]
  loading?: boolean
  error?: string
  busy?: boolean
}>()
defineEmits<{ refresh: []; join: [id: string] }>()
</script>

<template>
  <div class="room-list-header">
    <h2>Your rooms</h2>
    <button class="secondary" @click="$emit('refresh')">Refresh</button>
  </div>
  <p v-if="loading">Loading rooms…</p>
  <p v-if="error" role="alert">{{ error }}</p>
  <p v-if="!loading && !error && rooms.length === 0">No rooms yet.</p>
  <ul v-if="rooms.length" class="room-list" aria-label="Your rooms">
    <li v-for="(room, index) in rooms" :key="room.id" class="room-list-row">
      <span class="room-list-number">#{{ index + 1 }}</span>
      <span class="room-list-text">{{ room.members.map(member => member.name).join(', ') }}</span>
      <span class="room-list-mode">{{ room.mode === 'round' ? 'Single' : 'Score' }}</span>
      <span class="room-list-status">{{ room.status }}</span>
      <button class="secondary" :disabled="busy" @click="$emit('join', room.id)">Join</button>
    </li>
  </ul>
</template>
