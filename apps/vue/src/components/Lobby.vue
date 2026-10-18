<script setup lang="ts">
import LogoType from './LogoType.vue'
import Seat from './Seat.vue'

defineProps<{
  title: string
  description: string
  seats: readonly { id: string | number; name: string; info?: string; empty?: boolean }[]
}>()
</script>

<template>
  <LogoType />
  <div class="waiting-lobby-heading">
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
  </div>
  <ol class="lobby-seats">
    <li v-for="seat in seats" :key="seat.id" class="lobby-seat" :class="{ occupied: !seat.empty }">
      <Seat :name="seat.name" :info="seat.info" :empty="seat.empty" direction="vertical" />
    </li>
  </ol>
  <slot />
</template>
