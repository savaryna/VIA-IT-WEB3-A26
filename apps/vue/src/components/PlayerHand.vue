<script setup lang="ts">
import type { Card } from '@uno/engine'
import { ref, shallowRef, watch } from 'vue'

import UnoCard from './UnoCard.vue'

const props = defineProps<{ cards: readonly Card[]; playableCardIndices: number[]; active: boolean }>()
const emit = defineEmits<{ play: [index: number] }>()
const revealDistance = ref(0)

const handCards = shallowRef<{ id: number; card: Card }[]>([])
let sequence = 0
let selectedId: number | undefined

watch(
  () => props.cards,
  cards => {
    // Keep card identities across server snapshots so the played card leaves,
    // rather than animating the last slot when an array index is removed.
    const remaining = [...handCards.value]
    if (cards.length < remaining.length && selectedId !== undefined) {
      const selected = remaining.findIndex(entry => entry.id === selectedId)
      if (selected !== -1) remaining.splice(selected, 1)
    }
    handCards.value = cards.map(card => {
      const index = remaining.findIndex(entry => JSON.stringify(entry.card) === JSON.stringify(card))
      const previous = index === -1 ? undefined : remaining.splice(index, 1)[0]
      return { id: previous?.id ?? ++sequence, card }
    })
    selectedId = undefined
  },
  { immediate: true },
)

function play(index: number, id: number) {
  if (!props.active || !props.playableCardIndices.includes(index)) return
  selectedId = id
  emit('play', index)
}

function measureReveal(event: MouseEvent | FocusEvent) {
  const slot = event.currentTarget as HTMLElement
  const card = slot.querySelector<HTMLElement>('.uno-card')
  if (card) revealDistance.value = Math.max(0, card.offsetWidth / 2 - slot.offsetWidth)
}
</script>

<template>
  <section class="player-hand" aria-label="Your hand">
    <TransitionGroup
      name="draw-card"
      tag="div"
      class="hand"
      :style="{ '--hand-reveal-distance': `${revealDistance}px` }"
    >
      <div
        v-for="(entry, index) in handCards"
        :key="entry.id"
        class="hand-card"
        @mouseenter="measureReveal"
        @focusin="measureReveal"
        @click.self="play(index, entry.id)"
      >
        <UnoCard
          :card="entry.card"
          interactive
          :disabled="!active || !playableCardIndices.includes(index)"
          @select="play(index, entry.id)"
        />
      </div>
    </TransitionGroup>
  </section>
</template>
