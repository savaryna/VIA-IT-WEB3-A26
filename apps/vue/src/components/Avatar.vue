<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ name?: string; interactive?: boolean; disabled?: boolean; label?: string }>()
defineEmits<{ activate: [] }>()
const initials = computed(() => props.name?.trim().slice(0, 2).toUpperCase())
</script>

<template>
  <component
    :is="interactive ? 'button' : 'span'"
    class="player-avatar"
    :class="{ empty: !name }"
    :type="interactive ? 'button' : undefined"
    :disabled="interactive ? disabled : undefined"
    :aria-label="interactive ? (label ?? name) : undefined"
    :aria-hidden="interactive ? undefined : true"
    @click="interactive && $emit('activate')"
  >
    <span v-if="name" aria-hidden="true">{{ initials }}</span>
    <svg v-else viewBox="0 0 16 16" class="empty-seat-icon">
      <path d="M5 2h6v2h2v5h-2v2H5V9H3V4h2zM3 12h10v2h2v2H1v-2h2z" fill="currentColor" />
    </svg>
  </component>
</template>
