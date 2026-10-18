import { onScopeDispose, shallowRef } from 'vue'

type Origin = { x: number; y: number }
type WaveOptions = { color: string | readonly string[]; origin?: Origin }

export function useWave() {
  const wave = shallowRef<{ id: number; props: WaveOptions }>()
  let sequence = 0

  function play(color: WaveOptions['color'], origin?: Origin | HTMLElement) {
    const bounds = origin instanceof HTMLElement ? origin.getBoundingClientRect() : undefined
    const position = bounds
      ? { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 }
      : (origin as Origin | undefined)
    wave.value = { id: ++sequence, props: { color, origin: position } }
  }

  function stop() {
    wave.value = undefined
  }

  onScopeDispose(stop)
  return { wave, play, stop }
}
