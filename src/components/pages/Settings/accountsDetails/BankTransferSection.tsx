import {
  formatBillingScheduleLabel,
  indexPaymentMethodsByModel,
  SW_COURIERS_BANK_DETAILS,
} from '@/lib/paymentSettings';
import { PAYMENT_MUTED_PANEL_CLASS, PAYMENT_SECTION_TITLE_CLASS } from '@/lib/paymentSettingsUi';
import { SETTINGS_FORM_CARD_CLASS } from '@/lib/settingsUi';
import type { OrganizationPaymentMethodDto } from '@/store/api/homeDashboardApi';
import Typography from '@/components/atoms/Typography';
import BillingScheduleRow from './BillingScheduleRow';
import PaymentReadOnlyField from './PaymentReadOnlyField';
import PaymentSectionHeader from './PaymentSectionHeader';

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
    <section className={SETTINGS_FORM_CARD_CLASS}>
      <PaymentSectionHeader
        title="Bank Transfer"
        description="Pay via bank transfer using the details below."
      />

      <div className={`mt-5 ${PAYMENT_MUTED_PANEL_CLASS}`}>
        <Typography className={PAYMENT_SECTION_TITLE_CLASS}>
          SW Couriers&apos; Bank Details
        </Typography>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <PaymentReadOnlyField label="Account Name" value={SW_COURIERS_BANK_DETAILS.accountName} />
          <PaymentReadOnlyField
            label="Bank Account Number"
            value={SW_COURIERS_BANK_DETAILS.accountNumber}
          />
          <PaymentReadOnlyField label="Sort code" value={SW_COURIERS_BANK_DETAILS.sortCode} />
        </div>
      </div>

      <div className="mt-5">
        <BillingScheduleRow value={billingSchedule} />
      </div>
    </section>
  );
}
