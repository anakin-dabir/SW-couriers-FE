/**
 * Ensures `@cloudflare/vite-plugin` resolves for vite.config.ts type-checking and ESLint
 * when package types are unavailable (e.g. before `npm install`).
 */
declare module '@cloudflare/vite-plugin' {
  import type { Plugin } from 'vite';

  export interface PluginConfig {
    configPath?: string;
    persistState?: boolean | { path: string };
    inspectorPort?: number | false;
    tunnel?: boolean | { name?: string; autoStart?: boolean };
  }

  export function cloudflare(pluginConfig?: PluginConfig): Plugin[];
}
