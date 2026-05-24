import * as React from 'react';
import { cn } from '@/lib/utils';
import Typography from '../atoms/Typography';

interface PickupCardMetaSectionProps {
  status: boolean;
  label: string;
  className?: string;
  onClick?: () => void;
}

export default function PickupRquest({
  status,
  label,
  className,
  onClick,
}: PickupCardMetaSectionProps): React.JSX.Element {
  const content = (
    <>
      <div className="h-1 w-full bg-gray-200">
        {status && <div className="h-1 w-full bg-red-600" />}
      </div>
      <div className="flex w-full items-center justify-center gap-1.5">
        {status ? (
          <div className="size-5 shrink-0 rounded-full border-4 border-primary-500" />
        ) : (
          <div className="size-5 shrink-0 rounded-full border border-gray-500" />
        )}
        <Typography
          variant="label"
          weight={status ? 'medium' : 'normal'}
          className={cn(
            status ? 'text-gray-900' : 'text-gray-500',
            'block min-w-0 flex-1 truncate'
          )}
        >
          {label}
        </Typography>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={cn('flex min-w-0 flex-1 flex-col items-start gap-1.5', className)}
        onClick={onClick}
        aria-pressed={status}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={cn('flex min-w-0 flex-1 flex-col items-start gap-1.5', className)}>
      {content}
    </div>
  );
}
