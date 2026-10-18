<script setup lang="ts">
import type { Card } from '@uno/engine'

import UnoCard from './UnoCard.vue'

defineProps<{ card: Card; color: string; playId: number }>()
</script>

<template>
  <section class="discard-pile" :data-color="color" :aria-label="`Discard pile, current color ${color}`">
    <UnoCard :key="playId" :card="card" :class="{ 'discard-card-slap': playId > 0 }" />
  </section>
</template>
