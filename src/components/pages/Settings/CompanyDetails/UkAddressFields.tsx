import { useMemo } from 'react';
import AddressAutocomplete from '@/components/molecules/AddressAutocomplete';
import { Input } from '@/components/atoms/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import Typography from '@/components/atoms/Typography';
import type { MapPickedAddress } from '@/components/molecules/AddressMapPicker';
import { REGION_CITY_MAP, UK_REGIONS } from './constants';
import { resolveCity, resolveRegion } from './addressUtils';
import type { AddressFields } from './types';
import {
  portalFieldInputClass,
  portalFieldLabelClass,
  portalRequiredMarkClass,
  portalSelectTriggerClass,
} from '@/lib/portalTheme';
import { cn } from '@/lib/utils';

interface UkAddressFieldsProps {
  prefix: string;
  address: AddressFields;
  onChange: (field: keyof AddressFields, value: string) => void;
  onCoordinatesSelect?: (coords: { latitude: number; longitude: number }) => void;
  disabled?: boolean;
  required?: boolean;
  fieldErrors?: Record<string, string>;
}

const RequiredMark = (): React.JSX.Element => <span className={portalRequiredMarkClass}> *</span>;

export default function UkAddressFields({
  prefix,
  address,
  onChange,
  onCoordinatesSelect,
  disabled = false,
  required = false,
  fieldErrors,
}: UkAddressFieldsProps): React.JSX.Element {
  const regionOptions = useMemo(() => {
    const list: string[] = [...UK_REGIONS];
    if (address.region && !list.includes(address.region)) {
      list.unshift(address.region);
    }
    return list;
  }, [address.region]);

  const cities = useMemo(() => {
    const regionKnown = (UK_REGIONS as readonly string[]).includes(address.region);
    const fromMap = regionKnown
      ? (REGION_CITY_MAP[address.region as keyof typeof REGION_CITY_MAP] ?? [])
      : [];
    const list = [...fromMap];
    if (address.city && !list.includes(address.city)) {
      list.unshift(address.city);
    }
    return list;
  }, [address.region, address.city]);

  const applyPickedAddress = (picked: MapPickedAddress): void => {
    const mappedRegion = resolveRegion(picked.region);
    const mappedCity = resolveCity(mappedRegion, picked.city);

    onChange('line1', picked.line1);
    onChange('line2', picked.line2);
    onChange('region', mappedRegion);
    onChange('city', mappedCity);
    onChange('postcode', picked.postcode);

    if (
      onCoordinatesSelect &&
      Number.isFinite(picked.latitude) &&
      Number.isFinite(picked.longitude)
    ) {
      onCoordinatesSelect({
        latitude: picked.latitude,
        longitude: picked.longitude,
      });
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Typography className={portalFieldLabelClass}>
          Address Line 1
          <RequiredMark />
        </Typography>
        <AddressAutocomplete
          value={address.line1}
          onSelect={applyPickedAddress}
          disabled={disabled}
          placeholder="Search for an address..."
        />
        {fieldErrors?.line1 ? (
          <Typography variant="caption" className="text-red-600">
            {fieldErrors.line1}
          </Typography>
        ) : null}
      </div>
      <div className="space-y-2">
        <Typography className={portalFieldLabelClass}>Address Line 2</Typography>
        <Input
          id={`${prefix}-line2`}
          value={address.line2}
          onChange={(event) => onChange('line2', event.target.value)}
          className={portalFieldInputClass(disabled)}
          disabled={disabled}
          errorMessage={fieldErrors?.line2}
        />
      </div>
      <div className="space-y-2">
        <Typography className={portalFieldLabelClass}>Country</Typography>
        <Input
          id={`${prefix}-country`}
          value="United Kingdom"
          readOnly
          disabled
          className={portalFieldInputClass(true)}
        />
      </div>
      <div className="space-y-2">
        <Typography className={portalFieldLabelClass}>
          Region
          {required ? <RequiredMark /> : null}
        </Typography>
        <Select
          value={address.region || undefined}
          onValueChange={(value) => {
            onChange('region', value);
            onChange('city', '');
          }}
          disabled={disabled}
        >
          <SelectTrigger
            id={`${prefix}-region`}
            className={cn(
              portalSelectTriggerClass,
              disabled && 'bg-[#FAFAFA] text-[#71717A]',
              fieldErrors?.region && 'border-red-500 focus-visible:ring-red-500/20'
            )}
          >
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            {regionOptions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors?.region ? (
          <Typography variant="caption" className="text-red-600">
            {fieldErrors.region}
          </Typography>
        ) : null}
      </div>
      <div className="space-y-2">
        <Typography className={portalFieldLabelClass}>
          City
          {required ? <RequiredMark /> : null}
        </Typography>
        <Select
          value={address.city || undefined}
          onValueChange={(value) => onChange('city', value)}
          disabled={disabled || !address.region}
        >
          <SelectTrigger
            id={`${prefix}-city`}
            className={cn(
              portalSelectTriggerClass,
              (disabled || !address.region) && 'bg-[#FAFAFA] text-[#71717A]',
              fieldErrors?.city && 'border-red-500 focus-visible:ring-red-500/20'
            )}
          >
            <SelectValue placeholder="Select city" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors?.city ? (
          <Typography variant="caption" className="text-red-600">
            {fieldErrors.city}
          </Typography>
        ) : null}
      </div>
      <div className="space-y-2">
        <Typography className={portalFieldLabelClass}>
          Postcode
          {required ? <RequiredMark /> : null}
        </Typography>
        <Input
          id={`${prefix}-postcode`}
          value={address.postcode}
          onChange={(event) => onChange('postcode', event.target.value)}
          className={portalFieldInputClass(disabled)}
          disabled={disabled}
          errorMessage={fieldErrors?.postcode}
        />
      </div>
    </div>
  );
}
