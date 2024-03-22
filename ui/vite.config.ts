import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import packageJSON from '../package.json';

export default defineConfig({
  base: packageJSON.name,
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
  plugins: [react()],
});
