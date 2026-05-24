import * as React from 'react';
import { Typography } from '@/components/atoms';
import type { Payload, ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import type { DeliveryStatusData } from '@/types/delivery';

type PieChartTooltipPayloadItem = Omit<Payload<ValueType, NameType>, 'payload'> & {
  payload?: unknown;
};

interface PieChartTooltipProps {
  /** Whether tooltip is active */
  active?: boolean;
  /** Tooltip payload data from Recharts */
  payload?: ReadonlyArray<PieChartTooltipPayloadItem>;
  /** Total value for percentage calculation */
  total: number;
}

const isDeliveryStatusData = (value: unknown): value is DeliveryStatusData => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.name === 'string' &&
    typeof candidate.value === 'number' &&
    typeof candidate.color === 'string'
  );
};

/**
 * PieChartTooltip atom component.
 * Custom tooltip for pie charts showing item name, color indicator, and percentage.
 * Used in DeliveryStatusPieChart.
 */
export default function PieChartTooltip({
  active,
  payload,
  total,
}: PieChartTooltipProps): React.JSX.Element | null {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const dataItem = payload[0]?.payload;
  if (!isDeliveryStatusData(dataItem)) {
    return null;
  }

  const percentage = Math.round((dataItem.value / total) * 100);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <Typography variant="body" className="text-sm font-semibold text-gray-900 mb-2">
        {dataItem.name}
      </Typography>
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded" style={{ backgroundColor: dataItem.color }} />
        <Typography variant="caption" className="text-xs text-gray-600">
          Status
        </Typography>
        <Typography variant="body" className="text-sm font-semibold text-gray-900 ml-auto">
          {percentage}%
        </Typography>
      </div>
    </div>
  );
}
