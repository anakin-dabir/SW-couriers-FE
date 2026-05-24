import * as React from 'react';
import { Typography } from '@/components/atoms';
import { cn } from '@/lib/utils';

interface TimelineStepContentProps {
  /** Step label */
  label: string;
  /** Step location */
  location: string;
  /** Step timestamp */
  timestamp: string;
  /** Whether this step is completed */
  isCompleted: boolean;
  /** Whether this step is active */
  isActive: boolean;
  /** Whether this step is pending */
  isPending: boolean;
  /** Optional className */
  className?: string;
}

/**
 * TimelineStepContent atom component.
 * Displays timeline step text content: label, location, and timestamp.
 */
export default function TimelineStepContent({
  label,
  location,
  timestamp,
  isCompleted,
  isActive,
  isPending,
  className,
}: TimelineStepContentProps): React.JSX.Element {
  return (
    <div className={cn('flex-1 flex flex-col gap-1 pt-0.5', className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <Typography
            variant="body"
            weight="bold"
            className={cn(
              isCompleted && 'text-gray-900',
              isActive && 'text-primary',
              isPending && 'text-gray-500!',
              'text-base! font-medium!'
            )}
          >
            {label}
          </Typography>
          <Typography
            variant="caption"
            className={cn(isPending ? 'text-gray-500!' : 'text-gray-500!')}
          >
            {location}
          </Typography>
        </div>
        <Typography
          variant="caption"
          className={cn('whitespace-nowrap', isPending && 'text-gray-500!')}
        >
          {timestamp}
        </Typography>
      </div>
    </div>
  );
}
