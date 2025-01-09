import { defineConfig } from 'vite'
import { imagetools } from 'vite-imagetools'

export default defineConfig({
  root: 'src',
  plugins: [imagetools()],
  build: {
    outDir: '../dist'
  }
})
