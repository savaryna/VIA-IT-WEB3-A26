<script setup lang="ts">
import type { CardColor, Direction } from '@uno/engine'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{ direction: Direction; color: CardColor; anchor?: HTMLElement | null }>()
const canvas = ref<HTMLCanvasElement>()
let frame = 0

onMounted(() => {
  const surface = canvas.value
  const context = surface?.getContext('2d')
  if (!surface || !context) return
  let previous = performance.now()
  let rotation = 0
  let lastStep: number | undefined

  function paint(now: number) {
    if (!context || !surface) return
    const width = Math.ceil(window.innerWidth / 8)
    const height = Math.ceil(window.innerHeight / 8)
    if (surface.width !== width || surface.height !== height) {
      surface.width = width
      surface.height = height
      lastStep = undefined
    }
    const sign = props.direction === 'clockwise' ? 1 : -1
    rotation += Math.min(now - previous, 100) * sign * ((Math.PI * 2) / 12000)
    previous = now
    const step = Math.floor(rotation / ((Math.PI * 2) / 64))
    if (step !== lastStep) {
      lastStep = step
      const { color } = getComputedStyle(surface)
      context.clearRect(0, 0, width, height)
      context.save()
      const bounds = props.anchor?.getBoundingClientRect()
      const x = bounds ? ((bounds.left + bounds.width / 2) / window.innerWidth) * width : width / 2
      const y = bounds ? ((bounds.top + bounds.height / 2) / window.innerHeight) * height : height / 2
      context.translate(x, y)
      const scale = (Math.min(width, height) * 0.4) / (27 * 1.5)
      context.scale(scale, scale)
      context.rotate((step * Math.PI * 2) / 64)
      context.scale(1, sign)
      context.strokeStyle = color
      context.fillStyle = color
      context.lineWidth = 4
      for (const start of [0, Math.PI]) {
        const end = start + Math.PI * 0.78
        context.beginPath()
        context.arc(0, 0, 27, start, end)
        context.stroke()
        context.save()
        context.rotate(end)
        context.beginPath()
        context.moveTo(27, 6)
        context.lineTo(21, -3)
        context.lineTo(33, -3)
        context.closePath()
        context.fill()
        context.restore()
      }
      context.restore()
      // Quantize edge coverage so the enlarged pixels stay crisp.
      const pixels = context.getImageData(0, 0, width, height)
      for (let index = 3; index < pixels.data.length; index += 4) {
        pixels.data[index] = pixels.data[index]! >= 128 ? 255 : 0
      }
      context.putImageData(pixels, 0, 0)
    }
    frame = requestAnimationFrame(paint)
  }
  frame = requestAnimationFrame(paint)
})

onBeforeUnmount(() => cancelAnimationFrame(frame))
</script>

<template>
  <canvas
    ref="canvas"
    class="direction-orbit"
    :data-color="color"
    width="64"
    height="64"
    :aria-label="direction"
    role="img"
  />
</template>
