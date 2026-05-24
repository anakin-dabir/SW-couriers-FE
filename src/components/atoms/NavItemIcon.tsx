import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemIconProps {
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Size class for the icon */
  size?: string;
  /** Additional className */
  className?: string;
}

/**
 * Atomic component for displaying navigation item icons
 */
export default function NavItemIcon({
  icon: Icon,
  size = 'size-5',
  className,
}: NavItemIconProps): React.JSX.Element {
  return <Icon className={cn(size, className)} />;
}
