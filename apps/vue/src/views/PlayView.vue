<script setup lang="ts">
import type { CardColor } from '@uno/engine'
import { storeToRefs } from 'pinia'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

import ColorPicker from '../components/ColorPicker.vue'
import DirectionOrbit from '../components/DirectionOrbit.vue'
import DiscardPile from '../components/DiscardPile.vue'
import DrawPile from '../components/DrawPile.vue'
import OpponentHand from '../components/OpponentHand.vue'
import Particle from '../components/Particle.vue'
import PlayerHand from '../components/PlayerHand.vue'
import Seat from '../components/Seat.vue'
import UnoCard from '../components/UnoCard.vue'
import Wave from '../components/Wave.vue'
import { useCardPlayed } from '../composables/useCardPlayed'
import { useGameSounds } from '../composables/useGameSounds'
import { useParticles } from '../composables/useParticles'
import { useWave } from '../composables/useWave'
import { cardSymbol } from '../lib/card-symbol'
import { useRoomStore } from '../stores/room'

const roomStore = useRoomStore()
const { state, isLocalTurn, localPlayer, mode, roundNumber } = storeToRefs(roomStore)
const selectedWild = ref<number>()
const sounds = useGameSounds()
const { wave, play: playWave, stop: stopWave } = useWave()
const previewColors: CardColor[] = ['RED', 'BLUE', 'GREEN', 'YELLOW']
onBeforeUnmount(cancelWild)
const tableCenter = ref<HTMLElement | null>(null)
const discardStage = ref<HTMLElement | null>(null)
const discardPlayId = ref(0)
const { particles: cardParticles, spawn: spawnCardParticle, remove: removeCardParticle } = useParticles()
const { particles: unoParticles, spawn: spawnUnoParticle, remove: removeUnoParticle } = useParticles()
const opponents = computed(() => {
  const players = state.value?.players ?? []
  // With your seat at the bottom, clockwise continues across the top from left to right.
  return Array.from({ length: Math.max(0, players.length - 1) }, (_, offset) => {
    const index = (localPlayer.value + offset + 1) % players.length
    return { player: players[index]!, index }
  })
})
const selectedCard = computed(() =>
  selectedWild.value === undefined ? undefined : state.value?.hand[selectedWild.value],
)
const cssColor = (value: CardColor) => `var(--card-${value.toLowerCase()})`

function waveFromPile(color: CardColor | CardColor[]) {
  const pile = tableCenter.value?.querySelector<HTMLElement>('.discard-pile, .wild-preview')
  if (pile) playWave(Array.isArray(color) ? color.map(cssColor) : cssColor(color), pile)
}

async function startWildPreview(index: number) {
  await nextTick()
  if (selectedWild.value !== index) return
  waveFromPile(previewColors)
}

function cancelWild() {
  stopWave()
  selectedWild.value = undefined
}

watch(state, () => {
  if (selectedWild.value !== undefined) cancelWild()
})

useCardPlayed(state, round => {
  sounds.play()
  discardPlayId.value++
  waveFromPile(round.color)
  if (round.discardTop.type !== 'NUMBERED') spawnCardParticle(cardSymbol(round.discardTop))
})

function selectCard(index: number) {
  const card = state.value?.hand[index]
  if (card?.type === 'WILD' || card?.type === 'WILD DRAW') {
    selectedWild.value = index
    void startWildPreview(index)
  } else roomStore.takeAction({ type: 'play', cardIndex: index })
}
function chooseColor(color: CardColor) {
  if (selectedWild.value !== undefined) {
    stopWave()
    roomStore.takeAction({ type: 'play', cardIndex: selectedWild.value, newColor: color })
  }
}
function sayUno() {
  sounds.uno()
  spawnUnoParticle('UNO!')
  if (!roomStore.busy && state.value?.canSayUno && !state.value.declaredUno) {
    roomStore.takeAction({ type: 'sayUno' })
  }
}

async function drawCard() {
  const count = state.value?.hand.length ?? 0
  await roomStore.takeAction({ type: 'draw' })
  if ((state.value?.hand.length ?? 0) > count) sounds.draw()
}
</script>

<template>
  <section v-if="state" class="play-screen" aria-label="UNO game">
    <DirectionOrbit :direction="state.direction" :color="state.color" :anchor="discardStage" />
    <Wave v-if="wave" :key="wave.id" v-bind="wave.props" />
    <div class="table" aria-label="UNO table">
      <div class="opponents">
        <Seat
          v-for="opponent in opponents"
          :key="opponent.index"
          :name="opponent.player.name + (opponent.player.connected ? '' : ' (disconnected)')"
          :info="
            state.catchablePlayer === opponent.index
              ? 'Click to catch'
              : `${opponent.player.cardCount} cards${mode === 'score' ? ` · ${opponent.player.score} points` : ''}`
          "
          :active="state.turn === opponent.index"
          :actionable="state.catchablePlayer === opponent.index"
          :disabled="roomStore.busy"
          :action-label="
            state.catchablePlayer === opponent.index ? `Catch ${opponent.player.name} missing UNO` : undefined
          "
          @activate="roomStore.takeAction({ type: 'catchUnoFailure', accused: opponent.index })"
        >
          <OpponentHand
            :count="opponent.player.cardCount"
            :revealed-cards="
              state.challengeResult?.offender === opponent.index ? state.challengeResult.hand : undefined
            "
          />
        </Seat>
        <p class="round-number">Round {{ roundNumber }}</p>
      </div>
      <section ref="tableCenter" class="table-center" aria-label="Discard pile and color selection">
        <div ref="discardStage" class="discard-stage" :class="{ 'choosing-color': selectedCard }">
          <div />
          <div class="discard-stage-pile">
            <ColorPicker v-if="selectedCard" :disabled="roomStore.busy" @select="chooseColor" @cancel="cancelWild">
              <UnoCard :card="selectedCard" />
            </ColorPicker>
            <DiscardPile v-else :card="state.discardTop" :color="state.color" :play-id="discardPlayId" />
            <Particle
              v-for="particle in cardParticles"
              :key="particle.id"
              :text="particle.text"
              @complete="removeCardParticle(particle.id)"
            />
          </div>
          <div />
        </div>
        <div class="discard-status">
          <template v-if="!selectedCard">
            <button
              v-if="state.canChallenge"
              :disabled="roomStore.busy"
              @click="roomStore.takeAction({ type: 'challenge' })"
            >
              Challenge +4
            </button>
            <button
              v-else-if="state.mustPlayDrawn && isLocalTurn"
              :disabled="roomStore.busy"
              @click="selectCard(state.hand.length - 1)"
            >
              Play drawn card
            </button>
          </template>
        </div>
      </section>
      <aside class="game-controls" aria-label="Player and round controls">
        <Seat
          :name="state.players[localPlayer]!.name"
          :info="`${state.players[localPlayer]!.cardCount} cards${mode === 'score' ? ` · ${state.players[localPlayer]!.score} points` : ''}`"
          :active="isLocalTurn"
        />
        <div class="round-actions">
          <div class="uno-action">
            <button @click="sayUno">UNO!</button>
            <Particle
              v-for="particle in unoParticles"
              :key="particle.id"
              :text="particle.text"
              @complete="removeUnoParticle(particle.id)"
            />
          </div>
        </div>
      </aside>
      <PlayerHand
        :cards="state.hand"
        :playable-card-indices="state.playableCardIndices"
        :active="isLocalTurn && !roomStore.busy && selectedWild === undefined"
        @play="selectCard"
      />
      <DrawPile
        :penalty="state.canChallenge"
        :count="state.drawPileSize"
        :disabled="roomStore.busy || !isLocalTurn || state.mustPlayDrawn || selectedWild !== undefined"
        @draw="drawCard"
      />
    </div>
  </section>
</template>
