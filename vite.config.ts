import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      {
        // Dev only: mirror vercel.json. "/" is the static home page, SPA routes go to app.html.
        name: 'spa-routes-to-app-html',
        configureServer(server) {
          server.middlewares.use((req, _res, next) => {
            if (req.url && /^\/(os|admin)(\/|\?|$)/.test(req.url)) req.url = '/app.html';
            else if (req.url === '/' || req.url?.startsWith('/?')) req.url = '/index.html';
            next();
          });
        },
      },
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        // The SPA (/os, /admin) builds from app.html; public/index.html is the static home page.
        input: path.resolve(__dirname, 'app.html'),
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-anim': ['framer-motion'],
            'vendor-ui': ['lucide-react', 'recharts', 'd3']
          }
        }
      }
    }
  };
});
