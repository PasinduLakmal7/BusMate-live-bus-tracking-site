import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Custom plugin to strip crossorigin attributes (breaks ngrok)
function removeCrossOrigin() {
  return {
    name: 'remove-crossorigin',
    transformIndexHtml(html) {
      return html.replace(/ crossorigin/g, '');
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    removeCrossOrigin(),
  ],
  build: {
    modulePreload: false,
  },
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
    cors: true,
    hmr: {
      clientPort: 443,
    },
    proxy: {
      '/socket.io': {
        target: 'http://localhost:4000',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  },
  preview: {
    port: 5173,
    host: true,
    allowedHosts: true,
    cors: true,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:4000',
        ws: true,
        changeOrigin: true,
        secure: false,
        headers: { "ngrok-skip-browser-warning": "true" }
      },
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        headers: { "ngrok-skip-browser-warning": "true" }
      }
    }
  }
});
