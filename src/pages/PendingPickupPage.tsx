import type React from 'react';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { notifyApiError, notifyApiSuccess } from '@/lib/notify';
import { useFormValidation } from '@/hooks/useFormValidation';
import PickupRquestSteps from '@/components/molecules/PickupRquestSteps';
import PageHeader from '@/components/atoms/PageHeader';
import MarkerMap from '@/components/organisms/maps/MarkerMap';
import PickupFormFooter from '@/components/molecules/PickupFormFooter';
import Typography from '@/components/atoms/Typography';
import { DeliveryPackageIconPending } from '@/assets/img';
import {
  PickupDetailForm,
  PickupAddressForm,
  PackageDeliveryStep,
  ReviewSubmitStep,
  PaymentMethodStep,
} from '@/components/pages/PickupRequest';
import {
  PICKUP_DETAIL_FORM_SUBTITLE,
  PICKUP_DETAIL_FORM_TITLE,
  PICKUP_FORM_FOOTER_NEXT_LABEL,
  PICKUP_FORM_FOOTER_SAVE_CONTINUE_LABEL,
  PICKUP_REQUEST_STEP_LABELS,
} from '@/lib/data';
import type { PackageDeliveryFormData } from '@/schemas/pickup.schema';
import { cn } from '@/lib/utils';
import { pickupRequestSchema, type PickupRequestFormData } from '@/schemas/pickup.schema';
import { Button } from '@/components/atoms/Button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/atoms/separator';
import {
  useCreateOrderDraftMutation,
  useCreateOrderMutation,
  useGetEffectiveServiceTiersForOrgQuery,
  useGetOrderDraftByIdQuery,
  useSubmitOrderDraftMutation,
  useUpdateOrderDraftMutation,
} from '@/store/api';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import {
  buildCreateOrderPayload,
  buildOrderDraftPayload,
  buildPackageDeliveryDataFromDraftStops,
  buildPickupConfirmationData,
  extractOrderId,
  extractOrderUuid,
  savePickupConfirmation,
  type PickupPaymentSelection,
} from '@/lib/pickupOrderFlow';
import { resolvePickupAddressId } from '@/lib/pickupAddressForm';
import { useGetOrganizationByIdQuery } from '@/store/api';

const DEFAULT_PICKUP_VALUES: PickupRequestFormData = {
  contactName: '',
  phone: '',
  email: '',
  companyName: 'SM Logistics',
  reference: '',
  specialInstructions: '',
  pickupAddress: {
    pickupInfo: '',
    postalCode: '',
    personFirstName: '',
    personSecondName: '',
    state: '',
    addressLine: '',
    addressLine2: '',
    country: 'GB',
    city: '',
  },
  // Omit deliveryAddress so step 1 validation only checks contact + pickup (deliveryAddress is optional)
  deliveryAddress: undefined,
};

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function isPackageDeliveryData(value: unknown): value is PackageDeliveryFormData {
  return Boolean(
    value &&
    typeof value === 'object' &&
    Array.isArray((value as { deliveryItems?: unknown[] }).deliveryItems)
  );
}

function formatRoleLabel(role?: string | null): string | undefined {
  const trimmed = role?.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/[\s-]+/g, '_').toUpperCase();
}

export default function PendingPickupPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftIdFromUrl = searchParams.get('draftId');
  const normalizedDraftId = draftIdFromUrl?.trim() ? draftIdFromUrl.trim() : null;
  const currentUser = useAppSelector((state: RootState) => state.auth.user);
  const organizationId = currentUser?.organization_id ?? null;
  const contactUserId = currentUser?.id ?? null;
  const currentUserName = currentUser?.name?.trim() ?? '';
  const currentUserEmail = currentUser?.email ?? '';
  const currentUserPhone = currentUser?.phone?.trim() ?? '';
  const currentUserRoleLabel = formatRoleLabel(currentUser?.contact_role);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [packageDeliveryData, setPackageDeliveryData] = useState<PackageDeliveryFormData | null>(
    null
  );
  const [activeDraftId, setActiveDraftId] = useState<string | null>(normalizedDraftId);
  const hydratedDraftRef = useRef<string | null>(null);
  const [createOrderDraft, { isLoading: isCreatingDraft }] = useCreateOrderDraftMutation();
  const [updateOrderDraft, { isLoading: isUpdatingDraft }] = useUpdateOrderDraftMutation();
  const [submitOrderDraft, { isLoading: isSubmittingDraft }] = useSubmitOrderDraftMutation();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [isFinalizingOrder, setIsFinalizingOrder] = useState(false);
  /**
   * Latest price-breakdown grand total surfaced by the payment step. Persisted on the
   * draft when saving from Step 4 so the drafts-list API can return the order value.
   */
  const [paymentBreakdownTotal, setPaymentBreakdownTotal] = useState<number | undefined>(undefined);
  /** Pre-selection ids carried over from a draft so Step 4 can restore the user's choice. */
  const [draftPaymentMethodId, setDraftPaymentMethodId] = useState<string | undefined>(undefined);
  const [draftCreditCardId, setDraftCreditCardId] = useState<string | undefined>(undefined);
  const { data: orgResponse } = useGetOrganizationByIdQuery(
    { organizationId: organizationId ?? '' },
    { skip: !organizationId }
  );
  // Tiers are needed to send `service_tier_name` alongside `service_tier_id` in every
  // create-order / draft / price-breakdown request. Resolver is stable wrt the tier list.
  const { data: tiersResponse } = useGetEffectiveServiceTiersForOrgQuery(organizationId ?? '', {
    skip: !organizationId,
  });
  const resolveTierName = useCallback(
    (tierId: string): string | undefined => {
      const list = tiersResponse?.data?.items ?? [];
      return list.find((t) => t.id === tierId)?.tier_name;
    },
    [tiersResponse]
  );
  const {
    data: draftDetailResponse,
    isFetching: isDraftLoading,
    isError: isDraftLoadError,
  } = useGetOrderDraftByIdQuery(
    {
      draft_id: activeDraftId ?? '',
      organization_id: organizationId ?? undefined,
    },
    {
      skip: !activeDraftId || !organizationId,
    }
  );

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useFormValidation({
    schema: pickupRequestSchema,
    defaultValues: DEFAULT_PICKUP_VALUES,
  });

  const companyName =
    orgResponse?.data?.trading_name?.trim() ||
    orgResponse?.data?.legal_entity_name?.trim() ||
    DEFAULT_PICKUP_VALUES.companyName;

  const draftContactUser = draftDetailResponse?.data?.contact_user ?? null;
  const draftPayloadContactUserId = readString(
    asObject(draftDetailResponse?.data?.payload).contact_user_id
  );
  const draftContactUserId = draftContactUser?.id ?? draftPayloadContactUserId ?? '';
  const isDifferentContactUser = Boolean(
    draftContactUserId && contactUserId && draftContactUserId !== contactUserId
  );
  const effectiveContactUserId = isDifferentContactUser
    ? draftContactUserId
    : (contactUserId ?? '');
  const draftContactName = isDifferentContactUser
    ? `${draftContactUser?.first_name ?? ''} ${draftContactUser?.last_name ?? ''}`.trim()
    : '';
  const draftContactEmail = isDifferentContactUser ? (draftContactUser?.email ?? '').trim() : '';
  const draftContactPhone = isDifferentContactUser ? (draftContactUser?.phone ?? '').trim() : '';
  const draftContactRoleLabel = isDifferentContactUser
    ? formatRoleLabel(draftContactUser?.contact_role)
    : undefined;
  const displayContactName = isDifferentContactUser ? draftContactName : currentUserName;
  const displayContactEmail = isDifferentContactUser ? draftContactEmail : currentUserEmail;
  const displayContactPhone = isDifferentContactUser ? draftContactPhone : currentUserPhone;
  const displayContactRoleLabel = isDifferentContactUser
    ? draftContactRoleLabel
    : currentUserRoleLabel;

  useEffect(() => {
    const opts = { shouldDirty: false, shouldTouch: false, shouldValidate: false };
    setValue('contactName', displayContactName, opts);
    setValue('email', displayContactEmail, opts);
    setValue('phone', displayContactPhone, opts);
    setValue('companyName', companyName, opts);
  }, [companyName, displayContactEmail, displayContactName, displayContactPhone, setValue]);

  const onSubmitStep1 = useCallback((data: PickupRequestFormData): void => {
    console.log('Step 1 submitted:', data);
    setCurrentStep(2);
  }, []);

  useEffect(() => {
    setActiveDraftId(normalizedDraftId);
  }, [normalizedDraftId]);

  useEffect(() => {
    if (!draftDetailResponse?.data || !activeDraftId) return;
    if (hydratedDraftRef.current === activeDraftId) return;

    const payload = asObject(draftDetailResponse.data.payload);
    const pickupDetails = asObject(payload.pickup_details);
    const pickupAddress = asObject(payload.pickup_address);
    const packageDeliverySnapshot = payload.package_delivery_data;
    const pickupAddressId =
      readString(payload.pickup_address_id) || readString(pickupAddress.pickup_info);

    reset({
      ...DEFAULT_PICKUP_VALUES,
      contactName: displayContactName || readString(pickupDetails.contact_name),
      phone: displayContactPhone || readString(pickupDetails.phone),
      email: displayContactEmail || readString(pickupDetails.email),
      companyName: companyName || readString(pickupDetails.company_name),
      reference: readString(pickupDetails.reference),
      specialInstructions: readString(pickupDetails.special_instructions),
      pickupAddress: {
        pickupInfo: pickupAddressId,
        postalCode: readString(pickupAddress.postcode),
        personFirstName: readString(pickupAddress.person_first_name),
        personSecondName: readString(pickupAddress.person_second_name),
        state: readString(pickupAddress.state),
        addressLine: readString(pickupAddress.line_1),
        addressLine2: readString(pickupAddress.line_2),
        country: readString(pickupAddress.country) || 'GB',
        city: readString(pickupAddress.city),
      },
    });

    if (isPackageDeliveryData(packageDeliverySnapshot)) {
      setPackageDeliveryData(packageDeliverySnapshot);
    } else {
      // The BE drops `package_delivery_data` (extra="ignore" on OrderDraftPayload), so
      // for drafts created elsewhere we reconstruct Step 2's form straight from the
      // canonical `delivery_stops` array the server persisted.
      setPackageDeliveryData(buildPackageDeliveryDataFromDraftStops(payload.delivery_stops));
    }

    // Carry the draft's payment selections through to Step 4 — the step will match the
    // ids against `org_payment_methods` / saved cards once those queries resolve.
    setDraftPaymentMethodId(readString(payload.payment_method_id) || undefined);
    setDraftCreditCardId(readString(payload.credit_card_id) || undefined);
    // total_amount comes back as a string-encoded decimal from the BE; coerce so the
    // payment step can compare it against the live breakdown.
    const rawTotal = draftDetailResponse.data.total_amount;
    const parsedTotal =
      typeof rawTotal === 'number'
        ? rawTotal
        : typeof rawTotal === 'string'
          ? Number(rawTotal)
          : NaN;
    setPaymentBreakdownTotal(Number.isFinite(parsedTotal) ? parsedTotal : undefined);

    hydratedDraftRef.current = activeDraftId;
  }, [
    activeDraftId,
    companyName,
    displayContactEmail,
    displayContactName,
    displayContactPhone,
    draftDetailResponse,
    reset,
  ]);

  useEffect(() => {
    if (!isDraftLoadError || !activeDraftId) return;
    toast.error(`Unable to load draft ${activeDraftId}.`);
  }, [activeDraftId, isDraftLoadError]);

  const handleCancel = useCallback((): void => {
    void navigate(activeDraftId ? '/orders/drafts' : '/orders/list');
  }, [navigate, activeDraftId]);

  const handleSaveDraft = useCallback((): void => {
    void (async () => {
      if (!organizationId) {
        toast.error('Organization context is missing. Could not save draft.');
        return;
      }
      try {
        const requestorData = watch();
        if (!resolvePickupAddressId(requestorData.pickupAddress)) {
          toast.error(
            'Select a valid saved pickup address from your organization profile before saving.'
          );
          return;
        }
        const payload = buildOrderDraftPayload(
          requestorData,
          packageDeliveryData,
          organizationId,
          effectiveContactUserId,
          resolveTierName,
          paymentBreakdownTotal
        );
        if (activeDraftId) {
          const result = await updateOrderDraft({
            draft_id: activeDraftId,
            organization_id: organizationId,
            body: payload,
          }).unwrap();
          notifyApiSuccess(result, { message: `Draft ${activeDraftId} updated.` });
        } else {
          const response = await createOrderDraft({
            organization_id: organizationId,
            body: payload,
          }).unwrap();
          const nextDraftId = response?.data?.id ?? null;
          notifyApiSuccess(response, {
            message: nextDraftId ? `Draft ${nextDraftId} saved.` : 'Draft saved.',
          });
        }
        void navigate('/orders/drafts');
      } catch (error) {
        notifyApiError(error);
      }
    })();
  }, [
    organizationId,
    watch,
    packageDeliveryData,
    effectiveContactUserId,
    activeDraftId,
    updateOrderDraft,
    createOrderDraft,
    navigate,
    resolveTierName,
    paymentBreakdownTotal,
  ]);

  const handlePackageNext = useCallback((data: PackageDeliveryFormData): void => {
    setPackageDeliveryData(data);
    setCurrentStep(3);
  }, []);

  const handlePackageCancel = useCallback((): void => {
    setCurrentStep(1);
  }, []);

  const handlePaymentCancel = useCallback((): void => {
    setCurrentStep(3);
  }, []);

  const handlePaymentConfirm = useCallback(
    (paymentSelection: PickupPaymentSelection): void => {
      void (async () => {
        if (!organizationId || !contactUserId) {
          toast.error('Organization or user context is missing. Please sign in again.');
          return;
        }
        const requestorData = watch();
        if (!resolvePickupAddressId(requestorData.pickupAddress)) {
          toast.error(
            'Select a valid saved pickup address from your organization profile before submitting.'
          );
          return;
        }
        if (!packageDeliveryData || packageDeliveryData.deliveryItems.length === 0) {
          toast.error('Add at least one delivery stop before submitting the order.');
          return;
        }

        const createOrderPayload = buildCreateOrderPayload({
          requestorData,
          packageDeliveryData,
          organizationId,
          contactUserId: effectiveContactUserId,
          payment: paymentSelection,
          resolveTierName,
        });

        setIsFinalizingOrder(true);
        try {
          let orderApiResponse: unknown = null;
          let workingDraftId = activeDraftId;

          if (!workingDraftId) {
            const draftResponse = await createOrderDraft({
              organization_id: organizationId,
              body: buildOrderDraftPayload(
                requestorData,
                packageDeliveryData,
                organizationId,
                effectiveContactUserId,
                resolveTierName,
                paymentBreakdownTotal
              ),
            }).unwrap();
            workingDraftId = draftResponse?.data?.id ?? null;
            if (workingDraftId) {
              setActiveDraftId(workingDraftId);
            }
          }

          if (workingDraftId) {
            await updateOrderDraft({
              draft_id: workingDraftId,
              organization_id: organizationId,
              body: buildOrderDraftPayload(
                requestorData,
                packageDeliveryData,
                organizationId,
                effectiveContactUserId,
                resolveTierName,
                paymentBreakdownTotal
              ),
            }).unwrap();
            orderApiResponse = await submitOrderDraft({
              draft_id: workingDraftId,
              organization_id: organizationId,
              body: createOrderPayload,
            }).unwrap();
          } else {
            orderApiResponse = await createOrder(createOrderPayload).unwrap();
          }

          let orderId = extractOrderId(orderApiResponse);
          let orderUuid = extractOrderUuid(orderApiResponse);
          if (!orderId) {
            const fallbackCreateResponse = await createOrder(createOrderPayload).unwrap();
            orderId = extractOrderId(fallbackCreateResponse);
            orderUuid = orderUuid ?? extractOrderUuid(fallbackCreateResponse);
          }
          if (!orderId) {
            orderId = `ORD-${Date.now()}`;
          }

          const confirmation = buildPickupConfirmationData({
            orderId,
            requestorData,
            packageDeliveryData,
          });
          savePickupConfirmation(orderId, confirmation);
          notifyApiSuccess(orderApiResponse, { message: 'Order created successfully.' });
          void navigate('/deliveries/pending/confirmation', {
            state: {
              orderId: orderUuid ?? orderId,
              orderReference: orderId,
              confirmation,
            },
          });
        } catch (error) {
          notifyApiError(error);
        } finally {
          setIsFinalizingOrder(false);
        }
      })();
    },
    [
      organizationId,
      contactUserId,
      effectiveContactUserId,
      watch,
      packageDeliveryData,
      activeDraftId,
      createOrderDraft,
      updateOrderDraft,
      submitOrderDraft,
      createOrder,
      navigate,
      resolveTierName,
      paymentBreakdownTotal,
    ]
  );

  const handleReviewContinue = useCallback((): void => {
    setCurrentStep(4);
  }, []);

  const isSavingDraft = isCreatingDraft || isUpdatingDraft;
  const isBusy =
    isSavingDraft || isSubmittingDraft || isCreatingOrder || isFinalizingOrder || isDraftLoading;

  const STEP_ITEMS = useMemo(() => {
    return PICKUP_REQUEST_STEP_LABELS.map((step, index) => {
      const stepNumber = (index + 1) as 1 | 2 | 3 | 4;
      const status = stepNumber <= currentStep;
      return { ...step, status, stepNumber };
    });
  }, [currentStep]);

  return (
    <div className={cn('flex flex-col gap-4 flex-1 min-h-0 overflow-hidden')}>
      <div>
        <Button variant="ghost" size="sm" onClick={() => void navigate(-1)}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </div>
      <div className="shrink-0">
        <PageHeader
          title="New Pickup Request"
          className=""
          Icon={<img src={DeliveryPackageIconPending} alt="pending-pickup" className="size-11" />}
          actions={
            <div className="flex items-center gap-2.5 w-[48vw] min-w-0">
              {STEP_ITEMS.map((step, index) => (
                <PickupRquestSteps key={index} status={step.status} label={step.label} />
              ))}
            </div>
          }
        />
      </div>
      <div className={cn('flex gap-4 lg:gap-6 flex-1 min-h-0 overflow-hidden')}>
        <div
          className={cn(
            'flex flex-col gap-6 pb-6 min-w-0 flex-1 min-h-0 overflow-y-auto',
            'lg:pb-0'
          )}
        >
          {currentStep === 1 && (
            <form
              onSubmit={(e) => void handleSubmit(onSubmitStep1)(e)}
              noValidate
              aria-label="Pickup request form"
              className="flex w-full flex-col rounded-[10px] border border-form-border-light bg-white px-5 pb-6 pt-5 shadow-sm"
            >
              <div className="flex w-full flex-col gap-[30px]">
                <header className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-2">
                    <Typography variant="h4" weight="semibold" className="text-xl text-form-title">
                      {PICKUP_DETAIL_FORM_TITLE}
                    </Typography>
                    <Typography
                      variant="caption"
                      className="text-sm font-normal leading-5 text-muted-foreground"
                    >
                      {PICKUP_DETAIL_FORM_SUBTITLE}
                    </Typography>
                  </div>
                  <Separator />
                </header>

                <PickupDetailForm
                  register={register}
                  control={control}
                  errors={errors}
                  contactRoleLabel={displayContactRoleLabel}
                  disabled={isSubmitting}
                />

                <PickupAddressForm
                  register={register}
                  control={control}
                  errors={errors}
                  setValue={setValue}
                  watch={watch}
                  disabled={isSubmitting}
                />

                <PickupFormFooter
                  onCancel={handleCancel}
                  onSaveDraft={handleSaveDraft}
                  onNext={() => void handleSubmit(onSubmitStep1)()}
                  isSubmitting={isSubmitting || isBusy}
                  nextLabel={PICKUP_FORM_FOOTER_SAVE_CONTINUE_LABEL}
                  nextIcon={<ArrowRight className="size-4 shrink-0" aria-hidden />}
                />
              </div>
            </form>
          )}

          {currentStep === 2 && (
            <PackageDeliveryStep
              initialData={packageDeliveryData}
              onNext={handlePackageNext}
              onBack={() => setCurrentStep(1)}
              onCancel={handlePackageCancel}
              onSaveDraft={handleSaveDraft}
            />
          )}

          {currentStep === 3 && (
            <ReviewSubmitStep
              requestorData={watch()}
              packageDeliveryData={packageDeliveryData}
              onEditStep={setCurrentStep}
              onCancel={handleCancel}
              onSaveDraft={handleSaveDraft}
              onSubmit={handleReviewContinue}
              onBack={() => setCurrentStep(2)}
              footerNextLabel={PICKUP_FORM_FOOTER_NEXT_LABEL}
              isSubmitting={isBusy}
            />
          )}

          {currentStep === 4 && (
            <PaymentMethodStep
              paymentMode="immediate"
              packageDeliveryData={packageDeliveryData}
              onCancel={handlePaymentCancel}
              onSaveDraft={handleSaveDraft}
              onConfirmPay={handlePaymentConfirm}
              onBack={() => setCurrentStep(3)}
              isSubmitting={isBusy}
              onBreakdownTotalChange={setPaymentBreakdownTotal}
              initialPaymentMethodId={draftPaymentMethodId}
              initialCreditCardId={draftCreditCardId}
            />
          )}
        </div>

        <div className={cn('hidden lg:flex flex-1 min-w-0 min-h-0 rounded-lg overflow-hidden')}>
          <MarkerMap
            activeLocations={[]}
            inactiveLocations={[]}
            className="w-full h-full rounded-lg overflow-hidden"
          />
        </div>
      </div>
    </div>
  );
}
