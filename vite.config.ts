import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Important for AppsGeyser/Cordova to load assets relatively
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});