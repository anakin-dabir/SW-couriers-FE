import { skipToken } from '@reduxjs/toolkit/query';
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'sonner';
import AddressMapPickerWithCenter from '@/components/pages/Settings/CompanyDetails/AddressMapPickerWithCenter';
import {
  mergeAddress,
  resolveCity,
  resolveRegion,
} from '@/components/pages/Settings/CompanyDetails/addressUtils';
import {
  resolveEffectiveTradingAddress,
  resolveEffectiveTradingCoordinates,
} from '@/components/pages/Settings/CompanyDetails/effectiveAddress';
import { Card, CardContent } from '@/components/molecules/card';
import { Typography } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';
import {
  EMPTY_ADDRESS,
  GeneralInfoSection,
  INITIAL_GENERAL_SETTINGS,
  LogoUploadSection,
  PickupAddressesSection,
  RegisteredAddressSection,
  RegistrationDetailsSection,
  TradingAddressSection,
  type AddressFields,
  type ApplyAddressFromMap,
  type GeneralSettingsState,
  type MapPickerTarget,
  type PickupAddress,
} from '@/components/pages/Settings/CompanyDetails';
import type { SettingsOutletContext } from '@/components/templates/settingsOutletTypes';
import {
  cloneGeneralSettingsState,
  mapGeneralSettingsToOrgProfileSavePayload,
  mapOrganizationProfileDataToFormState,
} from '@/components/pages/Settings/CompanyDetails/profileMappers';
import { env } from '@/config/env';
import { collectRootServerMessages, sliceErrorsByPrefix } from '@/lib/formFieldErrors';
import {
  buildOrgProfileServerFieldErrorMap,
  summarizeOrgProfileValidationDetailsForToast,
} from '@/lib/orgProfileServerFieldMap';
import { cn } from '@/lib/utils';
import {
  flattenZodErrorToFieldMap,
  orgProfileClientSchema,
} from '@/schemas/orgProfileClient.schema';
import { LoadingScreen } from '@/components/organisms';
import {
  useGetOrganizationProfileQuery,
  useUpdateOrganizationProfileMutation,
} from '@/store/api/organizationProfileApi';
import { parseClientValidationFromFetchError } from '@/store/api/validationErrors';
import { getErrorMessage, isFetchBaseQueryError } from '@/store/api/utils';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';

const LOGO_MAX_BYTES = 2 * 1024 * 1024;

interface ProfileFormBaseline {
  settings: GeneralSettingsState;
  version: number;
  remoteLogoUrl: string | null;
}

export default function CompanyDetailsSettingsPage(): React.JSX.Element {
  const organizationIdFromUser = useAppSelector(
    (state: RootState) =>
      state.auth.user?.organization_id ??
      state.auth.loginResponse?.data?.organization_id ??
      state.auth.loginResponse?.data?.organization?.id ??
      null
  );
  const accessToken = useAppSelector((state: RootState) => state.auth.accessToken);
  const organizationIdFromEnv =
    env.VITE_ORGANIZATION_ID.length > 0 ? env.VITE_ORGANIZATION_ID : null;
  const organizationId = useMemo(
    () =>
      organizationIdFromUser ?? parseOrganizationIdFromToken(accessToken) ?? organizationIdFromEnv,
    [organizationIdFromUser, accessToken, organizationIdFromEnv]
  );

  const [generalSettings, setGeneralSettings] =
    useState<GeneralSettingsState>(INITIAL_GENERAL_SETTINGS);
  const [activeMapPicker, setActiveMapPicker] = useState<MapPickerTarget | null>(null);
  const [uploadedLogoFile, setUploadedLogoFileRaw] = useState<File | null>(null);
  const [logoMarkedForRemoval, setLogoMarkedForRemoval] = useState(false);
  const [remoteLogoUrl, setRemoteLogoUrl] = useState<string | null>(null);
  const [baseline, setBaseline] = useState<ProfileFormBaseline | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>({});
  const logoInputRef = useRef<HTMLInputElement>(null);
  const { setSubheaderActions } = useOutletContext<SettingsOutletContext>();

  const skipProfile = !organizationId || !accessToken;
  const profileQueryArg = organizationId && accessToken ? { organizationId } : skipToken;
  const {
    data: profileResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetOrganizationProfileQuery(profileQueryArg);

  const [updateOrganizationProfile, { isLoading: isSavingProfile }] =
    useUpdateOrganizationProfileMutation();

  useEffect(() => {
    if (!profileResponse?.success || !profileResponse.data) {
      return;
    }
    const mapped = mapOrganizationProfileDataToFormState(profileResponse.data);
    startTransition(() => {
      setGeneralSettings(mapped.generalSettings);
      setRemoteLogoUrl(mapped.logoUrl);
      setLogoMarkedForRemoval(false);
      setBaseline({
        settings: cloneGeneralSettingsState(mapped.generalSettings),
        version: mapped.profileVersion,
        remoteLogoUrl: mapped.logoUrl,
      });
      setServerFieldErrors({});
    });
  }, [profileResponse]);

  const registeredAddressFieldErrors = useMemo(() => {
    const slice = sliceErrorsByPrefix(serverFieldErrors, 'registeredAddress');
    return Object.keys(slice).length > 0 ? slice : undefined;
  }, [serverFieldErrors]);

  const tradingAddressFieldErrors = useMemo(() => {
    const slice = sliceErrorsByPrefix(serverFieldErrors, 'tradingAddress');
    return Object.keys(slice).length > 0 ? slice : undefined;
  }, [serverFieldErrors]);

  const rootServerMessages = useMemo(
    () => collectRootServerMessages(serverFieldErrors),
    [serverFieldErrors]
  );

  const setUploadedLogoFile = useCallback((file: File | null): void => {
    if (file) {
      setLogoMarkedForRemoval(false);
    }
    setUploadedLogoFileRaw(file);
  }, []);

  const dirty = useMemo(() => {
    if (!baseline) {
      return false;
    }
    if (uploadedLogoFile) {
      return true;
    }
    if (logoMarkedForRemoval && baseline.remoteLogoUrl) {
      return true;
    }
    return JSON.stringify(generalSettings) !== JSON.stringify(baseline.settings);
  }, [baseline, generalSettings, uploadedLogoFile, logoMarkedForRemoval]);

  const handleDiscard = useCallback((): void => {
    if (!baseline) {
      return;
    }
    startTransition(() => {
      setGeneralSettings(cloneGeneralSettingsState(baseline.settings));
      setRemoteLogoUrl(baseline.remoteLogoUrl);
      setUploadedLogoFileRaw(null);
      setLogoMarkedForRemoval(false);
      setServerFieldErrors({});
    });
  }, [baseline]);

  const handleSave = useCallback(async (): Promise<void> => {
    if (!organizationId || !baseline) {
      toast.error('Profile is not ready to save yet.');
      return;
    }

    const clientParsed = orgProfileClientSchema.safeParse(generalSettings);
    let clientFieldErrors: Record<string, string> = {};
    if (!clientParsed.success) {
      // Advisory only: show inline hints, but still submit so server remains source of truth.
      clientFieldErrors = flattenZodErrorToFieldMap(clientParsed.error);
      setServerFieldErrors(clientFieldErrors);
    }

    if (uploadedLogoFile) {
      if (uploadedLogoFile.size > LOGO_MAX_BYTES) {
        toast.error('Logo must be 2 MB or smaller.');
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(uploadedLogoFile.type)) {
        toast.error('Logo must be a JPEG or PNG file.');
        return;
      }
    }

    const payload = mapGeneralSettingsToOrgProfileSavePayload(generalSettings, baseline.version);

    const removeLogo = Boolean(
      logoMarkedForRemoval &&
      baseline.remoteLogoUrl &&
      !(uploadedLogoFile && uploadedLogoFile.size > 0)
    );

    try {
      await updateOrganizationProfile({
        organizationId,
        payload,
        logo: uploadedLogoFile,
        removeLogo,
      }).unwrap();
      toast.success('Profile saved');
      setUploadedLogoFileRaw(null);
      setLogoMarkedForRemoval(false);
      setServerFieldErrors({});
    } catch (err: unknown) {
      if (isFetchBaseQueryError(err) && err.status === 409) {
        toast.error('This profile was updated elsewhere. Refreshing your data.');
        await refetch();
        return;
      }
      const validation = parseClientValidationFromFetchError(err);
      if (validation) {
        setServerFieldErrors({
          ...clientFieldErrors,
          ...buildOrgProfileServerFieldErrorMap(validation.details),
        });
        toast.error(
          summarizeOrgProfileValidationDetailsForToast(validation.details, validation.message)
        );
        return;
      }
      setServerFieldErrors(clientFieldErrors);
      toast.error(getErrorMessage(err));
    }
  }, [
    organizationId,
    baseline,
    generalSettings,
    logoMarkedForRemoval,
    uploadedLogoFile,
    updateOrganizationProfile,
    refetch,
  ]);

  useEffect(() => {
    setSubheaderActions({
      onSave: handleSave,
      onDiscard: handleDiscard,
      saveDisabled: !dirty || !organizationId || !baseline || isSavingProfile,
      discardDisabled: !dirty || isSavingProfile,
      isSaving: isSavingProfile,
    });
    return () => {
      setSubheaderActions(null);
    };
  }, [
    setSubheaderActions,
    handleSave,
    handleDiscard,
    dirty,
    organizationId,
    baseline,
    isSavingProfile,
  ]);

  const updateGeneral = <K extends keyof GeneralSettingsState>(
    key: K,
    value: GeneralSettingsState[K]
  ): void => setGeneralSettings((prev) => ({ ...prev, [key]: value }));

  const updateAddress = (
    key: 'registeredAddress' | 'tradingAddress',
    field: keyof AddressFields,
    value: string
  ): void => setGeneralSettings((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));

  const patchRegisteredCoordinates = (coords: {
    latitude?: number | null;
    longitude?: number | null;
  }): void =>
    setGeneralSettings((prev) => ({
      ...prev,
      ...(coords.latitude !== undefined && { registeredLatitude: coords.latitude }),
      ...(coords.longitude !== undefined && { registeredLongitude: coords.longitude }),
    }));

  const patchTradingCoordinates = (coords: {
    latitude?: number | null;
    longitude?: number | null;
  }): void =>
    setGeneralSettings((prev) => ({
      ...prev,
      ...(coords.latitude !== undefined && { tradingLatitude: coords.latitude }),
      ...(coords.longitude !== undefined && { tradingLongitude: coords.longitude }),
    }));

  const patchPickup = (id: string, updates: Partial<PickupAddress>): void =>
    setGeneralSettings((prev) => ({
      ...prev,
      pickupAddresses: prev.pickupAddresses.map((pickup) =>
        pickup.id === id ? { ...pickup, ...updates } : pickup
      ),
    }));

  const addPickupAddress = (): void =>
    setGeneralSettings((prev) => ({
      ...prev,
      pickupAddresses: [
        ...prev.pickupAddresses,
        {
          id: `pickup-${Date.now()}`,
          isDefault: false,
          sameAsRegistered: false,
          sameAsTrading: false,
          latitude: null,
          longitude: null,
          ...EMPTY_ADDRESS,
        },
      ],
    }));

  const removePickupAddress = (id: string): void =>
    setGeneralSettings((prev) =>
      prev.pickupAddresses.length === 1
        ? prev
        : { ...prev, pickupAddresses: prev.pickupAddresses.filter((p) => p.id !== id) }
    );

  const setDefaultPickupAddress = (id: string): void =>
    setGeneralSettings((prev) => ({
      ...prev,
      pickupAddresses: prev.pickupAddresses.map((pickup) => ({
        ...pickup,
        isDefault: pickup.id === id,
      })),
    }));

  const toggleMapPicker = (target: MapPickerTarget): void =>
    setActiveMapPicker((prev) => (prev === target ? null : target));

  const applyAddressFromMap: ApplyAddressFromMap = (target, address) => {
    const normalizedAddress: Partial<AddressFields> = {
      line1: address.line1,
      line2: address.line2,
      country: 'United Kingdom',
      region: resolveRegion(address.region),
      city: resolveCity(resolveRegion(address.region), address.city),
      postcode: address.postcode,
    };

    if (target === 'registered') {
      setGeneralSettings((prev) => ({
        ...prev,
        registeredAddress: mergeAddress(prev.registeredAddress, normalizedAddress),
        registeredLatitude: address.latitude,
        registeredLongitude: address.longitude,
      }));
      setActiveMapPicker(null);
      return;
    }

    if (target === 'trading') {
      setGeneralSettings((prev) => ({
        ...prev,
        tradingAddressSameAsRegistered: false,
        tradingAddress: mergeAddress(prev.tradingAddress, normalizedAddress),
        tradingLatitude: address.latitude,
        tradingLongitude: address.longitude,
      }));
      setActiveMapPicker(null);
      return;
    }

    const pickupId = target.replace('pickup:', '');
    setGeneralSettings((prev) => ({
      ...prev,
      pickupAddresses: prev.pickupAddresses.map((pickupAddress) =>
        pickupAddress.id === pickupId
          ? {
              ...pickupAddress,
              ...mergeAddress(pickupAddress, normalizedAddress),
              sameAsRegistered: false,
              sameAsTrading: false,
              latitude: address.latitude,
              longitude: address.longitude,
            }
          : pickupAddress
      ),
    }));
    setActiveMapPicker(null);
  };

  if (!skipProfile && isLoading && !profileResponse) {
    return <LoadingScreen />;
  }

  if (!skipProfile && isError && !profileResponse) {
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-xl border border-red-200 bg-red-50/80 p-5">
        <Typography variant="body" className="text-red-900">
          {getErrorMessage(error)}
        </Typography>
        <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 flex-col gap-6 rounded-xl border border-gray-200 bg-gray-50 p-5'
      )}
    >
      {!organizationId && (
        <Typography variant="caption" color="muted" className="text-amber-800">
          No organization is linked to this account. General settings cannot be loaded from the
          server. Set organization on the user or configure VITE_ORGANIZATION_ID for development.
        </Typography>
      )}
      {rootServerMessages.length > 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50/90 p-4 space-y-2" role="alert">
          {rootServerMessages.map((message, index) => (
            <Typography
              key={`${index}-${message.slice(0, 48)}`}
              variant="body"
              className="text-sm text-red-900"
            >
              {message}
            </Typography>
          ))}
        </div>
      ) : null}
      {logoMarkedForRemoval && baseline?.remoteLogoUrl ? (
        <Typography variant="caption" className="text-sm text-amber-800">
          Logo will be removed when you save changes.
        </Typography>
      ) : null}
      <LogoUploadSection
        uploadedLogoFile={uploadedLogoFile}
        setUploadedLogoFile={setUploadedLogoFile}
        logoInputRef={logoInputRef}
        remoteLogoUrl={logoMarkedForRemoval ? null : remoteLogoUrl}
        onClearRemoteLogo={
          remoteLogoUrl
            ? () => {
                setLogoMarkedForRemoval(true);
                setUploadedLogoFileRaw(null);
              }
            : undefined
        }
      />
      <Card className="max-w-full">
        <CardContent className="space-y-8 p-5">
          <GeneralInfoSection
            generalSettings={generalSettings}
            updateGeneral={updateGeneral}
            fieldErrors={serverFieldErrors}
          />
          <hr className="border-gray-200" />
          <RegistrationDetailsSection
            generalSettings={generalSettings}
            updateGeneral={updateGeneral}
            fieldErrors={serverFieldErrors}
          />
          <hr className="border-gray-200" />
          <RegisteredAddressSection
            address={generalSettings.registeredAddress}
            latitude={generalSettings.registeredLatitude}
            longitude={generalSettings.registeredLongitude}
            isMapPickerOpen={activeMapPicker === 'registered'}
            onToggleMapPicker={() => toggleMapPicker('registered')}
            mapPicker={
              <AddressMapPickerWithCenter
                effectiveAddress={generalSettings.registeredAddress}
                latitude={generalSettings.registeredLatitude}
                longitude={generalSettings.registeredLongitude}
                onApplyAddress={(address) => applyAddressFromMap('registered', address)}
                onClose={() => setActiveMapPicker(null)}
              />
            }
            onAddressChange={(field, value) => updateAddress('registeredAddress', field, value)}
            onPatchCoordinates={patchRegisteredCoordinates}
            fieldErrors={registeredAddressFieldErrors}
          />
          <hr className="border-gray-200" />
          <TradingAddressSection
            sameAsRegistered={generalSettings.tradingAddressSameAsRegistered}
            displayAddress={resolveEffectiveTradingAddress(generalSettings)}
            latitude={resolveEffectiveTradingCoordinates(generalSettings).latitude}
            longitude={resolveEffectiveTradingCoordinates(generalSettings).longitude}
            isMapPickerOpen={activeMapPicker === 'trading'}
            onToggleMapPicker={() => toggleMapPicker('trading')}
            mapPicker={
              <AddressMapPickerWithCenter
                effectiveAddress={resolveEffectiveTradingAddress(generalSettings)}
                latitude={resolveEffectiveTradingCoordinates(generalSettings).latitude}
                longitude={resolveEffectiveTradingCoordinates(generalSettings).longitude}
                onApplyAddress={(address) => applyAddressFromMap('trading', address)}
                onClose={() => setActiveMapPicker(null)}
              />
            }
            onSameAsRegisteredChange={(checked) =>
              updateGeneral('tradingAddressSameAsRegistered', checked)
            }
            onAddressChange={(field, value) => updateAddress('tradingAddress', field, value)}
            onPatchCoordinates={patchTradingCoordinates}
            tradingFieldErrors={tradingAddressFieldErrors}
          />
          <hr className="border-gray-200" />
          <PickupAddressesSection
            generalSettings={generalSettings}
            activeMapPicker={activeMapPicker}
            onAddPickup={addPickupAddress}
            onToggleMapPicker={toggleMapPicker}
            onCloseMapPicker={() => setActiveMapPicker(null)}
            onApplyAddressFromMap={applyAddressFromMap}
            onRemovePickup={removePickupAddress}
            onSetDefaultPickup={setDefaultPickupAddress}
            onPatchPickup={patchPickup}
            serverFieldErrors={serverFieldErrors}
          />
        </CardContent>
      </Card>
    </div>
  );
}

const parseOrganizationIdFromToken = (token: string | null): string | null => {
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
};
