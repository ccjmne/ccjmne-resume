import { defineConfig } from 'vite'
import { imagetools } from 'vite-imagetools'

export default defineConfig({
  root: 'src',
  // assetsInclude: ['**/*.png', '**/*.ts'],
  plugins: [imagetools()],
  build: {
    outDir: '../dist'
  }
})
