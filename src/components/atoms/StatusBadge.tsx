import * as React from 'react';
import { Badge } from '@/components/atoms/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'info' | 'warning';
  className?: string;
}

export default function StatusBadge({
  status,
  variant = 'success',
  className,
}: StatusBadgeProps): React.JSX.Element {
  return (
    <Badge variant={variant} className={cn('shrink-0 uppercase', className)}>
      {status}
    </Badge>
  );
}
