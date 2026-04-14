import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/attendance_admin-app-supabase/',
  plugins: [vue()],
  build: {
    outDir: 'docs'
  }
})