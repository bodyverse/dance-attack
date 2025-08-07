import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/dance-attack/', // VERY IMPORTANT for gh-pages
})