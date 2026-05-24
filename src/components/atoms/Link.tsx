import { memo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { LinkProps as RouterLinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LinkProps extends Omit<RouterLinkProps, 'to'> {
  children: ReactNode;
  to: string;
  variant?: 'default' | 'primary' | 'secondary';
  underline?: boolean;
  'aria-label'?: string;
}

const Link = memo(function Link({
  children,
  to,
  variant = 'default',
  underline = false,
  className = '',
  'aria-label': ariaLabel,
  ...props
}: LinkProps) {
  const ACCESSIBLE_LABEL = ariaLabel || (typeof children === 'string' ? children : undefined);

  const VARIANT_CLASSES = {
    default: 'text-gray-900',
    primary: 'text-primary-500',
    secondary: 'text-gray-500',
  };

  return (
    <RouterLink
      to={to}
      className={cn(
        'transition-colors',
        VARIANT_CLASSES[variant],
        underline ? 'underline' : 'no-underline',
        'hover:opacity-80',
        className
      )}
      aria-label={ACCESSIBLE_LABEL}
      {...props}
    >
      {children}
    </RouterLink>
  );
});

export default Link;
