import * as React from 'react';
import { PieChartCenterLabel, PieChartTooltip } from '@/components/atoms';
import type { DeliveryStatusData } from '@/types/delivery';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from 'recharts';
import { cn } from '@/lib/utils';

interface DeliveryStatusPieChartProps {
  /** Chart data array */
  data: DeliveryStatusData[];
  /** Delivery rate percentage to display in center */
  deliveryRatePercentage: number;
  /** Total value for percentage calculations */
  total: number;
  /** Optional className */
  className?: string;
}

/**
 * DeliveryStatusPieChart molecule component.
 * Displays a doughnut pie chart with central label showing delivery rate.
 * Used in DeliveryStatusCard.
 */
export default function DeliveryStatusPieChart({
  data,
  deliveryRatePercentage,
  total,
  className,
}: DeliveryStatusPieChartProps): React.JSX.Element {
  return (
    <div className={cn('w-full flex-1 h-full min-h-64 sm:min-h-0 relative', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
            cornerRadius={10}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
            <Label
              content={({ viewBox }) => (
                <PieChartCenterLabel
                  percentage={deliveryRatePercentage}
                  label="Delivery Rate"
                  viewBox={viewBox as { cx?: number; cy?: number } | undefined}
                />
              )}
            />
          </Pie>
          <Tooltip
            content={(props) => (
              <PieChartTooltip active={props.active} payload={props.payload} total={total} />
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
