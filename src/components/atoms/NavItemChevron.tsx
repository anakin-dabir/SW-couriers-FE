import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemChevronProps {
  /** Additional className */
  className?: string;
}

/**
 * Atomic component for displaying chevron icon in collapsible navigation items
 */
export default function NavItemChevron({ className }: NavItemChevronProps): React.JSX.Element {
  return (
    <ChevronDown
      className={cn(
        'size-3.5 text-sidebar-text-dark transition-transform duration-200 group-data-[state=open]/collapsible:-rotate-90',
        className
      )}
    />
  );
}
