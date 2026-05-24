import * as React from 'react';
import { Typography } from '@/components/atoms';
import { cn } from '@/lib/utils';

interface InfoBlockProps {
  /** Label text (e.g. "ETA", "Distance") */
  label: string;
  /** Value to display */
  value: string;
  /** Alignment: 'left' or 'right' */
  align?: 'left' | 'right';
  /** Optional className */
  className?: string;
}

/**
 * InfoBlock atom component.
 * Displays a label and value pair (e.g. ETA, Distance).
 * Used in RecentPickupCard for ETA and Distance blocks.
 */
export default function InfoBlock({
  label,
  value,
  align = 'left',
  className,
}: InfoBlockProps): React.JSX.Element {
  return (
    <div className={cn('flex flex-col gap-0.5', align === 'right' && 'items-end', className)}>
      <Typography variant="caption" className="text-xs font-medium text-gray-500 uppercase">
        {label}
      </Typography>
      <Typography variant="body" className="text-lg font-semibold text-gray-900">
        {value}
      </Typography>
    </div>
  );
}
