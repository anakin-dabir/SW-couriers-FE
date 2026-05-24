import * as React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import type { PaymentMethodUtilizationItem } from '@/lib/paymentSettings';
import { formatMoneyGBP } from '@/lib/homeDashboard';

interface PaymentMethodUtilizationPanelProps {
  items: PaymentMethodUtilizationItem[];
}

export function PaymentMethodUtilizationPanel({
  items,
}: PaymentMethodUtilizationPanelProps): React.JSX.Element {
  const chartData = React.useMemo(
    () => items.filter((item) => item.amount > 0).map((item) => ({ ...item, value: item.amount })),
    [items]
  );

  const outerRadius = 330;
  const innerRadius = 200;

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-col gap-[26px]">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
                aria-hidden
              />
              <span className="text-base font-medium text-[#464649]">{item.label}</span>
            </div>
            <span className="shrink-0 text-base font-semibold text-[#030303]">
              {formatMoneyGBP(item.amount)}
            </span>
          </div>
        ))}
      </div>

      <div className="my-3 h-px w-full bg-[#F1F5F9]" />

      <div className="relative w-full overflow-hidden" style={{ height: outerRadius + 8 }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                paddingAngle={3}
                stroke="#FFFFFF"
                strokeWidth={3}
                cornerRadius={6}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </div>
  );
}
