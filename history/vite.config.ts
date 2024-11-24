import { defineConfig } from 'vite'
import { imagetools } from 'vite-imagetools'
import { default as glsl } from 'vite-plugin-glsl'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig(({ mode }) => ({
  plugins: [svelte(), imagetools(), glsl({ compress: mode === 'production' })],
  css: {
    preprocessorOptions: { scss: { api: 'modern' } }
  },
}))
