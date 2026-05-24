import { cn } from '@/lib/utils';
import Typography from './Typography';

interface TableLinkProps {
  /** Link text */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Link href */
  href?: string;
  /** Additional className */
  className?: string;
}

/**
 * Atomic component for clickable table cell link
 * Used for invoice numbers and other clickable references
 */
export default function TableLink({
  children,
  onClick,
  href,
  className,
}: TableLinkProps): React.JSX.Element {
  const handleClick = (e: React.MouseEvent): void => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <a
      href={href || '#'}
      onClick={handleClick}
      className={cn(
        'text-gray-550 font-bold text-xs underline cursor-pointer hover:text-gray-700 transition-colors',
        className
      )}
    >
      <Typography variant="caption" weight="bold" className="text-inherit underline">
        {children}
      </Typography>
    </a>
  );
}
