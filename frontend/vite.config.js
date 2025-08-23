// frontend/vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // This command loads the .env file from the parent directory (the root)
  // during development ('serve') and production ('build').
  const env = loadEnv(mode, process.cwd() + '/..', '');

  return {
    plugins: [react()],
    // This define block is the key.
    // It makes the environment variables available in your frontend code.
    define: {
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
    },
    base: '/',
  };
});