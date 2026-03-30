import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/gas': {
        target: 'https://script.google.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/gas/, ''),
      },
    },
  },
})