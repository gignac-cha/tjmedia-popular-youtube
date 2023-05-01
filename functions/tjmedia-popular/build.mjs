import { build } from 'esbuild';

build({
  entryPoints: ['index.ts'],
  outfile: 'index.js',
  platform: 'node',
  target: 'node18',
  bundle: true,
  minify: true,
});
