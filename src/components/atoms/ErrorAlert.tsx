import Typography from './Typography';
import { cn } from '@/lib/utils';

interface ErrorAlertProps {
  /** Error message to display */
  message: string;
  /** Alert ID for accessibility */
  id?: string;
  /** Additional className */
  className?: string;
}

/**
 * Atomic component for error alert display
 */
export default function ErrorAlert({ message, id, className }: ErrorAlertProps): React.JSX.Element {
  return (
    <div
      id={id}
      role="alert"
      aria-live="polite"
      className={cn(
        'w-full rounded-md border border-error-light bg-error-light p-3 text-sm text-error-dark',
        className
      )}
    >
      <Typography variant="caption" className="text-error-dark">
        {message}
      </Typography>
    </div>
  );
}
