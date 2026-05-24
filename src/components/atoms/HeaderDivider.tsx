import { cn } from '@/lib/utils';

interface HeaderDividerProps {
  /** Additional className */
  className?: string;
}

/**
 * Atomic component for header bottom divider
 */
export default function HeaderDivider({ className }: HeaderDividerProps): React.JSX.Element {
  return <div className={cn('h-px w-full bg-gray-300/40', className)} />;
}
