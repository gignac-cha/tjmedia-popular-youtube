import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  base: '/tjmedia-popular-youtube/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './sources'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./sources/setupTests.ts'],
    globals: true,
  },
});
