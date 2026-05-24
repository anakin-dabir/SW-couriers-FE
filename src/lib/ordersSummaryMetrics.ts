import type { OrdersSummaryMetricDto } from '@/store/api/ordersApi';

export function summaryMetricCurrent(metric?: OrdersSummaryMetricDto | null): number | undefined {
  return metric?.current;
}

export function summaryMetricChangePct(metric?: OrdersSummaryMetricDto | null): number | undefined {
  return metric?.change_pct;
}

export function formatOrdersMetricValue(value: number | undefined): string {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '0';
  return num.toLocaleString('en-GB');
}

export function formatOrdersTrendPct(value: number | undefined | null): string {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '0%';
  const rounded = Math.round(num * 10) / 10;
  return `${rounded.toFixed(Number.isInteger(rounded) ? 0 : 1)}%`;
}

export function formatOrdersResolutionDays(value: number | undefined): string {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '0';
  const rounded = Math.round(num * 10) / 10;
  return rounded.toFixed(Number.isInteger(rounded) ? 0 : 1);
}
