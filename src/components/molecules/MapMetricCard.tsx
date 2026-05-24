import * as React from 'react';
import { Card } from '@/components/molecules/card';
import { Typography } from '@/components/atoms';
import { cn } from '@/lib/utils';

interface MapMetricCardProps {
  /** Label text (e.g., "Distance remaining") */
  label: string;
  /** Value text (e.g., "0,542 km") */
  value: string;
  /** Optional leading icon */
  icon?: React.ComponentType<{ className?: string }>;
  /** Optional className */
  className?: string;
}

/**
 * MapMetricCard molecule component.
 * Reusable metric card for delivery tracking map overlay.
 * Matches Figma design 490-23531 exactly.
 *
 * Structure:
 * - Optional leading icon
 * - Label text (caption variant)
 * - Value text (bold, larger)
 *
 * Styling (from Figma):
 * - Padding: p-3 (md:p-4)
 * - Border radius: rounded-lg
 * - Shadow: shadow-sm
 * - Layout: flex column
 * - Gap: gap-1 between label and value
 */
export default function MapMetricCard({
  label,
  value,
  icon: Icon,
  className,
}: MapMetricCardProps): React.JSX.Element {
  return (
    <Card
      className={cn(
        'flex flex-col gap-1 bg-gray-50 w-full',
        'rounded-lg border-0 p-2.5',
        'sm:p-3.5 md:p-4',
        className
      )}
    >
      {Icon && <Icon className="mb-1 h-4 w-4 shrink-0 text-primary md:h-5 md:w-5" />}
      <Typography variant="caption" className="text-gray-500 font-medium text-xs sm:text-sm">
        {label}
      </Typography>
      <Typography variant="h5" weight="bold" className="text-lg sm:text-2xl text-gray-900">
        {value}
      </Typography>
    </Card>
  );
}
