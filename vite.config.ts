import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({
    compilerOptions: {
      compatibility: {
        componentApi: 4
      }
    }
  })],
  server: {
    port: 3000,
    open: true
  },
  build: {
    target: 'esnext',
    sourcemap: true
  }
});