import React from 'react';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu';
import { Button } from '@/components/atoms/Button';

export type KpiPeriod = 'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS';

const PERIOD_OPTIONS: { value: KpiPeriod; label: string; short: string }[] = [
  { value: 'TODAY', label: 'Today', short: 'Today' },
  { value: 'YESTERDAY', label: 'Yesterday', short: 'Yesterday' },
  { value: 'LAST_7_DAYS', label: 'Last 7 Days', short: 'Last 7…' },
  { value: 'LAST_30_DAYS', label: 'Last 30 Days', short: 'Last 30…' },
];

export const KPI_PERIOD_LABELS: Record<KpiPeriod, string> = {
  TODAY: 'Today',
  YESTERDAY: 'Yesterday',
  LAST_7_DAYS: 'Last 7 Days',
  LAST_30_DAYS: 'Last 30 Days',
};

export const KPI_COMPARISON_LABELS: Record<KpiPeriod, string> = {
  TODAY: 'vs yesterday',
  YESTERDAY: 'vs day before',
  LAST_7_DAYS: 'vs previous 7 days',
  LAST_30_DAYS: 'vs previous 30 days',
};

interface KpiPeriodSelectorProps {
  value: KpiPeriod;
  onChange: (next: KpiPeriod) => void;
  className?: string;
}

export default function KpiPeriodSelector({
  value,
  onChange,
  className,
}: KpiPeriodSelectorProps): React.JSX.Element {
  const active = PERIOD_OPTIONS.find((p) => p.value === value) ?? PERIOD_OPTIONS[2];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-10 gap-1.5 rounded-lg border-[#E4E4E7] bg-white px-3 text-[13px] font-medium text-gray-900 hover:bg-gray-50 ${className ?? ''}`}
        >
          {active.short}
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44 rounded-lg border-[#E5E7EB] bg-white p-1 shadow-md"
      >
        {PERIOD_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="cursor-pointer rounded-md px-2.5 py-2 text-[13px] font-medium text-gray-700 hover:bg-[#F9FAFB] data-[highlighted]:bg-[#F9FAFB]"
          >
            <span className="flex flex-1 items-center justify-between">
              {opt.label}
              {opt.value === value ? <span className="text-[#A11010]">✓</span> : null}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
