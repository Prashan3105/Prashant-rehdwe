import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Critical: Makes sure assets load on GitHub Pages sub-paths
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});