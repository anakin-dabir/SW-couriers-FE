import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ForgotPasswordLinkProps {
  /** Additional className */
  className?: string;
}

/**
 * Atomic component for forgot password link
 */
export default function ForgotPasswordLink({
  className,
}: ForgotPasswordLinkProps): React.JSX.Element {
  return (
    <Link
      to="/forgot-password"
      className={cn(
        'text-sm font-normal leading-none text-form-subtitle underline hover:text-form-body transition-colors',
        className
      )}
      aria-label="Forgot your password"
    >
      Forgot your password?
    </Link>
  );
}
