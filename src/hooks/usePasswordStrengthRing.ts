import { useMemo } from 'react';

/**
 * Hook to check if password input should have error ring styling
 */
export function usePasswordStrengthRing(password: string): string {
  const isWeak = useMemo(() => {
    if (!password) return false;

    const requirements = {
      minLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasSymbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    };

    const score = Object.values(requirements).filter(Boolean).length;
    return score < 3;
  }, [password]);

  return isWeak && password ? 'ring-2 ring-red-500 ring-offset-2' : '';
}
