import { defineStore } from 'pinia'
import { shallowRef } from 'vue'

import { apolloClient } from '../lib/apollo'
import { authClient } from '../lib/auth'

export const useAccountStore = defineStore('account', () => {
  const user = shallowRef<{ id: string; name: string; email: string }>()
  async function refresh() {
    const response = await authClient.getSession()
    if (response.error) throw new Error(response.error.message ?? 'Could not load session')
    if (user.value?.id !== response.data?.user.id) await apolloClient.clearStore()
    user.value = response.data?.user
  }
  async function signOut() {
    const response = await authClient.signOut()
    if (response.error) throw new Error(response.error.message ?? 'Could not sign out')
    user.value = undefined
    await apolloClient.clearStore()
  }
  return { user, refresh, signOut }
})
