import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import packageJSON from '../package.json' assert { type: 'json' };

export default defineConfig({
  base: packageJSON.name,
  build: {
    emptyOutDir: true,
  },
  plugins: [react()],
});
