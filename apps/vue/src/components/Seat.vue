<script setup lang="ts">
import Avatar from './Avatar.vue'

withDefaults(
  defineProps<{
    name: string
    info?: string
    direction?: 'horizontal' | 'vertical'
    empty?: boolean
    active?: boolean
    actionable?: boolean
    disabled?: boolean
    actionLabel?: string
  }>(),
  { direction: 'horizontal' },
)
defineEmits<{ activate: [] }>()
</script>

<template>
  <section class="seat" :class="{ active }" :aria-label="name" :aria-current="active ? 'true' : undefined">
    <div class="player-identity" :class="{ vertical: direction === 'vertical' }">
      <Avatar
        :name="empty ? undefined : name"
        :interactive="actionable"
        :disabled="disabled"
        :label="actionLabel"
        :title="actionLabel ?? name"
        :class="{ catchable: actionable }"
        @activate="$emit('activate')"
      />
      <div class="player-details">
        <strong>{{ name }}</strong>
        <p v-if="info">{{ info }}</p>
      </div>
    </div>
    <slot />
  </section>
</template>
