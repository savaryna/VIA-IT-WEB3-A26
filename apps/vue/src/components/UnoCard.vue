<script setup lang="ts">
import type { Card } from '@uno/engine'
import { computed } from 'vue'

import { cardSymbol } from '../lib/card-symbol'

const props = defineProps<{ card: Card; interactive?: boolean; disabled?: boolean }>()
defineEmits<{ select: [] }>()
const label = computed(() => {
  const { card } = props
  if (card.type === 'NUMBERED') return `${card.color} ${card.number}`
  if ('color' in card) return `${card.color} ${card.type === 'DRAW' ? 'Draw 2' : card.type}`
  return card.type === 'WILD DRAW' ? 'Wild Draw 4' : 'Wild'
})
const symbol = computed(() => cardSymbol(props.card))
const color = computed(() => ('color' in props.card ? props.card.color : 'WILD'))
</script>

<template>
  <component
    :is="interactive ? 'button' : 'span'"
    class="uno-card"
    :data-color="color"
    :aria-label="label"
    :role="interactive ? undefined : 'img'"
    :type="interactive ? 'button' : undefined"
    :disabled="interactive ? disabled : undefined"
    @click="interactive && $emit('select')"
  >
    <span class="card-corner" aria-hidden="true">{{ symbol }}</span>
    <span class="card-symbol" aria-hidden="true">{{ symbol }}</span>
    <span class="card-corner card-corner-bottom" aria-hidden="true">{{ symbol }}</span>
  </component>
</template>
