<script setup lang="ts">
import { ref } from 'vue'

import type { GameMode } from '../graphql/generated'
import FormPanel from './FormPanel.vue'
import SelectField from './SelectField.vue'

defineProps<{ busy?: boolean }>()
defineEmits<{ create: [mode: GameMode, targetScore: number, capacity: number] }>()
const mode = ref<GameMode>('score')
const targetScore = ref(500)
const capacity = ref(2)
</script>

<template>
  <FormPanel title="Create room" @submit="$emit('create', mode, targetScore, capacity)">
    <SelectField
      v-model="capacity"
      :options="[2, 3, 4].map(value => ({ value, label: `${value} players` }))"
      aria-label="Number of players"
    />
    <SelectField
      v-model="mode"
      :options="[
        { value: 'round', label: 'Single round' },
        { value: 'score', label: 'Play to target score' },
      ]"
      aria-label="Game mode"
    />
    <input
      v-if="mode === 'score'"
      v-model.number="targetScore"
      type="number"
      min="1"
      max="2147483647"
      required
      placeholder="Target score"
      aria-label="Target score"
    />
    <button :disabled="busy" type="submit">Create room</button>
  </FormPanel>
</template>
