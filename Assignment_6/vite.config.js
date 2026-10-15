import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'react-source-entry',
      // Use React source for local development and builds. Keep index.html
      // as the compiled page so GitHub Pages can serve this folder directly.
      transformIndexHtml: {
        order: 'pre',
        handler(html) {
          return html
            .replace(/<script type="module"[^>]*><\/script>/, '<script type="module" src="./src/main.jsx"></script>')
            .replace(/<link[^>]*href="\.\/assets\/[^"]+\.css"[^>]*>/g, '')
        }
      }
    }
  ],
  base: './',
  build: {
    outDir: '.',
    emptyOutDir: false
  }
})
