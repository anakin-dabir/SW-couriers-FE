import Link from '@/components/atoms/Link';
import type { ReactNode } from 'react';
import type React from 'react';
import { cn } from '@/lib/utils';

interface NavigationItemProps {
  to: string;
  children: ReactNode;
  active?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
}

function NavigationItem({
  to,
  children,
  active = false,
  icon,
  onClick,
}: NavigationItemProps): React.JSX.Element {
  return (
    <Link
      to={to}
      onClick={onClick}
      variant={active ? 'primary' : 'default'}
      className={cn(
        'flex items-center gap-2 rounded-md px-4 py-2.5 transition-colors',
        active
          ? 'bg-primary-50 font-semibold text-primary'
          : 'font-normal text-gray-900 hover:bg-gray-100'
      )}
    >
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </Link>
  );
}

export default NavigationItem;
