<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import CreateRoomForm from '../components/CreateRoomForm.vue'
import FormPanel from '../components/FormPanel.vue'
import LogoType from '../components/LogoType.vue'
import RoomList from '../components/RoomList.vue'
import { roomFromGraphQL } from '../graphql/models'
import { MY_ROOMS } from '../graphql/rooms'
import { useAccountStore } from '../stores/account'
import { useRoomStore } from '../stores/room'

const router = useRouter()
const account = useAccountStore()
const roomStore = useRoomStore()
const joinId = ref('')
const error = ref('')
const {
  result,
  loading,
  error: queryError,
  refetch,
} = useQuery(MY_ROOMS, null, () => ({ enabled: !!account.user, fetchPolicy: 'network-only' }))
const rooms = computed(() => (result.value?.myRooms ?? []).map(roomFromGraphQL))
const roomError = computed(() => queryError.value?.message ?? '')
async function signOut() {
  try {
    await account.signOut()
    roomStore.reset()
    await router.replace({ name: 'login' })
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not sign out'
  }
}
</script>

<template>
  <section class="centered-screen" aria-label="UNO home">
    <LogoType />
    <p v-if="error" role="alert">{{ error }}</p>
    <div class="account-header">
      <h2>{{ account.user?.name }}</h2>
      <button class="secondary" :disabled="roomStore.busy" @click="signOut">Sign out</button>
    </div>
    <CreateRoomForm :busy="roomStore.busy" @create="roomStore.create" />
    <FormPanel title="Join room" @submit="roomStore.join(joinId)">
      <input v-model="joinId" placeholder="Room code" aria-label="Room code" required />
      <button :disabled="roomStore.busy" type="submit">Join room</button>
    </FormPanel>
    <RoomList
      :rooms="rooms"
      :loading="loading"
      :error="roomError"
      :busy="roomStore.busy"
      @refresh="refetch()"
      @join="roomStore.join"
    />
  </section>
</template>
