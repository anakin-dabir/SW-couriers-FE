import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { InvoicePaymentStatus } from '@/store/api/invoicesApi';
import {
  type BillingOverviewChartRow,
  computeBillingChartMaxValue,
  formatBillingAxisValue,
  formatBillingTooltipMoney,
} from '@/lib/billingOverviewChart';
import { cn } from '@/lib/utils';

interface BillingOverviewChartProps {
  rows: BillingOverviewChartRow[];
  className?: string;
}

export function BillingOverviewChart({
  rows,
  className,
}: BillingOverviewChartProps): React.JSX.Element {
  const [activeStatus, setActiveStatus] = React.useState<InvoicePaymentStatus | null>(null);
  const chartData = React.useMemo(() => {
    const maxAmount = Math.max(0, ...rows.map((row) => row.totalValue));
    const maxCount = Math.max(0, ...rows.map((row) => row.invoiceCount));
    const countScale = maxAmount > 0 ? maxAmount * 0.12 : maxCount > 0 ? 1 : 0;

    return [...rows].reverse().map((row) => {
      const amountBar = row.totalValue;
      const countBar =
        amountBar === 0 && row.invoiceCount > 0 && maxCount > 0
          ? (row.invoiceCount / maxCount) * countScale
          : 0;

      return {
        ...row,
        barValue: amountBar > 0 ? amountBar : countBar,
        axisLabel: row.label.toUpperCase(),
      };
    });
  }, [rows]);

  const maxValue = React.useMemo(
    () =>
      computeBillingChartMaxValue(chartData.map((row) => ({ ...row, totalValue: row.barValue }))),
    [chartData]
  );

  const hasData = rows.length > 0;

  if (!hasData) {
    return (
      <div className={cn('flex min-h-[280px] items-center justify-center rounded-xl', className)}>
        <div className="rounded-lg border border-dashed border-[#E5E7EB] px-10 py-12 text-center text-sm text-[#71717A]">
          No invoice data for this period.
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative min-h-[280px] w-full', className)}>
      <ResponsiveContainer width="100%" height={311}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 8, left: 4, bottom: 28 }}
          barCategoryGap="18%"
          onMouseMove={(state) => {
            const index = state?.activeTooltipIndex;
            if (typeof index !== 'number' || index < 0 || index >= chartData.length) {
              setActiveStatus(null);
              return;
            }
            setActiveStatus(chartData[index]?.status ?? null);
          }}
          onMouseLeave={() => setActiveStatus(null)}
        >
          <CartesianGrid horizontal={false} stroke="#E5E7EB" strokeDasharray="0" />
          <XAxis
            type="number"
            domain={[0, maxValue]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#B3B3C2', fontSize: 12, fontWeight: 500 }}
            tickFormatter={(value) =>
              formatBillingAxisValue(typeof value === 'number' ? value : Number(value))
            }
            tickCount={8}
          />
          <YAxis
            type="category"
            dataKey="axisLabel"
            width={98}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#B3B3C2', fontSize: 12, fontWeight: 500 }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(241,245,249,0.35)' }}
            wrapperStyle={{ outline: 'none', zIndex: 20 }}
            isAnimationActive={false}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0]?.payload as BillingOverviewChartRow;
              if (!row) return null;
              return (
                <div className="relative rounded-lg border border-[#E5E7EB] bg-white p-2.5 shadow-md">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      row.badgeClassName
                    )}
                  >
                    {row.label}
                  </span>
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center justify-between gap-6 text-[10px]">
                      <span className="flex items-center gap-1 text-[#9C9CAB]">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: row.barColor }}
                        />
                        Total Value
                      </span>
                      <span className="font-semibold text-[#030303]">
                        {formatBillingTooltipMoney(row.totalValue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-6 text-[10px]">
                      <span className="flex items-center gap-1 text-[#9C9CAB]">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-[#CBD5E1]" />
                        Invoice Count
                      </span>
                      <span className="font-semibold text-[#030303]">{row.invoiceCount}</span>
                    </div>
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="barValue" radius={[0, 4, 4, 0]} maxBarSize={25}>
            {chartData.map((entry) => (
              <Cell
                key={entry.status}
                fill={entry.barColor}
                fillOpacity={activeStatus ? (activeStatus === entry.status ? 1 : 0.5) : 0.5}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
