import type { ReactNode } from 'react';
import { CreditCard, Wallet } from 'lucide-react';
import Typography from '@/components/atoms/Typography';
import {
  ACCOUNTS_DETAILS_SECTION_CLASS,
  formatBillingScheduleLabel,
  formatGbpAmount,
  indexPaymentMethodsByModel,
} from '@/lib/paymentSettings';
import type {
  OrganizationPaymentDetailsDto,
  OrganizationPaymentMethodDto,
} from '@/store/api/homeDashboardApi';
import BillingScheduleRow from './BillingScheduleRow';

interface CreditAccountSectionProps {
  paymentDetails: OrganizationPaymentDetailsDto | undefined;
  orgPaymentMethods: OrganizationPaymentMethodDto[] | undefined;
}

export default function CreditAccountSection({
  paymentDetails,
  orgPaymentMethods,
}: CreditAccountSectionProps): React.JSX.Element {
  const creditMethod = indexPaymentMethodsByModel(orgPaymentMethods).credit_account;
  const billingSchedule = formatBillingScheduleLabel(
    creditMethod?.billing_schedule,
    creditMethod?.billing_day_of_month,
    creditMethod?.billing_days_after_order
  );
  const utilization = Math.max(0, Math.min(paymentDetails?.credit_utilization_pct ?? 0, 100));

  return (
    <section className={ACCOUNTS_DETAILS_SECTION_CLASS}>
      <div className="border-b border-[#E6E8EE] pb-4">
        <Typography
          variant="h4"
          weight="semibold"
          className="text-[2rem] leading-none text-[#1E2533]"
        >
          Credit Account
        </Typography>
        <Typography variant="body" color="muted" className="mt-2 text-[#6B7280]">
          Use your approved credit limit to place orders and pay via invoice.
        </Typography>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#E2E6EE] bg-[#F7F8FB] p-4">
          <Typography variant="body" className="mb-2 text-sm text-[#6B7280]">
            Utilization
          </Typography>
          <Typography variant="h4" weight="semibold" className="text-3xl text-[#18181B]">
            {utilization.toFixed(1)}%
          </Typography>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#22C55E] to-[#86EFAC]"
              style={{ width: `${utilization}%` }}
            />
          </div>
        </div>
        <BillingScheduleRow value={billingSchedule} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Credit Limit"
          value={formatGbpAmount(paymentDetails?.credit_limit)}
          icon={<CreditCard className="h-5 w-5 text-[#2563EB]" />}
          iconBg="bg-[#DBEAFE]"
        />
        <StatCard
          label="Outstanding Balance"
          value={formatGbpAmount(paymentDetails?.used_credit)}
          icon={<Wallet className="h-5 w-5 text-[#EA580C]" />}
          iconBg="bg-[#FFEDD5]"
        />
        <StatCard
          label="Available Credit"
          value={formatGbpAmount(paymentDetails?.available_credit)}
          icon={<CreditCard className="h-5 w-5 text-[#16A34A]" />}
          iconBg="bg-[#DCFCE7]"
        />
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  icon,
  iconBg,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  iconBg: string;
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4">
      <div className={cnIcon(iconBg)}>{icon}</div>
      <div>
        <Typography variant="caption" className="text-xs text-[#6B7280]">
          {label}
        </Typography>
        <Typography variant="body" weight="semibold" className="text-lg text-[#18181B]">
          {value}
        </Typography>
      </div>
    </div>
  );
}

function cnIcon(bg: string): string {
  return `flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg}`;
}
