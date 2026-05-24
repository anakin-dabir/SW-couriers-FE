import { CreditCard } from 'lucide-react';
import Typography from '@/components/atoms/Typography';
import {
  ACCOUNTS_DETAILS_SECTION_CLASS,
  listConfiguredPaymentModels,
  paymentModelLabel,
  resolveDefaultPaymentModel,
  type PaymentModelKind,
} from '@/lib/paymentSettings';
import type { OrganizationPaymentMethodDto } from '@/store/api/homeDashboardApi';

interface DefaultPaymentMethodSectionProps {
  paymentMethods: OrganizationPaymentMethodDto[] | undefined;
}

export default function DefaultPaymentMethodSection({
  paymentMethods,
}: DefaultPaymentMethodSectionProps): React.JSX.Element {
  const options = listConfiguredPaymentModels(paymentMethods);
  const defaultKind = resolveDefaultPaymentModel(paymentMethods);

  return (
    <section className={ACCOUNTS_DETAILS_SECTION_CLASS}>
      <div className="border-b border-[#E6E8EE] pb-4">
        <Typography
          variant="h4"
          weight="semibold"
          className="text-[2rem] leading-none text-[#1E2533]"
        >
          Default Payment Method
        </Typography>
        <Typography variant="body" color="muted" className="mt-2 text-[#6B7280]">
          This payment method will be used by default for all orders and invoices.
        </Typography>
      </div>

      <div className="flex flex-col gap-2">
        <Typography variant="label" className="text-sm font-medium text-[#374151]">
          Payment Method
        </Typography>
        <div className="relative">
          <CreditCard
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]"
            aria-hidden
          />
          <select
            className="h-11 w-full appearance-none rounded-md border border-[#D1D5DB] bg-white py-2 pl-10 pr-10 text-sm text-[#18181B] focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            value={defaultKind}
            disabled
            aria-label="Default payment method"
          >
            {options.map((kind: PaymentModelKind) => (
              <option key={kind} value={kind}>
                {paymentModelLabel(kind)}
              </option>
            ))}
          </select>
        </div>
        <Typography variant="caption" className="text-xs text-[#9CA3AF]">
          Contact your account manager to change the organisation default payment method.
        </Typography>
      </div>
    </section>
  );
}
