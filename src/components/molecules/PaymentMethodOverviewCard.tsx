import type React from 'react';
import type { OrganizationPaymentMethodDto } from '@/store/api/homeDashboardApi';
import {
  formatBillingScheduleLabel,
  normalizePaymentModel,
  paymentModelBadgeClassName,
  paymentModelDisplayLabel,
} from '@/lib/paymentSettings';
import { statusToBadgeLabel } from '@/lib/homeDashboard';
import { cn } from '@/lib/utils';

interface PaymentMethodOverviewCardProps {
  method: OrganizationPaymentMethodDto;
}

export function PaymentMethodOverviewCard({
  method,
}: PaymentMethodOverviewCardProps): React.JSX.Element {
  const kind = normalizePaymentModel(method.payment_model);
  const modelLabel = kind
    ? paymentModelDisplayLabel(kind)
    : statusToBadgeLabel(method.payment_model ?? 'Unknown');
  const modelBadgeClass = kind ? paymentModelBadgeClassName(kind) : 'bg-[#52525B] text-white';
  const scheduleLabel = formatBillingScheduleLabel(
    method.billing_schedule,
    method.billing_day_of_month,
    method.billing_days_after_order
  );

  return (
    <div className="flex h-[177px] flex-col gap-10 rounded-[10px] border border-[#CBCBD8] bg-white px-4 pb-5 pt-4">
      <span className="inline-flex h-[22px] w-fit items-center gap-1.5 rounded-full bg-[rgba(16,185,129,0.1)] px-2.5 py-0.5 text-xs font-semibold text-[#10B981]">
        <span className="h-[9px] w-[9px] shrink-0 rounded-full bg-[#10B981]" aria-hidden />
        Active
      </span>
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-[#858594]">Payment Model</span>
          <span
            className={cn(
              'inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold',
              modelBadgeClass
            )}
          >
            {modelLabel}
          </span>
        </div>
        <div className="flex items-start justify-between gap-2 text-sm font-medium">
          <span className="shrink-0 text-[#858594]">Billing Schedule</span>
          <span className="max-w-[114px] text-right leading-snug text-[#030303]">
            {scheduleLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
