import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Full-Stack-Assignments/Assignment_6/',
  build: {
    outDir: '.',       // build directly into Assignment_6/ instead of dist/
    emptyOutDir: false // don't wipe source files like src/, package.json
  }
})
