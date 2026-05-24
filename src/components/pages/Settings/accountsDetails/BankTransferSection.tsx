import Typography from '@/components/atoms/Typography';
import {
  ACCOUNTS_DETAILS_SECTION_CLASS,
  formatBillingScheduleLabel,
  indexPaymentMethodsByModel,
  SW_COURIERS_BANK_DETAILS,
} from '@/lib/paymentSettings';
import type { OrganizationPaymentMethodDto } from '@/store/api/homeDashboardApi';
import BillingScheduleRow from './BillingScheduleRow';

interface BankTransferSectionProps {
  orgPaymentMethods: OrganizationPaymentMethodDto[] | undefined;
}

export default function BankTransferSection({
  orgPaymentMethods,
}: BankTransferSectionProps): React.JSX.Element {
  const bankMethod = indexPaymentMethodsByModel(orgPaymentMethods).bank_transfer;
  const billingSchedule = formatBillingScheduleLabel(
    bankMethod?.billing_schedule,
    bankMethod?.billing_day_of_month,
    bankMethod?.billing_days_after_order
  );

  return (
    <section className={ACCOUNTS_DETAILS_SECTION_CLASS}>
      <div className="border-b border-[#E6E8EE] pb-4">
        <Typography
          variant="h4"
          weight="semibold"
          className="text-[2rem] leading-none text-[#1E2533]"
        >
          Bank Transfer
        </Typography>
        <Typography variant="body" color="muted" className="mt-2 text-[#6B7280]">
          Pay via bank transfer using the details below.
        </Typography>
      </div>

      <div className="rounded-xl border border-[#E2E6EE] bg-[#F7F8FB] p-4">
        <Typography variant="body" weight="semibold" className="mb-4 text-base text-[#1F2937]">
          SW Couriers&apos; Bank Details
        </Typography>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ReadOnlyField label="Account Name" value={SW_COURIERS_BANK_DETAILS.accountName} />
          <ReadOnlyField
            label="Bank Account Number"
            value={SW_COURIERS_BANK_DETAILS.accountNumber}
          />
          <ReadOnlyField label="Sort code" value={SW_COURIERS_BANK_DETAILS.sortCode} />
        </div>
      </div>

      <BillingScheduleRow value={billingSchedule} />
    </section>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      <Typography variant="caption" className="text-xs font-medium text-[#6B7280]">
        {label}
      </Typography>
      <div className="rounded-md border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#18181B]">
        {value}
      </div>
    </div>
  );
}
