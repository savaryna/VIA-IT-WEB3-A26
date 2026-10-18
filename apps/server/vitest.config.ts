import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: 'server',
    root: import.meta.dirname,
    environment: 'node',
    include: ['__test__/**/*.test.ts'],
  },
})
