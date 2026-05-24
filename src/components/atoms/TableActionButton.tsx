import { MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableActionButtonProps {
  /** Click handler */
  onClick?: () => void;
  /** Whether the menu is open */
  isOpen?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * Atomic component for table action button (3-dot menu)
 */
export default function TableActionButton({
  onClick,
  isOpen,
  className,
}: TableActionButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-center p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer',
        isOpen && 'bg-gray-100',
        className
      )}
      aria-label="Open actions menu"
    >
      <MoreVertical className="h-5 w-5 text-gray-550" />
    </button>
  );
}
