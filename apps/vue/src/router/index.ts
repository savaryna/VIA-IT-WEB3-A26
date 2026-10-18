import { createRouter, createWebHistory } from 'vue-router'

import { useAccountStore } from '../stores/account'
import { useRoomStore } from '../stores/room'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
    { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
    { path: '/rooms/:id', name: 'room', component: () => import('../views/RoomView.vue') },
    { path: '/rooms/:id/play', name: 'play', component: () => import('../views/PlayView.vue') },
    { path: '/rooms/:id/between-rounds', name: 'between', component: () => import('../views/BetweenRoundsView.vue') },
    { path: '/rooms/:id/result', name: 'result', component: () => import('../views/ResultView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async to => {
  const account = useAccountStore()
  const roomStore = useRoomStore()
  try {
    if (!account.user) await account.refresh()
  } catch (cause) {
    roomStore.error = cause instanceof Error ? cause.message : 'Could not load account'
  }
  if (!account.user) {
    if (to.name === 'login') return
    return { name: 'login', query: to.params.id ? { room: String(to.params.id) } : {}, replace: true }
  }
  if (to.name === 'login') {
    return typeof to.query.room === 'string'
      ? { name: 'room', params: { id: to.query.room }, replace: true }
      : { name: 'home', replace: true }
  }
  if (to.name === 'home') return

  const id = String(to.params.id)
  try {
    if (roomStore.room?.id !== id && !(await roomStore.load(id))) return { name: 'home', replace: true }
    const name = roomStore.screen === 'setup' ? 'room' : roomStore.screen
    if (to.name !== name) return { name, params: { id }, replace: true }
  } catch (cause) {
    roomStore.error = cause instanceof Error ? cause.message : 'Could not open room'
    return { name: 'home', replace: true }
  }
})

router.afterEach((to, _from, failure) => {
  // Leaving a room stops its subscription, but preserves server membership.
  if (!failure && (to.name === 'home' || to.name === 'login')) {
    const roomStore = useRoomStore()
    if (roomStore.room || roomStore.busy) roomStore.reset()
  }
})
