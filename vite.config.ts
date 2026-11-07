import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      exclude: ['src/**/*.spec.*', 'src/**/*.stories.*', 'src/test-setup.ts'],
      // Emit one .d.ts per source module (no api-extractor rollup) so that
      // subpath imports resolve types next to their .js file.
      bundleTypes: false,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/client'],
      output: {
        // One ESM file per source module, so consumers can deep-import a single
        // component without relying on namespace analysis of the barrel.
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        // The client boundary belongs to the package entry only; repeating it in
        // every chunk would spam ~60 directives consumers cannot dedupe.
        banner: (chunk) => (chunk.fileName === 'index.js' ? "'use client';" : ''),
      },
    },
    sourcemap: true,
  },
});
