import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import Typography from '@/components/atoms/Typography';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  icon: React.ElementType;
  iconClassName?: string;
  label: string;
  value?: number | string | null;
  changePct?: number | null;
  comparisonLabel: string;
  isLoading?: boolean;
  unit?: string;
  hideTrend?: boolean;
}

function formatChange(pct?: number | null): { text: string; up: boolean; isZero: boolean } {
  const num = Number(pct ?? 0);
  if (!Number.isFinite(num)) return { text: '0%', up: true, isZero: true };
  const rounded = Math.round(num * 10) / 10;
  const text = `${rounded > 0 ? '+' : ''}${rounded.toFixed(Number.isInteger(rounded) ? 0 : 1)}%`;
  return { text, up: rounded >= 0, isZero: rounded === 0 };
}

export default function KpiCard({
  icon: Icon,
  iconClassName,
  label,
  value,
  changePct,
  comparisonLabel,
  isLoading,
  unit,
  hideTrend,
}: KpiCardProps): React.JSX.Element {
  const delta = formatChange(changePct);

  return (
    <div className="flex h-[130px] min-w-[180px] flex-col rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex flex-1 flex-col gap-1">
        <Icon className={cn('h-5 w-5 text-gray-500', iconClassName)} />
        <Typography variant="label" className="text-[14px] font-medium leading-5 text-[#020617]">
          {label}
        </Typography>
        {isLoading ? (
          <div className="mt-1 h-7 w-16 animate-pulse rounded bg-gray-100" />
        ) : (
          <div className="flex items-baseline gap-1">
            <Typography className="text-[24px] font-semibold leading-7 text-[#030303]">
              {value ?? 0}
            </Typography>
            {unit ? (
              <Typography className="text-[13px] font-medium text-[#71717A]">{unit}</Typography>
            ) : null}
          </div>
        )}
      </div>
      {hideTrend ? null : (
        <div className="flex items-center gap-1.5">
          {isLoading ? (
            <div className="h-4 w-32 animate-pulse rounded bg-gray-100 mt-1" />
          ) : (
            <>
              <span
                className={cn('inline-flex items-center text-[12px] font-semibold', {
                  'text-emerald-600': delta.up,
                  'text-rose-600': !delta.up,
                })}
              >
                {delta.up ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {delta.text}
              </span>
              <Typography className="text-[12px] font-medium text-[#A1A1AA]">
                {comparisonLabel}
              </Typography>
            </>
          )}
        </div>
      )}
    </div>
  );
}
