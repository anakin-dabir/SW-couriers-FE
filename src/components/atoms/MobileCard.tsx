import * as React from 'react';
import { cn } from '@/lib/utils';

interface MobileCardProps {
  /** Card content */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Additional className */
  className?: string;
}

/**
 * Atom component for mobile card container
 */
export default function MobileCard({
  children,
  onClick,
  className,
}: MobileCardProps): React.JSX.Element {
  if (onClick) {
    return (
      <button
        type="button"
        className={cn(
          'bg-white rounded-xl p-4 flex flex-col gap-3 text-left cursor-pointer active:bg-gray-50',
          className
        )}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }

  return (
    <div className={cn('bg-white rounded-xl p-4 flex flex-col gap-3', className)}>{children}</div>
  );
}
