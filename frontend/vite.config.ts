import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  base: '/forage/',
  test: {
    environment: 'node',
    setupFiles: [],
  },
});
