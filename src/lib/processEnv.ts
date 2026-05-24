/**
 * Process.env compatibility wrapper for Vite
 * Maps process.env to import.meta.env for Create React App compatibility
 */
const processEnv = new Proxy(
  {},
  {
    get(_target, prop: string | symbol): string | undefined {
      // Map REACT_APP_* to import.meta.env
      if (typeof prop !== 'string') {
        return undefined;
      }
      // Access import.meta.env using bracket notation with explicit typing
      const env = import.meta.env as Record<string, unknown>;
      const envValue = env[prop];
      return typeof envValue === 'string' ? envValue : undefined;
    },
  }
) as NodeJS.ProcessEnv;

// Create process object
export const process = {
  env: processEnv,
};
