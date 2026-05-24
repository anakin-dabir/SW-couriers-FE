import * as React from 'react';
import { Typography } from '@/components/atoms';
import { cn } from '@/lib/utils';

interface ProgressBarTimeLabelProps {
  /** Time remaining text */
  timeRemaining: string;
  /** Optional className */
  className?: string;
}

/**
 * ProgressBarTimeLabel atom component.
 * Displays the time remaining label on the progress bar.
 */
export default function ProgressBarTimeLabel({
  timeRemaining,
  className,
}: ProgressBarTimeLabelProps): React.JSX.Element {
  return (
    <div className={cn('absolute right-4 top-1/2 -translate-y-1/2', className)}>
      <Typography variant="body" weight="semibold" className="text-primary">
        {timeRemaining}
      </Typography>
    </div>
  );
}
