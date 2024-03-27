import react from '@vitejs/plugin-react';
import { configDotenv } from 'dotenv';
import { defineConfig } from 'vite';
import packageJSON from '../package.json';

const { parsed } = configDotenv();

export default defineConfig({
  base: packageJSON.name,
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
  plugins: [react()],
  define: {
    'process.env': {
      ...parsed,
    },
  },
});
