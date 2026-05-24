/**
 * Process.env compatibility layer for Vite
 * Maps process.env to import.meta.env for Create React App compatibility
 */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
      REACT_APP_API_KEY?: string;
    }
  }

  const process: {
    env: {
      [key: string]: string | undefined;
      REACT_APP_API_KEY?: string;
    };
  };
}

export {};
