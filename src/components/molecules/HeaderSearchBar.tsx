import { Search } from 'lucide-react';
import { Input } from '@/components/atoms/input';
import { cn } from '@/lib/utils';

interface HeaderSearchBarProps {
  /** Additional className */
  className?: string;
  /** Container className */
  containerClassName?: string;
}

/**
 * Molecule component for header search bar
 */
export default function HeaderSearchBar({
  className,
  containerClassName,
}: HeaderSearchBarProps): React.JSX.Element {
  return (
    <div className={cn('h-12 w-110', containerClassName)}>
      <Input
        type="search"
        placeholder="Search deliveries, invoices.."
        rightIcon={Search}
        className={cn(
          'h-11 rounded-lg border-gray-200/80 bg-white px-4-5',
          'text-base leading-6 text-gray-400 placeholder:text-gray-400',
          'shadow-sm',
          'focus-visible:ring-1 focus-visible:ring-gray-300',
          className
        )}
      />
    </div>
  );
}
