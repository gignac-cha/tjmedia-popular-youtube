import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const tjmediaPopularWorkerDevelopmentURL = 'http://localhost:8788';
const youtubeSearchWorkerDevelopmentURL = 'http://localhost:8789';

export default defineConfig({
  base: '/tjmedia-popular-youtube/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './sources'),
    },
  },
  server: {
    proxy: {
      '/api/tjmedia': {
        target: tjmediaPopularWorkerDevelopmentURL,
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(/^\/api\/tjmedia/, ''),
      },
      '/api/youtube': {
        target: youtubeSearchWorkerDevelopmentURL,
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(/^\/api\/youtube/, ''),
      },
    },
    allowedHosts: true,
  },
  build: {
    outDir: 'outputs',
    emptyOutDir: true,
  },
});
