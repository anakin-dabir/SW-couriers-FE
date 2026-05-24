import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store/store';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/index.css';
import App from '@/App';
// Validate environment variables on app startup
import '@/config/env';

if (import.meta.env.DEV) {
  void import('@locator/runtime').then((moduleValue: unknown) => {
    const locatorModule = moduleValue as { default?: unknown };
    const setupLocatorUI =
      typeof locatorModule.default === 'function'
        ? (locatorModule.default as () => void)
        : undefined;
    if (setupLocatorUI) {
      setupLocatorUI();
    }
  });
}

// Global error handlers for unhandled promise rejections
// Set up BEFORE any other code runs to catch extension errors early
window.addEventListener(
  'unhandledrejection',
  (event) => {
    // Filter out Chrome extension errors (common false positives)
    // Type-safe error message extraction
    const reason: unknown = event.reason;
    let ERROR_MESSAGE = '';
    let ERROR_STACK = '';

    if (reason && typeof reason === 'object') {
      const ERROR_OBJ = reason as { message?: unknown; toString?: () => string; stack?: unknown };
      const MESSAGE = typeof ERROR_OBJ.message === 'string' ? ERROR_OBJ.message : '';
      const TO_STRING_RESULT = typeof ERROR_OBJ.toString === 'function' ? ERROR_OBJ.toString() : '';
      ERROR_MESSAGE = MESSAGE || (typeof TO_STRING_RESULT === 'string' ? TO_STRING_RESULT : '');
      ERROR_STACK = typeof ERROR_OBJ.stack === 'string' ? ERROR_OBJ.stack : '';
    } else if (reason !== null && reason !== undefined) {
      // Handle primitive types safely
      if (typeof reason === 'string' || typeof reason === 'number' || typeof reason === 'boolean') {
        ERROR_MESSAGE = String(reason);
      } else {
        // For other types, try to get a string representation safely
        ERROR_MESSAGE = '';
      }
    }

    const FULL_ERROR_TEXT = (ERROR_MESSAGE + ' ' + ERROR_STACK).toLowerCase();

    const IS_EXTENSION_ERROR =
      FULL_ERROR_TEXT.includes('message channel closed') ||
      FULL_ERROR_TEXT.includes('back/forward cache') ||
      FULL_ERROR_TEXT.includes('bfcache') ||
      FULL_ERROR_TEXT.includes('extension port') ||
      FULL_ERROR_TEXT.includes('extension context invalidated') ||
      FULL_ERROR_TEXT.includes('receiving end does not exist') ||
      FULL_ERROR_TEXT.includes('asynchronous response') ||
      FULL_ERROR_TEXT.includes('listener indicated') ||
      FULL_ERROR_TEXT.includes('a listener indicated an asynchronous response') ||
      FULL_ERROR_TEXT.includes('message channel closed before a response') ||
      ERROR_STACK.includes('chrome-extension://') ||
      ERROR_STACK.includes('moz-extension://') ||
      ERROR_STACK.includes('safari-extension://');

    if (!IS_EXTENSION_ERROR) {
      // Only log non-extension errors
      console.error('Unhandled promise rejection:', reason);
      // Optionally: Send to error tracking service
      // logErrorToService(reason);
    }

    // Always prevent default browser error handling for extension errors
    if (IS_EXTENSION_ERROR) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return false;
    }
  },
  true
); // Use capture phase for early interception

// Global error handler for synchronous errors
window.addEventListener(
  'error',
  (event) => {
    // Filter out Chrome extension errors
    const ERROR_MESSAGE = typeof event.message === 'string' ? event.message : '';
    const ERROR_OBJ: unknown = event.error;
    let ERROR_STACK = '';
    if (ERROR_OBJ && typeof ERROR_OBJ === 'object' && 'stack' in ERROR_OBJ) {
      const STACK_VALUE = (ERROR_OBJ as { stack?: unknown }).stack;
      ERROR_STACK = typeof STACK_VALUE === 'string' ? STACK_VALUE : '';
    }
    const FULL_ERROR_TEXT = (ERROR_MESSAGE + ' ' + ERROR_STACK).toLowerCase();

    const IS_EXTENSION_ERROR =
      FULL_ERROR_TEXT.includes('message channel closed') ||
      FULL_ERROR_TEXT.includes('back/forward cache') ||
      FULL_ERROR_TEXT.includes('bfcache') ||
      FULL_ERROR_TEXT.includes('extension port') ||
      FULL_ERROR_TEXT.includes('extension context invalidated') ||
      FULL_ERROR_TEXT.includes('receiving end does not exist') ||
      FULL_ERROR_TEXT.includes('asynchronous response') ||
      FULL_ERROR_TEXT.includes('listener indicated') ||
      FULL_ERROR_TEXT.includes('a listener indicated an asynchronous response') ||
      FULL_ERROR_TEXT.includes('message channel closed before a response') ||
      ERROR_STACK.includes('chrome-extension://') ||
      ERROR_STACK.includes('moz-extension://') ||
      ERROR_STACK.includes('safari-extension://');

    if (!IS_EXTENSION_ERROR) {
      console.error('Global error:', ERROR_OBJ);
    }

    // Always prevent default browser error handling for extension errors
    if (IS_EXTENSION_ERROR) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return false;
    }
  },
  true
); // Use capture phase for early interception

// Also override console.error to filter extension errors
const ORIGINAL_CONSOLE_ERROR = console.error;
console.error = (...args: unknown[]) => {
  const ERROR_STRING = args
    .map((arg: unknown) => {
      if (arg && typeof arg === 'object') {
        const OBJ = arg as { message?: unknown; toString?: () => string; stack?: unknown };
        const MESSAGE = typeof OBJ.message === 'string' ? OBJ.message : '';
        const TO_STRING_RESULT = typeof OBJ.toString === 'function' ? OBJ.toString() : '';
        const MESSAGE_STR =
          MESSAGE || (typeof TO_STRING_RESULT === 'string' ? TO_STRING_RESULT : '');
        const STACK = typeof OBJ.stack === 'string' ? OBJ.stack : '';
        return MESSAGE_STR + ' ' + STACK;
      }
      if (arg === null || arg === undefined) {
        return '';
      }
      if (typeof arg === 'string' || typeof arg === 'number' || typeof arg === 'boolean') {
        return String(arg);
      }
      // For other types, return empty string to avoid Object.toString() warning
      return '';
    })
    .join(' ')
    .toLowerCase();
  const IS_EXTENSION_ERROR =
    ERROR_STRING.includes('message channel closed') ||
    ERROR_STRING.includes('back/forward cache') ||
    ERROR_STRING.includes('bfcache') ||
    ERROR_STRING.includes('extension port') ||
    ERROR_STRING.includes('extension context invalidated') ||
    ERROR_STRING.includes('asynchronous response') ||
    ERROR_STRING.includes('listener indicated') ||
    ERROR_STRING.includes('a listener indicated an asynchronous response') ||
    ERROR_STRING.includes('message channel closed before a response');

  if (!IS_EXTENSION_ERROR) {
    ORIGINAL_CONSOLE_ERROR.apply(console, args);
  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  </StrictMode>
);
