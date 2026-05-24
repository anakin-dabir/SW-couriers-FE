import { Calendar, CreditCard, Plus } from 'lucide-react';
import type { Client, HostedFields } from 'braintree-web';
import type { FormEvent, JSX } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState, useId } from 'react';
import { z } from 'zod';

import { Typography } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Checkbox } from '@/components/atoms/checkbox';
import { Input } from '@/components/atoms/input';
import { useFormValidation } from '@/hooks/useFormValidation';
import {
  BRAINTREE_3DS_VERIFICATION_AMOUNT_DEFAULT,
  createBraintreeClient,
  createHostedFields,
  deferForDialogFrame,
  getHostedFieldsPreflightError,
  hostedFieldContainerClass,
  newHostedFieldIds,
  splitCardholderName,
  verifyPaymentNonceWithEphemeralThreeDSecure,
} from '@/lib/braintree';
import type { ThreeDSecureVerifiedCard } from '@/lib/braintree/three-d-secure';
import { cn } from '@/lib/utils';
import {
  useLazyGetBraintreeClientTokenQuery,
  useSaveVaultedPaymentMethodMutation,
} from '@/store/api/paymentsApi';
import { getErrorMessage, isFetchBaseQueryError } from '@/store/api/utils';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';

const cardholderSchema = z.object({
  cardholderName: z.string().min(2, 'Enter the name as it appears on the card'),
});

type CardholderForm = z.infer<typeof cardholderSchema>;

function binFromHostedFieldsTokenDetails(details: unknown): string {
  if (details !== null && typeof details === 'object' && 'bin' in details) {
    const { bin } = details as { bin: unknown };
    if (typeof bin === 'string') {
      return bin.trim();
    }
  }
  return '';
}

function mapCardFormSetupError(error: unknown): string {
  const message = getErrorMessage(error);
  const lower = message.toLowerCase();
  if (
    lower === 'not found' ||
    lower.includes('not found') ||
    (isFetchBaseQueryError(error) && error.status === 404)
  ) {
    return 'We could not reach the payment service (not found). Check that the client-token API exists or try again later.';
  }
  return message;
}

export interface CardFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCardSaved?: (payload: { cardholderName: string }) => void;
}

function parseOrganizationIdFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length < 2) return null;
    const base64Url = tokenParts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payloadJson = window.atob(paddedBase64);
    const payload = JSON.parse(payloadJson) as { org_id?: string };
    return payload.org_id ?? null;
  } catch {
    return null;
  }
}

export function CardFormDialog({
  open,
  onOpenChange,
  onCardSaved,
}: CardFormDialogProps): JSX.Element {
  const organizationIdFromUser = useAppSelector(
    (state: RootState) => state.auth.user?.organization_id ?? null
  );
  const accessToken = useAppSelector((state: RootState) => state.auth.accessToken);
  const organizationId = useMemo(
    () => organizationIdFromUser ?? parseOrganizationIdFromToken(accessToken),
    [organizationIdFromUser, accessToken]
  );
  const cardholderNameId = useId();
  const setAsDefaultId = useId();
  const ids = useMemo(() => newHostedFieldIds(), []);
  const [fetchClientToken] = useLazyGetBraintreeClientTokenQuery();
  const [savePaymentMethod, { isLoading: isSaving }] = useSaveVaultedPaymentMethodMutation();

  const hfRef = useRef<HostedFields | null>(null);
  const clientRef = useRef<Client | null>(null);
  const [braintreeStatus, setBraintreeStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    'idle'
  );
  const [braintreeError, setBraintreeError] = useState<string | null>(null);
  const [isThreeDSBusy, setIsThreeDSBusy] = useState(false);
  const [setAsDefault, setSetAsDefault] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useFormValidation({
    schema: cardholderSchema,
    defaultValues: { cardholderName: '' },
  });

  useEffect(() => {
    if (open) {
      reset({ cardholderName: '' });
      setSetAsDefault(false);
    }
  }, [open, reset]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;
    let hfLocal: HostedFields | null = null;

    void (async () => {
      setBraintreeStatus('loading');
      setBraintreeError(null);
      try {
        if (!organizationId) {
          setBraintreeError('No organization is available. Sign in again or contact support.');
          setBraintreeStatus('error');
          return;
        }

        const tokenPayload = await fetchClientToken(organizationId).unwrap();
        if (cancelled) return;

        const clientInstance = await createBraintreeClient(tokenPayload.clientToken);
        if (cancelled) return;

        clientRef.current = clientInstance;

        await deferForDialogFrame();
        if (cancelled) return;

        const hf = await createHostedFields(clientInstance, ids);

        if (cancelled) {
          void hf.teardown();
          return;
        }

        hfLocal = hf;
        hfRef.current = hf;
        setBraintreeStatus('ready');
      } catch (e) {
        if (cancelled) return;
        setBraintreeError(mapCardFormSetupError(e));
        setBraintreeStatus('error');
      }
    })();

    return () => {
      cancelled = true;
      clientRef.current = null;
      if (hfLocal) void hfLocal.teardown();
      hfRef.current = null;
      setBraintreeStatus('idle');
      setBraintreeError(null);
      setSetAsDefault(false);
      reset();
    };
  }, [open, fetchClientToken, ids, reset, organizationId]);

  const submitCard = useCallback(
    async (data: CardholderForm) => {
      if (braintreeStatus !== 'ready') return;
      const hf = hfRef.current;
      if (!hf) return;

      setBraintreeError(null);

      const preflight = getHostedFieldsPreflightError(hf);
      if (preflight) {
        setBraintreeError(preflight);
        return;
      }

      try {
        const tokenPayload = await hf.tokenize();

        const clientInstance = clientRef.current;
        if (!clientInstance) {
          setBraintreeError('Payment form lost connection. Close this dialog and try again.');
          return;
        }

        const bin = binFromHostedFieldsTokenDetails(tokenPayload.details);
        if (bin.length < 6) {
          setBraintreeError('Could not read card details for verification. Try again.');
          return;
        }

        setIsThreeDSBusy(true);
        const { givenName, surname } = splitCardholderName(data.cardholderName.trim());
        const rawNonce = tokenPayload.nonce;
        if (typeof rawNonce !== 'string' || rawNonce.length === 0) {
          setBraintreeError('Could not tokenize the card. Try again.');
          return;
        }

        const verified: ThreeDSecureVerifiedCard =
          await verifyPaymentNonceWithEphemeralThreeDSecure(clientInstance, {
            nonce: rawNonce,
            bin,
            amount: BRAINTREE_3DS_VERIFICATION_AMOUNT_DEFAULT,
            billingAddress: { givenName, surname },
          });

        if (!organizationId) {
          setBraintreeError('No organization is available. Sign in again or contact support.');
          return;
        }

        await savePaymentMethod({
          organizationId,
          nonce: verified.nonce,
          cardholder_name: data.cardholderName.trim(),
          set_as_default: setAsDefault,
        }).unwrap();
        onCardSaved?.({ cardholderName: data.cardholderName.trim() });
        onOpenChange(false);
      } catch (e) {
        setBraintreeError(mapCardFormSetupError(e));
      } finally {
        setIsThreeDSBusy(false);
      }
    },
    [braintreeStatus, organizationId, savePaymentMethod, onOpenChange, onCardSaved, setAsDefault]
  );

  const onFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    void handleSubmit(submitCard)(event);
  };

  const disableSubmit = braintreeStatus !== 'ready' || isSaving || isThreeDSBusy;

  const handleDialogOpenChange = (next: boolean): void => {
    if (!next && isThreeDSBusy) {
      return;
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange} modal={!isThreeDSBusy}>
      <DialogContent
        className={cn(
          // Atoms dialog defaults to full-viewport on small screens; center a compact modal at all breakpoints (no changes to dialog.tsx).
          '!fixed !left-1/2 !top-1/2 !flex !h-auto !max-h-[min(90vh,720px)] !w-[calc(100vw-1.5rem)] !max-w-[28rem] !-translate-x-1/2 !-translate-y-1/2',
          'flex-col gap-0 overflow-hidden rounded-xl border-[#E3E5EC] bg-white p-0 shadow-xl sm:!max-w-[28rem]'
        )}
      >
        <DialogDescription className="sr-only">Add a new payment card</DialogDescription>
        <form onSubmit={onFormSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-2 pt-10">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="relative mb-5">
                <div
                  className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-[#F3F4F6]"
                  aria-hidden
                >
                  <CreditCard className="h-9 w-9 text-[#9CA3AF]" strokeWidth={1.75} />
                </div>
                <div
                  className="absolute -bottom-0.5 -right-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#3B82F6] text-white shadow-sm"
                  aria-hidden
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </div>
              </div>
              <DialogHeader className="space-y-0 sm:text-center">
                <DialogTitle className="font-inter text-2xl font-bold text-[#161B26]">
                  Add Card
                </DialogTitle>
              </DialogHeader>
            </div>

            <div
              className={cn(
                'mb-5 flex w-full justify-start',
                (isSaving || isThreeDSBusy) && 'pointer-events-none opacity-50'
              )}
            >
              <Checkbox
                id={setAsDefaultId}
                checked={setAsDefault}
                onChange={(e) => setSetAsDefault(e.target.checked)}
                label="Set as default card"
                className={
                  setAsDefault
                    ? '!border-red-600 !bg-red-600 hover:!bg-red-700 focus-visible:!ring-red-600/25'
                    : undefined
                }
              />
            </div>

            {(braintreeError || braintreeStatus === 'error') && braintreeError ? (
              <div
                className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5"
                role="alert"
              >
                <Typography variant="caption" color="error" className="font-inter !leading-relaxed">
                  {braintreeError}
                </Typography>
              </div>
            ) : null}

            {braintreeStatus === 'loading' ? (
              <Typography
                variant="caption"
                className="mb-4 font-inter text-form-subtitle !font-normal"
              >
                Preparing secure card fields…
              </Typography>
            ) : null}

            <div className="space-y-4">
              <div className="flex w-full flex-col gap-2">
                <Typography
                  variant="label"
                  htmlFor={cardholderNameId}
                  className="font-inter text-form-title !font-medium"
                >
                  Cardholder Name <span className="text-[#EF4444]">*</span>
                </Typography>
                <Input
                  id={cardholderNameId}
                  placeholder="Enter cardholder name"
                  autoComplete="cc-name"
                  aria-invalid={errors.cardholderName ? 'true' : 'false'}
                  aria-describedby={errors.cardholderName ? `${cardholderNameId}-error` : undefined}
                  className={
                    errors.cardholderName ? 'border-error focus-visible:border-error' : undefined
                  }
                  {...register('cardholderName')}
                />
                {errors.cardholderName && (
                  <Typography
                    id={`${cardholderNameId}-error`}
                    variant="caption"
                    color="error"
                    role="alert"
                    className="font-inter"
                  >
                    {errors.cardholderName.message}
                  </Typography>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-form-title font-inter">
                  Card Number <span className="text-[#EF4444]">*</span>
                </span>
                <div
                  id={ids.number}
                  className={hostedFieldContainerClass}
                  data-testid="hosted-field-number"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
                <div className="flex min-w-0 flex-col gap-2">
                  <span className="text-sm font-medium text-form-title font-inter">
                    Expiry Date <span className="text-[#EF4444]">*</span>
                  </span>
                  <div className="relative">
                    <div
                      id={ids.expiration}
                      className={`${hostedFieldContainerClass} pr-10`}
                      data-testid="hosted-field-expiration"
                    />
                    <div
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                      aria-hidden
                    >
                      <Calendar className="size-4 text-form-subtitle" />
                    </div>
                  </div>
                </div>
                <div className="flex min-w-0 flex-col gap-2">
                  <span className="text-sm font-medium text-form-title font-inter">
                    CVV <span className="text-[#EF4444]">*</span>
                  </span>
                  <div
                    id={ids.cvv}
                    className={hostedFieldContainerClass}
                    data-testid="hosted-field-cvv"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="w-full mt-4 shrink-0 border-t border-[#EEF0F5] px-8 py-6 !flex-row gap-3 !space-x-0 sm:!flex-row sm:!justify-stretch">
            <Button
              type="button"
              variant="secondary"
              className="min-w-0 flex-1 border-[#E5E7EB] bg-white text-form-title hover:bg-gray-50"
              onClick={() => onOpenChange(false)}
              disabled={isSaving || isThreeDSBusy}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              className="min-w-0 flex-1 px-8 text-white hover:bg-red-700 disabled:opacity-50"
              disabled={disableSubmit}
            >
              {isThreeDSBusy ? 'Verifying with your bank…' : isSaving ? 'Saving…' : 'Add Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
