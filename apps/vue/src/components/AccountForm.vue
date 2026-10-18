<script setup lang="ts">
import { ref } from 'vue'

import { authClient } from '../lib/auth'
import { useAccountStore } from '../stores/account'
import FormPanel from './FormPanel.vue'

const emit = defineEmits<{ authenticated: [] }>()
const account = useAccountStore()
const registering = ref(false)
const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)
async function submit() {
  busy.value = true
  error.value = ''
  try {
    const result = registering.value
      ? await authClient.signUp.email({ name: name.value, email: email.value, password: password.value })
      : await authClient.signIn.email({ email: email.value, password: password.value })
    if (result.error) throw new Error(result.error.message ?? 'Authentication failed')
    password.value = ''
    await account.refresh()
    emit('authenticated')
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Authentication failed'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <FormPanel :title="registering ? 'Register' : 'Sign in'" @submit="submit">
    <input
      v-if="registering"
      v-model="name"
      placeholder="Name"
      aria-label="Name"
      autocomplete="nickname"
      maxlength="30"
      required
    />
    <input v-model="email" type="email" placeholder="Email" aria-label="Email" autocomplete="email" required />
    <input
      v-model="password"
      type="password"
      placeholder="Password"
      aria-label="Password"
      :autocomplete="registering ? 'new-password' : 'current-password'"
      minlength="8"
      required
    />
    <p v-if="error" role="alert">{{ error }}</p>
    <button :disabled="busy" type="submit">{{ registering ? 'Register' : 'Sign in' }}</button>
    <button class="secondary" type="button" :disabled="busy" @click="registering = !registering">
      {{ registering ? 'Already have an account?' : 'Create an account' }}
    </button>
  </FormPanel>
</template>
