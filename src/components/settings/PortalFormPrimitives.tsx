import { ChevronDown } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Input } from '@/components/atoms/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import Typography from '@/components/atoms/Typography';
import {
  portalFieldInputClass,
  portalFieldLabelClass,
  portalNestedCardClass,
  portalPhoneInputClass,
  portalPhoneNumberInputClass,
  portalPhoneWrapperClass,
  portalReadOnlySelectClass,
  portalRequiredMarkClass,
  portalSelectTriggerClass,
} from '@/lib/portalTheme';

export const PORTAL_NESTED_CARD_CLASS = portalNestedCardClass;

export function PortalRequiredMark(): React.JSX.Element {
  return <span className={portalRequiredMarkClass}> *</span>;
}

export function PortalFieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}): React.JSX.Element {
  return (
    <Typography className={portalFieldLabelClass}>
      {children}
      {required ? <PortalRequiredMark /> : null}
    </Typography>
  );
}

export function PortalReadOnlySelect({ value }: { value: string }): React.JSX.Element {
  return (
    <div className={portalReadOnlySelectClass} aria-readonly>
      <span className="truncate text-sm">{value}</span>
      <ChevronDown className="size-4 shrink-0 text-[#A1A1AA]" aria-hidden />
    </div>
  );
}

export function PortalPhoneField({
  value,
  onChange,
  readOnly,
  disabled,
}: {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  disabled?: boolean;
}): React.JSX.Element {
  if (readOnly || disabled) {
    return <Input value={value} readOnly disabled className={portalFieldInputClass(true)} />;
  }

  return (
    <div className={portalPhoneWrapperClass}>
      <PhoneInput
        international
        countryCallingCodeEditable
        defaultCountry="GB"
        value={value || undefined}
        onChange={(next) => onChange?.(String(next ?? ''))}
        placeholder="Enter phone number"
        className={portalPhoneInputClass}
        numberInputProps={{
          className: portalPhoneNumberInputClass,
        }}
      />
    </div>
  );
}

export function PortalRoleSelect({
  value,
  options,
  onChange,
  readOnly,
}: {
  value: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}): React.JSX.Element {
  if (readOnly) {
    const label = options.find((o) => o.value === value)?.label ?? value;
    return <PortalReadOnlySelect value={label} />;
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={portalSelectTriggerClass}>
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        {options.map((role) => (
          <SelectItem key={role.value} value={role.value}>
            {role.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
