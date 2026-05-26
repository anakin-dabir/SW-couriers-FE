import { CreditCard } from 'lucide-react';
import Typography from '@/components/atoms/Typography';
import {
  listConfiguredPaymentModels,
  paymentModelLabel,
  resolveDefaultPaymentModel,
  type PaymentModelKind,
} from '@/lib/paymentSettings';
import { portalFieldInputClass, portalFieldLabelClass } from '@/lib/portalTheme';
import { SETTINGS_FORM_CARD_CLASS } from '@/lib/settingsUi';
import type { OrganizationPaymentMethodDto } from '@/store/api/homeDashboardApi';
import { cn } from '@/lib/utils';
import PaymentSectionHeader from './PaymentSectionHeader';

interface DefaultPaymentMethodSectionProps {
  paymentMethods: OrganizationPaymentMethodDto[] | undefined;
}

export default function DefaultPaymentMethodSection({
  paymentMethods,
}: DefaultPaymentMethodSectionProps): React.JSX.Element {
  const options = listConfiguredPaymentModels(paymentMethods);
  const defaultKind = resolveDefaultPaymentModel(paymentMethods);

  return (
    <section className={SETTINGS_FORM_CARD_CLASS}>
      <PaymentSectionHeader
        title="Default Payment Method"
        description="This payment method will be used by default for all orders and invoices."
      />

      <div className="mt-5 flex flex-col gap-2">
        <Typography className={portalFieldLabelClass}>Payment Method</Typography>
        <div className="relative">
          <CreditCard
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#A1A1AA]"
            aria-hidden
          />
          <select
            className={cn(
              portalFieldInputClass(),
              'w-full appearance-none py-2 pl-10 pr-10 focus-visible:border-[#C63131] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C63131]/15'
            )}
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
        <Typography variant="caption" className="text-xs text-[#71717A]">
          Contact your account manager to change the organisation default payment method.
        </Typography>
      </div>
    </section>
  );
}
