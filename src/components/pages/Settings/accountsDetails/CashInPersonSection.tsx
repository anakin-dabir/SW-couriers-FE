import Typography from '@/components/atoms/Typography';
import {
  ACCOUNTS_DETAILS_SECTION_CLASS,
  formatBillingScheduleLabel,
  indexPaymentMethodsByModel,
} from '@/lib/paymentSettings';
import type { OrganizationPaymentMethodDto } from '@/store/api/homeDashboardApi';
import BillingScheduleRow from './BillingScheduleRow';

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
    <section className={ACCOUNTS_DETAILS_SECTION_CLASS}>
      <div className="border-b border-[#E6E8EE] pb-4">
        <Typography
          variant="h4"
          weight="semibold"
          className="text-[2rem] leading-none text-[#1E2533]"
        >
          Cash (In-Person)
        </Typography>
        <Typography variant="body" color="muted" className="mt-2 text-[#6B7280]">
          Pay in person at our office or depot.
        </Typography>
      </div>

      <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-[#4B5563]">
        <li>Payments are settled in person at the time of service or collection.</li>
        <li>All cash payments are recorded and confirmed by an administrator.</li>
      </ul>

      <BillingScheduleRow value={billingSchedule} />
    </section>
  );
}
