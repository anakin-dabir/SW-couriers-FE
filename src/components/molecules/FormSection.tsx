import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  /** Form content */
  children: ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * Molecule component for form section wrapper
 */
export default function FormSection({ children, className }: FormSectionProps): React.JSX.Element {
  return (
    <main
      id="main-content"
      role="main"
      className={cn(
        'flex flex-1 items-center justify-center rounded-lg bg-off-white px-4 py-12 sm:px-6 lg:px-8',
        className
      )}
    >
      {children}
    </main>
  );
}
