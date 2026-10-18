<script setup lang="ts" generic="T extends string | number">
defineOptions({ inheritAttrs: false })
defineProps<{ options: readonly { value: T; label: string }[] }>()
const model = defineModel<T>({ required: true })
</script>

<template>
  <div class="select-field">
    <select v-model="model" v-bind="$attrs">
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
  </div>
</template>
