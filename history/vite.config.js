import { defineConfig } from 'vite'
import { imagetools } from 'vite-imagetools'
import { default as glsl } from 'vite-plugin-glsl'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte(), imagetools(), glsl()],
  css: {
    preprocessorOptions: { scss: { api: 'modern' } }
  },
})
