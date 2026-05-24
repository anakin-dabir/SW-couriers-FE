import * as React from 'react';
// import { ArrowUpRight } from 'lucide-react';
import Typography from './Typography';
// import { Button } from '@/components/atoms/Button';
import { cn } from '@/lib/utils';

interface StatCardProps {
  /** Card title */
  title: string;
  /** Card value (can be currency or number) */
  value: string | number;
  /** Optional link URL for the action button */
  href?: string;
  /** Optional click handler for the action button */
  onClick?: () => void;
  /** Whether the value should be displayed in red (for overdue/critical) */
  isCritical?: boolean;
  /** Optional icon (defaults to Package). Use lucide-react or src/assets/svg. */
  icon?: React.ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * StatCard component
 * Reusable card for displaying statistics with title, value, and action button
 */
export default function StatCard({
  title,
  value,
  // href,
  // onClick,
  isCritical = false,
  icon,
  className,
}: StatCardProps): React.JSX.Element {
  const VALUE_DISPLAY = typeof value === 'number' ? value.toLocaleString() : value;

  // const ACTION_BUTTON = href ? (
  //   <a
  //     href={href}
  //     className="flex items-center border border-gray-900 p-2 rounded-full justify-center transition-opacity hover:opacity-80"
  //     aria-label={`View ${title}`}
  //   >
  //     <ArrowUpRight className="h-4 w-4 text-gray-400" />
  //   </a>
  // ) : (
  //   <Button
  //     type="button"
  //     variant="ghost"
  //     size="icon"
  //     onClick={onClick}
  //     className="flex h-auto w-auto bg-white items-center border border-gray-200  rounded-full  justify-center p-2 transition-opacity hover:opacity-80"
  //     aria-label={`View ${title}`}
  //   >
  //     <ArrowUpRight className="h-4 w-4 text-gray-400" />
  //   </Button>
  // );

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-3xl bg-gray-100 border border-gray-200 px-6 py-3 ',
        className
      )}
    >
      {icon && (
        <div className={cn(' flex items-center', icon ? 'justify-between mb-4' : 'justify-end ')}>
          {icon}
          {/* {ACTION_BUTTON} */}
        </div>
      )}
      <div className="flex items-center justify-between">
        <Typography variant="body" weight="semibold" className="text-base text-gray-900">
          {title}
        </Typography>
        {/* {ACTION_BUTTON} */}
      </div>
      <Typography
        variant="h3"
        weight="bold"
        className={cn('mt-2 text-3xl', isCritical ? 'text-error!' : 'text-gray-900')}
      >
        {VALUE_DISPLAY}
      </Typography>
    </div>
  );
}
