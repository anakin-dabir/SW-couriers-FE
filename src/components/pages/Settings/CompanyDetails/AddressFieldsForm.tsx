import { useMemo } from 'react';
import { Input } from '@/components/atoms/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import Typography from '@/components/atoms/Typography';
import { REGION_CITY_MAP, UK_REGIONS } from '@/components/pages/Settings/CompanyDetails/constants';
import type { AddressFields } from '@/components/pages/Settings/CompanyDetails/types';
import { cn } from '@/lib/utils';

interface AddressFieldsFormProps {
  address: AddressFields;
  onChange: (field: keyof AddressFields, value: string) => void;
  disabled?: boolean;
  /** Shallow map: `line1`, `region`, … (no `registeredAddress.` prefix) */
  fieldErrors?: Record<string, string>;
}

export default function AddressFieldsForm({
  address,
  onChange,
  disabled = false,
  fieldErrors,
}: AddressFieldsFormProps): React.JSX.Element {
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

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Typography variant="label" className="text-xs text-form-title">
          Address Line 1 <span className="text-red-600">*</span>
        </Typography>
        <Input
          value={address.line1}
          onChange={(e) => onChange('line1', e.target.value)}
          disabled={disabled}
          errorMessage={fieldErrors?.line1}
        />
      </div>
      <div className="space-y-2">
        <Typography variant="label" className="text-xs text-form-title">
          Address Line 2
        </Typography>
        <Input
          value={address.line2}
          onChange={(e) => onChange('line2', e.target.value)}
          disabled={disabled}
          errorMessage={fieldErrors?.line2}
        />
      </div>
      <div className="space-y-2">
        <Typography variant="label" className="text-xs text-form-title">
          Country
        </Typography>
        <Input value="United Kingdom" readOnly disabled />
        {fieldErrors?.country ? (
          <Typography variant="caption" className="text-red-600">
            {fieldErrors.country}
          </Typography>
        ) : null}
      </div>
      <div className="space-y-2">
        <Typography variant="label" className="text-xs text-form-title">
          Region <span className="text-red-600">*</span>
        </Typography>
        <Select
          value={address.region || undefined}
          onValueChange={(val) => {
            onChange('region', val);
            onChange('city', '');
          }}
          disabled={disabled}
        >
          <SelectTrigger
            className={cn(
              'h-10',
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
        <Typography variant="label" className="text-xs text-form-title">
          City <span className="text-red-600">*</span>
        </Typography>
        <Select
          value={address.city || undefined}
          onValueChange={(val) => onChange('city', val)}
          disabled={disabled || !address.region || cities.length === 0}
        >
          <SelectTrigger
            className={cn(
              'h-10',
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
        <Typography variant="label" className="text-xs text-form-title">
          Postcode <span className="text-red-600">*</span>
        </Typography>
        <Input
          value={address.postcode}
          onChange={(e) => onChange('postcode', e.target.value)}
          disabled={disabled}
          errorMessage={fieldErrors?.postcode}
        />
      </div>
    </div>
  );
}
