import { ref } from 'vue'

export function useParticles() {
  const particles = ref<{ id: number; text: string }[]>([])
  let sequence = 0

  function spawn(text: string) {
    particles.value.push({ id: ++sequence, text })
  }
  function remove(id: number) {
    particles.value = particles.value.filter(particle => particle.id !== id)
  }

  return { particles, spawn, remove }
}
