import { defineConfig, loadEnv, type PluginOption } from 'vite';
import { resolveAppVersion } from './scripts/resolve-app-version.mjs';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { braintreeClientTokenPlugin } from './vite-plugin-braintree-client-token';
import { cloudflare as cloudflareFactory } from '@cloudflare/vite-plugin';

/** Typed factory — avoids no-unsafe-call when plugin types are not in the ESLint project graph. */
const createCloudflarePlugin = cloudflareFactory as unknown as () => PluginOption;

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  // Build define object for REACT_APP_* variables
  const reactAppEnv: Record<string, string> = {};
  Object.keys(env).forEach((key) => {
    if (key.startsWith('REACT_APP_')) {
      reactAppEnv[`import.meta.env.${key}`] = JSON.stringify(env[key]);
    }
  });

  const isDev = mode === 'development';
  const appVersion = resolveAppVersion(mode);

  return {
    plugins: [
      tailwindcss(), // Must be placed before other plugins for proper CSS processing
      react({
        // Locator must run only on .tsx: it breaks plain .ts files with `${...}` in strings (e.g. src/lib/utils.ts).
        babel: (id) => {
          if (!isDev) {
            return {};
          }
          const filepath = id.split('?')[0];
          if (!filepath.endsWith('.tsx')) {
            return {};
          }
          return {
            plugins: [
              [
                '@locator/babel-jsx/dist',
                {
                  env: 'development',
                },
              ],
            ],
          };
        },
      }),
      braintreeClientTokenPlugin(), // Dev-only: serves GET /api/braintree/client-token using BRAINTREE_* env
      createCloudflarePlugin(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Expose REACT_APP_* and app version to the client (baked in at build time)
    define: {
      ...reactAppEnv,
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
    },
    server: {
      allowedHosts: ['refinery-strum-thaw.ngrok-free.dev', '.ngrok-free.dev', '.ngrok.io'],
    },
  };
});
