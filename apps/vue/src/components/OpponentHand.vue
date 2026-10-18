<script setup lang="ts">
import type { Card } from '@uno/engine'

import UnoCard from './UnoCard.vue'

defineProps<{ count: number; revealedCards?: readonly Card[] }>()
</script>

<template>
  <div class="opponent-hand" :class="{ revealed: revealedCards }" :aria-hidden="revealedCards ? undefined : true">
    <template v-for="index in count" :key="index">
      <UnoCard v-if="revealedCards?.[index - 1]" :card="revealedCards[index - 1]!" />
      <span v-else class="card-back" />
    </template>
  </div>
</template>
