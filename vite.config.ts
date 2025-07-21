import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    https: false,
    cors: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@theme': resolve(__dirname, './src/theme'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@types': resolve(__dirname, './src/types'),
      '@utils': resolve(__dirname, './src/utils')
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        demo: resolve(__dirname, 'src/demo/index.html'),
        experiment: resolve(__dirname, 'src/experiment/index.html')
      }
    }
  }
});