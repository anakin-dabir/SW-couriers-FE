/**
 * Default amount passed to 3DS verifyCard. Braintree expects a monetary string;
 * override per checkout using your real order total when charging.
 */
export const BRAINTREE_3DS_VERIFICATION_AMOUNT_DEFAULT = '1.00';

export const hostedFieldStyles = {
  input: {
    'font-size': '14px',
    'line-height': '1rem',
    color: '#030303',
    'font-family': 'Inter, system-ui, sans-serif',
  },
  '::placeholder': {
    color: '#b3b3c2',
  },
} as const;

/** Tailwind-friendly wrapper for Hosted Fields mount nodes */
export const hostedFieldContainerClass =
  'relative flex h-10 w-full items-center rounded-md border border-[var(--color-form-border-light)] bg-white px-3 py-2 transition-[box-shadow,border-color]';
