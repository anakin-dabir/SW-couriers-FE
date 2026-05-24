import { cn } from '@/lib/utils';

interface NavItemBadgeProps {
  /** Badge text to display */
  badge: string;
  /** Additional className */
  className?: string;
}

/**
 * Atomic component for displaying navigation item badges
 */
export default function NavItemBadge({ badge, className }: NavItemBadgeProps): React.JSX.Element {
  return (
    <span
      className={cn(
        'flex h-5 min-w-7 items-center justify-center rounded-full bg-primary-300 px-2.5 py-1 text-xs font-semibold text-white',
        className
      )}
    >
      {badge}
    </span>
  );
}
