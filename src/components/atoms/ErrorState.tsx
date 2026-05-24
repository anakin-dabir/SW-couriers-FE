import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Typography from './Typography';
import { Button } from '@/components/atoms/Button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  /** Error message to display */
  message?: string;
  /** Optional description text */
  description?: string;
  /** Retry handler function */
  onRetry?: () => void;
  /** Retry button label */
  retryLabel?: string;
  /** Additional className */
  className?: string;
  /** Custom icon component */
  icon?: React.ReactNode;
}

/**
 * ErrorState component
 * Displays when an API call fails or error occurs
 */
export default function ErrorState({
  message = 'Something went wrong',
  description = 'An error occurred while loading data. Please try again.',
  onRetry,
  retryLabel = 'Retry',
  className,
  icon,
}: ErrorStateProps): React.JSX.Element {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-12 px-4', className)}>
      {icon || <AlertCircle className="h-12 w-12 text-error" />}
      <div className="flex flex-col items-center gap-2">
        <Typography variant="body" weight="medium" align="center" className="text-form-title">
          {message}
        </Typography>
        {description && (
          <Typography variant="caption" align="center" className="text-form-body max-w-md mx-auto">
            {description}
          </Typography>
        )}
      </div>
      {onRetry && (
        <Button variant="default" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
