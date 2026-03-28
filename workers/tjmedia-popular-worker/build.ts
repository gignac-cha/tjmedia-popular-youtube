import { build } from 'esbuild';

await build({
  entryPoints: ['worker.ts'],
  outfile: 'worker.js',
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  loader: { '.html': 'text' },
});
