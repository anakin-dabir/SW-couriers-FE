import * as React from 'react';
import { Typography } from '@/components/atoms';
import { cn } from '@/lib/utils';

interface MobileCardFieldProps {
  /** Field label */
  label: string;
  /** Field value/content */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * Atom component for mobile card field (label-value pair)
 */
export default function MobileCardField({
  label,
  children,
  className,
}: MobileCardFieldProps): React.JSX.Element {
  return (
    <div className={cn('flex items-center justify-between gap-2', className)}>
      <Typography variant="caption" weight="medium" className="text-form-subtitle">
        {label}
      </Typography>
      <div className="text-right">{children}</div>
    </div>
  );
}
