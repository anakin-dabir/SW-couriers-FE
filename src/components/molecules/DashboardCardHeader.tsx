import * as React from 'react';
import { Typography } from '@/components/atoms';
import { cn } from '@/lib/utils';

interface DashboardCardHeaderProps {
  /** Card title text */
  title: string;
  /** Action elements (buttons, selects, etc.) to display on the right side */
  actions?: React.ReactNode;
  /** Additional className for the wrapper */
  className?: string;
}

/**
 * DashboardCardHeader component
 * Reusable header wrapper for dashboard cards with title and actions.
 * Title uses the same styling as PageHeader (h5, semibold, text-xl font-medium text-gray-900).
 * Actions are positioned on the right with justify-between layout.
 */
export default function DashboardCardHeader({
  title,
  actions,
  className,
}: DashboardCardHeaderProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-row flex-wrap items-center justify-between gap-2 space-y-0',
        className
      )}
    >
      <Typography variant="h5" weight="semibold" className="text-xl font-medium text-gray-900">
        {title}
      </Typography>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
