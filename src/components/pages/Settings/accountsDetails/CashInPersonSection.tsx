import { formatBillingScheduleLabel, indexPaymentMethodsByModel } from '@/lib/paymentSettings';
import { SETTINGS_FORM_CARD_CLASS } from '@/lib/settingsUi';
import { portalColors } from '@/lib/portalTheme';
import type { OrganizationPaymentMethodDto } from '@/store/api/homeDashboardApi';
import BillingScheduleRow from './BillingScheduleRow';
import PaymentSectionHeader from './PaymentSectionHeader';

interface CashInPersonSectionProps {
  orgPaymentMethods: OrganizationPaymentMethodDto[] | undefined;
}

export default function CashInPersonSection({
  orgPaymentMethods,
}: CashInPersonSectionProps): React.JSX.Element {
  const cashMethod = indexPaymentMethodsByModel(orgPaymentMethods).cash;
  const billingSchedule = formatBillingScheduleLabel(
    cashMethod?.billing_schedule,
    cashMethod?.billing_day_of_month,
    cashMethod?.billing_days_after_order
  );

  return (
    <section className={SETTINGS_FORM_CARD_CLASS}>
      <PaymentSectionHeader
        title="Cash (In-Person)"
        description="Pay in person at our office or depot."
      />

      <ul
        className="mt-5 list-disc space-y-2 pl-5 text-sm leading-6"
        style={{ color: portalColors.textSecondary }}
      >
        <li>Payments are settled in person at the time of service or collection.</li>
        <li>All cash payments are recorded and confirmed by an administrator.</li>
      </ul>

      <div className="mt-5">
        <BillingScheduleRow value={billingSchedule} />
      </div>
    </section>
  );
}
