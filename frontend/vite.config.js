// frontend/vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env vars from both current directory and parent directory
  const env = loadEnv(mode, process.cwd(), '');
  const parentEnv = loadEnv(mode, process.cwd() + '/..', '');
  
  // Merge environment variables
  const mergedEnv = { ...parentEnv, ...env };

  return {
    plugins: [react()],
    // This define block is the key.
    // It makes the environment variables available in your frontend code.
    define: {
      'process.env.VITE_SUPABASE_URL': JSON.stringify(mergedEnv.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(mergedEnv.VITE_SUPABASE_ANON_KEY),
      'process.env.VITE_API_URL': JSON.stringify(mergedEnv.VITE_API_URL),
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
    },
    base: '/',
  };
});