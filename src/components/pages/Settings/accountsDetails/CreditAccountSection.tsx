import type { ReactNode } from 'react';
import { CreditCard, Wallet } from 'lucide-react';
import Typography from '@/components/atoms/Typography';
import {
  formatBillingScheduleLabel,
  formatGbpAmount,
  indexPaymentMethodsByModel,
} from '@/lib/paymentSettings';
import {
  PAYMENT_MUTED_PANEL_CLASS,
  PAYMENT_STAT_LABEL_CLASS,
  PAYMENT_STAT_VALUE_CLASS,
} from '@/lib/paymentSettingsUi';
import { portalColors } from '@/lib/portalTheme';
import { SETTINGS_FORM_CARD_CLASS } from '@/lib/settingsUi';
import type {
  OrganizationPaymentDetailsDto,
  OrganizationPaymentMethodDto,
} from '@/store/api/homeDashboardApi';
import { cn } from '@/lib/utils';
import BillingScheduleRow from './BillingScheduleRow';
import PaymentSectionHeader from './PaymentSectionHeader';

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
    <section className={SETTINGS_FORM_CARD_CLASS}>
      <PaymentSectionHeader
        title="Credit Account"
        description="Use your approved credit limit to place orders and pay via invoice."
      />

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={PAYMENT_MUTED_PANEL_CLASS}>
          <Typography className={PAYMENT_STAT_LABEL_CLASS}>Utilization</Typography>
          <Typography className="mt-1 text-3xl font-semibold" style={{ color: portalColors.text }}>
            {utilization.toFixed(1)}%
          </Typography>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full"
            style={{ backgroundColor: portalColors.progressTrack }}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#22C55E] to-[#86EFAC]"
              style={{ width: `${utilization}%` }}
            />
          </div>
        </div>
        <BillingScheduleRow value={billingSchedule} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Credit Limit"
          value={formatGbpAmount(paymentDetails?.credit_limit)}
          icon={<CreditCard className="size-5 text-[#2563EB]" />}
          iconBg="bg-[#DBEAFE]"
        />
        <StatCard
          label="Outstanding Balance"
          value={formatGbpAmount(paymentDetails?.used_credit)}
          icon={<Wallet className="size-5 text-[#EA580C]" />}
          iconBg="bg-[#FFEDD5]"
        />
        <StatCard
          label="Available Credit"
          value={formatGbpAmount(paymentDetails?.available_credit)}
          icon={<CreditCard className="size-5" style={{ color: portalColors.success }} />}
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
      <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', iconBg)}>
        {icon}
      </div>
      <div>
        <Typography variant="caption" className={PAYMENT_STAT_LABEL_CLASS}>
          {label}
        </Typography>
        <Typography className={PAYMENT_STAT_VALUE_CLASS}>{value}</Typography>
      </div>
    </div>
  );
}
