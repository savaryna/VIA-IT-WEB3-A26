import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: 'engine-oo',
    root: import.meta.dirname,
    environment: 'node',
    include: ['__test__/**/*.test.ts'],
  },
})
