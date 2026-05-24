import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CreateAccountLinkProps {
  /** Additional className */
  className?: string;
}

/**
 * Atomic component for create account link
 */
export default function CreateAccountLink({
  className,
}: CreateAccountLinkProps): React.JSX.Element {
  return (
    <Link
      to="/register"
      className={cn(
        'flex h-9 items-center justify-center px-3 py-2 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors',
        className
      )}
    >
      Create account
    </Link>
  );
}
