<script setup lang="ts">
import type { CardColor } from '@uno/engine'

defineProps<{ disabled?: boolean }>()
defineEmits<{ select: [color: CardColor]; cancel: [] }>()
</script>

<template>
  <fieldset class="color-picker">
    <legend class="visually-hidden">Choose the wild card's color</legend>
    <div class="color-options">
      <button :disabled="disabled" data-color="BLUE" @click="$emit('select', 'BLUE')">Blue</button>
      <button :disabled="disabled" data-color="GREEN" @click="$emit('select', 'GREEN')">Green</button>
    </div>
    <div class="wild-preview"><slot /></div>
    <div class="color-options">
      <button :disabled="disabled" data-color="RED" @click="$emit('select', 'RED')">Red</button>
      <button :disabled="disabled" data-color="YELLOW" @click="$emit('select', 'YELLOW')">Yellow</button>
    </div>
    <button class="cancel-color secondary" :disabled="disabled" @click="$emit('cancel')">Cancel</button>
  </fieldset>
</template>
