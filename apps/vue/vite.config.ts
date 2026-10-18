import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  server: {
    allowedHosts: ['.trycloudflare.com'],
    proxy: {
      '/api/auth': 'http://localhost:3000',
      '/graphql': { target: 'http://localhost:3000', ws: true },
    },
  },
})
