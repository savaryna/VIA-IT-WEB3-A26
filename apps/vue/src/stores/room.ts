import type { TypedDocumentNode } from '@apollo/client/core'
import { defineStore } from 'pinia'
import { computed, onScopeDispose, ref, shallowRef } from 'vue'

import type { GameMode, ActionInput, RoomFieldsFragment } from '../graphql/generated'
import { roomFromGraphQL, type RoomView } from '../graphql/models'
import { CREATE_ROOM, ROOM, ROOM_CHANGED, JOIN_ROOM, NEXT_ROUND, START_GAME, TAKE_ACTION } from '../graphql/rooms'
import { apolloClient } from '../lib/apollo'

export const useRoomStore = defineStore('room', () => {
  const room = shallowRef<RoomView>()
  const error = ref('')
  const busy = ref(false)
  let subscription: { unsubscribe(): void } | undefined
  let generation = 0

  const state = computed(() => room.value?.round ?? undefined)
  const localPlayer = computed(() => room.value?.localPlayer ?? 0)
  const mode = computed(() => room.value?.mode ?? 'round')
  const targetScore = computed(() => room.value?.targetScore ?? 500)
  const roundNumber = computed(() => room.value?.roundNumber ?? 1)
  const isLocalTurn = computed(() => state.value?.turn === localPlayer.value)
  const screen = computed(() => {
    switch (room.value?.status) {
      case 'playing':
        return 'play'
      case 'between':
        return 'between'
      case 'finished':
        return 'result'
      default:
        return 'setup'
    }
  })

  function accept(value: RoomView) {
    if (room.value?.id === value.id && room.value.version > value.version) return
    room.value = value
  }
  async function refresh() {
    if (!room.value) return
    const { id } = room.value
    const result = await apolloClient.query({
      query: ROOM,
      variables: { id },
      fetchPolicy: 'no-cache',
    })
    if (room.value?.id === id) accept(roomFromGraphQL(result.data.room))
  }
  async function load(id: string) {
    reset()
    busy.value = true
    const current = generation
    try {
      const result = await apolloClient.query({
        query: ROOM,
        variables: { id },
        fetchPolicy: 'no-cache',
      })
      if (current !== generation) return false
      busy.value = false
      follow(roomFromGraphQL(result.data.room))
      return true
    } catch (cause) {
      if (current === generation) error.value = cause instanceof Error ? cause.message : 'Could not open room'
      return false
    } finally {
      if (current === generation) busy.value = false
    }
  }
  function follow(value: RoomView) {
    subscription?.unsubscribe()
    const current = ++generation
    accept(value)
    subscription = apolloClient.subscribe({ query: ROOM_CHANGED, variables: { id: value.id } }).subscribe({
      next(result) {
        if (current === generation && result.data) {
          try {
            accept(roomFromGraphQL(result.data.roomChanged))
            error.value = ''
          } catch {
            error.value = 'Received invalid room data. Reconnect to continue.'
          }
        }
      },
      error(cause) {
        if (current === generation)
          error.value = cause instanceof Error ? cause.message : 'Live connection lost. Reconnect to continue.'
      },
    })
  }
  async function mutate<TData, TVariables extends Record<string, unknown>>(
    document: TypedDocumentNode<TData, TVariables>,
    variables: NoInfer<TVariables>,
    select: (data: NoInfer<TData>) => RoomFieldsFragment,
    attach = false,
  ) {
    if (busy.value) return
    busy.value = true
    error.value = ''
    const current = generation
    try {
      const result = await apolloClient.mutate({
        mutation: document,
        variables,
        fetchPolicy: 'no-cache',
      })
      if (current !== generation) return
      const value = result.data && select(result.data)
      if (value) {
        if (attach) follow(roomFromGraphQL(value))
        else accept(roomFromGraphQL(value))
      }
    } catch (cause) {
      if (current !== generation) return
      error.value = cause instanceof Error ? cause.message : 'Request failed'
      try {
        await refresh()
      } catch {
        /* Keep the original error visible. */
      }
    } finally {
      busy.value = false
    }
  }
  function create(selectedMode: GameMode, selectedTarget: number, capacity: number) {
    return mutate(
      CREATE_ROOM,
      { input: { mode: selectedMode, targetScore: selectedTarget, capacity } },
      data => data.createRoom,
      true,
    )
  }
  function join(id: string) {
    return mutate(JOIN_ROOM, { id: id.trim() }, data => data.joinRoom, true)
  }
  function takeAction(action: ActionInput) {
    if (!room.value) return
    return mutate(TAKE_ACTION, { id: room.value.id, version: room.value.version, action }, data => data.takeAction)
  }
  function start() {
    if (!room.value) return
    return mutate(START_GAME, { id: room.value.id, version: room.value.version }, data => data.startGame)
  }
  function nextRound() {
    if (!room.value) return
    return mutate(NEXT_ROUND, { id: room.value.id, version: room.value.version }, data => data.nextRound)
  }
  function reconnect() {
    if (room.value) {
      error.value = ''
      follow(room.value)
    }
  }
  function reset() {
    generation++
    subscription?.unsubscribe()
    subscription = undefined
    room.value = undefined
    error.value = ''
    busy.value = false
  }
  onScopeDispose(reset)
  return {
    room,
    error,
    busy,
    create,
    join,
    load,
    start,
    takeAction,
    nextRound,
    reconnect,
    reset,
    state,
    localPlayer,
    mode,
    targetScore,
    roundNumber,
    isLocalTurn,
    screen,
  }
})
