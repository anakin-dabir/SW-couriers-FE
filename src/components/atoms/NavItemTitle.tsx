import { cn } from '@/lib/utils';

interface NavItemTitleProps {
  /** Title text to display */
  title: string;
  /** Size variant */
  size?: 'sm' | 'base';
  /** Additional className */
  className?: string;
}

/**
 * Atomic component for displaying navigation item titles
 */
export default function NavItemTitle({
  title,
  size = 'sm',
  className,
}: NavItemTitleProps): React.JSX.Element {
  const SIZE_CLASS = size === 'sm' ? 'text-sm' : 'text-base';
  return <span className={cn(SIZE_CLASS, 'text-sidebar-text', className)}>{title}</span>;
}
