<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

const props = withDefaults(defineProps<{ text: string; label?: string }>(), { label: 'Copy code' })
const emit = defineEmits<{ error: [message: string] }>()
const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
onBeforeUnmount(() => clearTimeout(timer))

async function copy() {
  try {
    await navigator.clipboard.writeText(props.text)
    copied.value = true
    clearTimeout(timer)
    timer = setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch {
    emit('error', 'Could not copy. Select the text and copy it manually.')
  }
}
</script>

<template>
  <button class="secondary" type="button" @click="copy">{{ copied ? 'Copied!' : label }}</button>
</template>
