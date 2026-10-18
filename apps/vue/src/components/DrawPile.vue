<script setup lang="ts">
defineProps<{ count: number; disabled: boolean; penalty?: boolean }>()
defineEmits<{ draw: [] }>()
</script>

<template>
  <section class="draw-pile" aria-label="Draw pile">
    <p>{{ penalty ? 'Draw 4' : `${count} cards` }}</p>
    <button
      class="card-back"
      :disabled="disabled"
      :aria-label="`${penalty ? 'Accept and draw four cards' : 'Draw a card'}, ${count} remaining`"
      @click="$emit('draw')"
    >
      UNO
    </button>
  </section>
</template>
