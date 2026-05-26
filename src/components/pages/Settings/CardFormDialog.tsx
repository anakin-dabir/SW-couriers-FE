import { Calendar, CreditCard, Plus } from 'lucide-react';
import type { Client, HostedFields, HostedFieldsState } from 'braintree-web';
import type { FormEvent, JSX } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState, useId } from 'react';
import { z } from 'zod';

import { Typography } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/atoms/dialog';
import {
  PORTAL_MODAL_BODY,
  PORTAL_MODAL_CANCEL_BTN,
  PORTAL_MODAL_DESTRUCTIVE_BTN,
  PORTAL_MODAL_FOOTER,
  PORTAL_MODAL_FOOTER_ROW,
  PORTAL_MODAL_LABEL,
  PORTAL_MODAL_TITLE_SM,
  PORTAL_MODAL_WRAPPER,
} from '@/lib/modalStyles';
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
  const [hostedFieldErrors, setHostedFieldErrors] = useState<{
    number?: string;
    expirationDate?: string;
    cvv?: string;
  }>({});
  const [hostedFieldsValid, setHostedFieldsValid] = useState<{
    number: boolean;
    expirationDate: boolean;
    cvv: boolean;
  }>({ number: false, expirationDate: false, cvv: false });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid: isCardholderValid },
  } = useFormValidation({
    schema: cardholderSchema,
    defaultValues: { cardholderName: '' },
    mode: 'onChange',
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

        const FIELD_LABELS: Record<'number' | 'expirationDate' | 'cvv', string> = {
          number: 'card number',
          expirationDate: 'expiry date',
          cvv: 'cvv',
        };
        const computeFieldError = (
          key: 'number' | 'expirationDate' | 'cvv',
          state: HostedFieldsState
        ): string | undefined => {
          const field = state.fields[key];
          if (!field) return undefined;
          if (field.isEmpty)
            return `${FIELD_LABELS[key][0].toUpperCase()}${FIELD_LABELS[key].slice(1)} is required.`;
          if (!field.isValid) return `Enter a valid ${FIELD_LABELS[key]}.`;
          return undefined;
        };

        const syncFieldValidity = (state: HostedFieldsState): void => {
          const field = (k: 'number' | 'expirationDate' | 'cvv'): boolean =>
            Boolean(state.fields[k]?.isValid);
          setHostedFieldsValid({
            number: field('number'),
            expirationDate: field('expirationDate'),
            cvv: field('cvv'),
          });
        };

        hf.on('blur', (state) => {
          const key = state.emittedBy as 'number' | 'expirationDate' | 'cvv' | undefined;
          if (!key) return;
          setHostedFieldErrors((prev) => ({ ...prev, [key]: computeFieldError(key, state) }));
          syncFieldValidity(state);
        });

        hf.on('validityChange', (state) => {
          syncFieldValidity(state);
          const key = state.emittedBy as 'number' | 'expirationDate' | 'cvv' | undefined;
          if (!key) return;
          setHostedFieldErrors((prev) => {
            if (prev[key] === undefined) return prev;
            return { ...prev, [key]: computeFieldError(key, state) };
          });
        });
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
      setHostedFieldErrors({});
      setHostedFieldsValid({ number: false, expirationDate: false, cvv: false });
      reset();
    };
  }, [open, fetchClientToken, ids, reset, organizationId]);

  const submitCard = useCallback(
    async (data: CardholderForm) => {
      if (braintreeStatus !== 'ready') return;
      const hf = hfRef.current;
      if (!hf) return;

      setBraintreeError(null);

      const state = hf.getState();
      const FIELD_LABELS: Record<'number' | 'expirationDate' | 'cvv', string> = {
        number: 'card number',
        expirationDate: 'expiry date',
        cvv: 'cvv',
      };
      const nextErrors: { number?: string; expirationDate?: string; cvv?: string } = {};
      let firstInvalid: 'number' | 'expirationDate' | 'cvv' | null = null;
      (['number', 'expirationDate', 'cvv'] as const).forEach((key) => {
        const field = state.fields[key];
        if (!field) return;
        if (field.isEmpty) {
          nextErrors[key] =
            `${FIELD_LABELS[key][0].toUpperCase()}${FIELD_LABELS[key].slice(1)} is required.`;
          if (!firstInvalid) firstInvalid = key;
        } else if (!field.isValid) {
          nextErrors[key] = `Enter a valid ${FIELD_LABELS[key]}.`;
          if (!firstInvalid) firstInvalid = key;
        }
      });
      if (firstInvalid) {
        setHostedFieldErrors((prev) => ({ ...prev, ...nextErrors }));
        return;
      }

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

  const allHostedFieldsValid =
    hostedFieldsValid.number && hostedFieldsValid.expirationDate && hostedFieldsValid.cvv;
  const disableSubmit =
    braintreeStatus !== 'ready' ||
    isSaving ||
    isThreeDSBusy ||
    !isCardholderValid ||
    !allHostedFieldsValid;

  const handleDialogOpenChange = (next: boolean): void => {
    if (!next && isThreeDSBusy) {
      return;
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange} modal={!isThreeDSBusy}>
      <DialogContent className={PORTAL_MODAL_WRAPPER}>
        <DialogDescription className="sr-only">Add a new payment card</DialogDescription>
        <form onSubmit={onFormSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className={cn(PORTAL_MODAL_BODY, 'min-h-0 flex-1 overflow-y-auto')}>
            <div className="flex flex-col items-center">
              <div className="relative">
                <div
                  className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#F3F4F6]"
                  aria-hidden
                >
                  <CreditCard className="h-8 w-8 text-[#9CA3AF]" strokeWidth={1.75} />
                </div>
                <div
                  className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#3B82F6] text-white shadow-sm"
                  aria-hidden
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                </div>
              </div>
            </div>
            <DialogTitle className={PORTAL_MODAL_TITLE_SM}>Add Card</DialogTitle>

            <div className="mt-6 space-y-4">
              {(braintreeError || braintreeStatus === 'error') && braintreeError ? (
                <div
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5"
                  role="alert"
                >
                  <Typography variant="caption" color="error" className="!leading-relaxed">
                    {braintreeError}
                  </Typography>
                </div>
              ) : null}

              {braintreeStatus === 'loading' ? (
                <Typography variant="caption" className="text-form-subtitle !font-normal">
                  Preparing secure card fields…
                </Typography>
              ) : null}

              <div
                className={cn(
                  'flex w-full justify-start',
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

              <div className="flex w-full flex-col gap-1.5">
                <Typography
                  variant="label"
                  htmlFor={cardholderNameId}
                  className={PORTAL_MODAL_LABEL}
                >
                  Cardholder Name <span className="text-[#EF4444]">*</span>
                </Typography>
                <Input
                  id={cardholderNameId}
                  placeholder="Enter cardholder name"
                  autoComplete="cc-name"
                  aria-invalid={errors.cardholderName ? 'true' : 'false'}
                  aria-describedby={errors.cardholderName ? `${cardholderNameId}-error` : undefined}
                  className={cn(
                    'h-10 w-full rounded-md border border-[#E4E4E7] bg-white px-3 text-sm',
                    errors.cardholderName && 'border-error focus-visible:border-error'
                  )}
                  {...register('cardholderName')}
                />
                {errors.cardholderName && (
                  <Typography
                    id={`${cardholderNameId}-error`}
                    variant="caption"
                    color="error"
                    role="alert"
                    className="text-xs"
                  >
                    {errors.cardholderName.message}
                  </Typography>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Typography variant="label" className={PORTAL_MODAL_LABEL}>
                  Card Number <span className="text-[#EF4444]">*</span>
                </Typography>
                <div
                  id={ids.number}
                  className={cn(
                    hostedFieldContainerClass,
                    hostedFieldErrors.number && 'border-error'
                  )}
                  data-testid="hosted-field-number"
                />
                {hostedFieldErrors.number ? (
                  <Typography variant="caption" color="error" role="alert" className="text-xs">
                    {hostedFieldErrors.number}
                  </Typography>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <Typography variant="label" className={PORTAL_MODAL_LABEL}>
                    Expiry Date <span className="text-[#EF4444]">*</span>
                  </Typography>
                  <div className="relative">
                    <div
                      id={ids.expiration}
                      className={cn(
                        hostedFieldContainerClass,
                        'pr-10',
                        hostedFieldErrors.expirationDate && 'border-error'
                      )}
                      data-testid="hosted-field-expiration"
                    />
                    <div
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                      aria-hidden
                    >
                      <Calendar className="size-4 text-form-subtitle" />
                    </div>
                  </div>
                  {hostedFieldErrors.expirationDate ? (
                    <Typography variant="caption" color="error" role="alert" className="text-xs">
                      {hostedFieldErrors.expirationDate}
                    </Typography>
                  ) : null}
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <Typography variant="label" className={PORTAL_MODAL_LABEL}>
                    CVV <span className="text-[#EF4444]">*</span>
                  </Typography>
                  <div
                    id={ids.cvv}
                    className={cn(
                      hostedFieldContainerClass,
                      hostedFieldErrors.cvv && 'border-error'
                    )}
                    data-testid="hosted-field-cvv"
                  />
                  {hostedFieldErrors.cvv ? (
                    <Typography variant="caption" color="error" role="alert" className="text-xs">
                      {hostedFieldErrors.cvv}
                    </Typography>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className={PORTAL_MODAL_FOOTER}>
            <div className={PORTAL_MODAL_FOOTER_ROW}>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving || isThreeDSBusy}
                className={PORTAL_MODAL_CANCEL_BTN}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={disableSubmit}
                className={PORTAL_MODAL_DESTRUCTIVE_BTN}
              >
                {isThreeDSBusy ? 'Verifying with your bank…' : isSaving ? 'Saving…' : 'Add Card'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
