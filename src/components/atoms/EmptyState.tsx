import * as React from 'react';
import { Inbox } from 'lucide-react';
import Typography from './Typography';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /** Main message to display */
  message?: string;
  /** Optional description text */
  description?: string;
  /** Additional className */
  className?: string;
  /** Custom icon component */
  icon?: React.ReactNode;
}

/**
 * EmptyState component
 * Displays when there are no records/data to show
 */
export default function EmptyState({
  message = 'No records found',
  description,
  className,
  icon,
}: EmptyStateProps): React.JSX.Element {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-12 px-4', className)}>
      {icon || <Inbox className="h-12 w-12 text-muted-foreground" />}
      <div className="flex flex-col items-center justify-center gap-2">
        <Typography variant="body" weight="medium" align="center" className="text-form-title">
          {message}
        </Typography>
        {description && (
          <Typography variant="caption" align="center" className="text-form-body max-w-md mx-auto">
            {description}
          </Typography>
        )}
      </div>
    </div>
  );
}
