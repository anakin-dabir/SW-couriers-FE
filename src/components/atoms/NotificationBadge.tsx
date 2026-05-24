import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  /** Additional className */
  className?: string;
}

/**
 * Atomic component for notification badge/dot indicator
 */
export default function NotificationBadge({
  className,
}: NotificationBadgeProps): React.JSX.Element {
  return (
    <span
      className={cn(
        'absolute -right-px -top-px size-2.5',
        'rounded-full border border-gray-100 bg-gray-300',
        className
      )}
    />
  );
}
