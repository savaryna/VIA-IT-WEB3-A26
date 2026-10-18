<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{
  color: string | readonly string[]
  origin?: { x: number; y: number }
}>()
const canvas = ref<HTMLCanvasElement | null>(null)
let frame = 0
let cycle: ReturnType<typeof setInterval> | undefined

function stop() {
  clearInterval(cycle)
  cycle = undefined
  cancelAnimationFrame(frame)
  const surface = canvas.value
  surface?.getContext('2d')?.clearRect(0, 0, surface.width, surface.height)
}

function draw(color: string) {
  const origin = props.origin ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 }
  cancelAnimationFrame(frame)
  const surface = canvas.value
  const context = surface?.getContext('2d')
  if (!surface || !context) return
  context.clearRect(0, 0, surface.width, surface.height)

  const pixel = 12
  const width = window.innerWidth
  const height = window.innerHeight
  surface.width = Math.ceil(width / pixel)
  surface.height = Math.ceil(height / pixel)
  const x = (origin.x / width) * surface.width
  const y = (origin.y / height) * surface.height
  const band = 14
  const reach = Math.hypot(Math.max(x, surface.width - x), Math.max(y, surface.height - y)) + band
  surface.style.setProperty('--wave-color', color)
  const resolvedColor = getComputedStyle(surface).color
  const started = performance.now()

  function paint(now: number) {
    if (!surface || !context) return
    const progress = Math.min(1, (now - started) / 1400)
    context.clearRect(0, 0, surface.width, surface.height)
    if (progress === 1) return
    const radius = reach * (1 - (1 - progress) ** 1.4)
    context.fillStyle = resolvedColor
    for (let row = 0; row < surface.height; row++) {
      for (let column = 0; column < surface.width; column++) {
        const distance = Math.hypot(column - x, row - y)
        const trail = radius - distance
        if (trail < 0 || trail > band) continue
        // A solid pixel front with a sparse, dissolving trail.
        if (trail > band * 0.65 && (column + row) % 3 !== 0) continue
        context.globalAlpha = (1 - progress ** 3) * (1 - trail / (band + 1)) * 0.65
        context.fillRect(column, row, 1, 1)
      }
    }
    frame = requestAnimationFrame(paint)
  }
  frame = requestAnimationFrame(paint)
}

function play() {
  stop()
  const colors = typeof props.color === 'string' ? [props.color] : props.color
  if (!colors.length) return
  let index = 0
  draw(colors[index]!)
  if (Array.isArray(props.color)) {
    cycle = setInterval(() => {
      index = (index + 1) % colors.length
      draw(colors[index]!)
    }, 1500)
  }
}

onMounted(play)
onBeforeUnmount(stop)
</script>

<template>
  <canvas ref="canvas" class="wave" aria-hidden="true" />
</template>
