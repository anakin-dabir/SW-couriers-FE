import * as React from 'react';
import { Typography } from '@/components/atoms';
import { cn } from '@/lib/utils';

interface ChartLegendItemProps {
  /** Label text */
  label: string;
  /** Color for the indicator dot */
  color: string;
  /** Optional percentage to display */
  percentage?: number;
  /** Optional className */
  className?: string;
}

/**
 * ChartLegendItem atom component.
 * Displays a legend entry with colored dot, label, and optional percentage.
 * Used in chart legends.
 */
export default function ChartLegendItem({
  label,
  color,
  percentage,
  className,
}: ChartLegendItemProps): React.JSX.Element {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('h-3 w-3 rounded-full shrink-0')} style={{ backgroundColor: color }} />
      <Typography variant="body" className="text-base text-gray-900">
        {label}
      </Typography>
      {percentage !== undefined && (
        <Typography variant="body" className="text-base text-gray-900 ml-auto">
          {percentage}%
        </Typography>
      )}
    </div>
  );
}
