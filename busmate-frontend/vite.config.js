import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import requireTransform from 'vite-plugin-require-transform';
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [
    react(),
    requireTransform({
      fileExtensions: [".js", ".jsx"],
    }),
  ],
  server: {
    port: 5174,
    host: true,
    strictPort: true,
    allowedHosts: [
      'all',
      '4fbe-103-21-166-1.ngrok-free.app',
      '5a3c-2402-4000-2141-b362-d11c-7dc6-c14c-b194.ngrok-free.app',
      '5732-2402-4000-2142-3e0-fdde-99d4-3432-ed5c.ngrok-free.app',
      '8d5a-2402-4000-2141-b362-e9e0-bdce-dd20-c70b.ngrok-free.app',

    ],
    proxy: {
      '/socket.io': {
        target: 'http://localhost:4000',
        ws: true,
        changeOrigin: true
      },
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
});

