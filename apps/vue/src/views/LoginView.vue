<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

import AccountForm from '../components/AccountForm.vue'
import LogoType from '../components/LogoType.vue'

const route = useRoute()
const router = useRouter()

function authenticated() {
  const { room } = route.query
  void router.replace(typeof room === 'string' ? { name: 'room', params: { id: room } } : { name: 'home' })
}
</script>

<template>
  <section class="centered-screen" aria-label="Sign in to UNO">
    <LogoType />
    <AccountForm @authenticated="authenticated" />
  </section>
</template>
