import { skipToken } from '@reduxjs/toolkit/query';
import Typography from '@/components/atoms/Typography';
import {
  BankTransferSection,
  CardPaymentSection,
  CashInPersonSection,
  CreditAccountSection,
  DefaultPaymentMethodSection,
} from '@/components/pages/Settings/accountsDetails';
import { useOrganizationId } from '@/lib/organizationContext';
import { useGetOrganizationPaymentDetailsQuery } from '@/store/api/homeDashboardApi';
import { getErrorMessage } from '@/store/api/utils';

export default function AccountsDetailsPage(): React.JSX.Element {
  const organizationId = useOrganizationId();

  const {
    data: paymentDetailsRes,
    isLoading: paymentDetailsLoading,
    isError: paymentDetailsError,
    error: paymentDetailsErr,
    refetch: refetchPaymentDetails,
  } = useGetOrganizationPaymentDetailsQuery(organizationId ? { organizationId } : skipToken);

  const paymentDetails = paymentDetailsRes?.data;
  const orgPaymentMethods = paymentDetails?.payment_methods;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      {paymentDetailsLoading ? (
        <Typography variant="body" color="muted" className="py-4 text-center">
          Loading payment settings…
        </Typography>
      ) : paymentDetailsError ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-6">
          <Typography variant="body" className="text-center text-red-700">
            {getErrorMessage(paymentDetailsErr)}
          </Typography>
          <button
            type="button"
            className="text-sm font-medium text-red-800 underline"
            onClick={() => void refetchPaymentDetails()}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <DefaultPaymentMethodSection paymentMethods={orgPaymentMethods} />
          <CardPaymentSection
            organizationId={organizationId}
            orgPaymentMethods={orgPaymentMethods}
          />
          <BankTransferSection orgPaymentMethods={orgPaymentMethods} />
          <CreditAccountSection
            paymentDetails={paymentDetails}
            orgPaymentMethods={orgPaymentMethods}
          />
          <CashInPersonSection orgPaymentMethods={orgPaymentMethods} />
        </>
      )}
    </div>
  );
}
