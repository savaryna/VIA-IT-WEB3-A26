<script setup lang="ts">
defineProps<{ text: string }>()
defineEmits<{ complete: [] }>()
</script>

<template>
  <span
    class="particle"
    :class="{ 'wide-symbol': text.length > 2 }"
    aria-hidden="true"
    @animationend.self="$emit('complete')"
    >{{ text }}</span
  >
</template>
