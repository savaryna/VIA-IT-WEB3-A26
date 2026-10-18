<script setup lang="ts">
defineProps<{ title: string }>()
defineEmits<{ submit: [] }>()
</script>

<template>
  <form class="setup-form" @submit.prevent="$emit('submit')">
    <h2>{{ title }}</h2>
    <slot />
  </form>
</template>
