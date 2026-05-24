import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AuthCardProps {
  /** Card content */
  children: ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * Atomic component for auth form card container
 * Provides consistent styling for all auth forms
 */
export default function AuthCard({ children, className }: AuthCardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'relative flex w-full max-w-md flex-col items-center gap-6 overflow-hidden rounded-xl border border-form-border bg-white p-6 shadow-sm',
        className
      )}
    >
      {children}
    </div>
  );
}
