import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AuthLinkProps {
  /** Link destination */
  to: string;
  /** Link text */
  children: React.ReactNode;
  /** Whether link should have underline */
  underline?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * Atomic component for auth page links
 * Used for navigation between auth pages
 */
export default function AuthLink({
  to,
  children,
  underline = false,
  className,
}: AuthLinkProps): React.JSX.Element {
  return (
    <Link
      to={to}
      className={cn(
        'text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors',
        underline && 'underline',
        className
      )}
    >
      {children}
    </Link>
  );
}
