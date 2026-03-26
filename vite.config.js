import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      middlewareMode: false,
    },
    define: {
      'import.meta.env.VITE_MODEL': JSON.stringify(env.MODEL || 'anthropic/claude-opus-4-6-20250520')
    }
  };
});