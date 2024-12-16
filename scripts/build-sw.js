import * as esbuild from 'esbuild';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildServiceWorker() {
  try {
    await esbuild.build({
      entryPoints: [join(process.cwd(), 'public/service-worker.ts')],
      bundle: true,
      outfile: join(process.cwd(), 'public/service-worker.js'),
      format: 'iife',
      platform: 'browser',
      target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
      define: {
        'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`
      },
    });
    console.log('Service worker built successfully');
  } catch (error) {
    console.error('Error building service worker:', error);
    process.exit(1);
  }
}

buildServiceWorker();