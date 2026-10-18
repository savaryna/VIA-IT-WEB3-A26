import { useSound } from '@vueuse/sound'
import { onScopeDispose } from 'vue'

import drawSound from '../assets/sounds/draw.wav'
import playSound from '../assets/sounds/play.wav'
import unoSound from '../assets/sounds/uno.wav'

export function useGameSounds() {
  const draw = useSound(drawSound, { volume: 0.4, interrupt: true })
  const play = useSound(playSound, { volume: 0.5, interrupt: true })
  const uno = useSound(unoSound, { volume: 0.35, interrupt: true })

  onScopeDispose(() => {
    draw.sound.value?.unload()
    play.sound.value?.unload()
    uno.sound.value?.unload()
  })

  return { draw: draw.play, play: play.play, uno: uno.play }
}
