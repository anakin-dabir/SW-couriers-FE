import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { Input } from '@/components/atoms/input';
import { Typography } from '@/components/atoms';
import {
  CREDIT_FORM_FIELD_LABEL_CLASS,
  CREDIT_FORM_READONLY_INPUT_CLASS,
  CREDIT_FORM_REQUIRED_MARK_CLASS,
  CREDIT_FORM_STEP_DESC_CLASS,
  CREDIT_FORM_STEP_HEADER_CLASS,
  CREDIT_FORM_STEP_BODY_CLASS,
  CREDIT_FORM_STEP_TITLE_CLASS,
} from '@/lib/creditApplicationUi';
import { cn } from '@/lib/utils';

export function CreditFormStepPanel({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return <div className={CREDIT_FORM_STEP_BODY_CLASS}>{children}</div>;
}

export function CreditFormStepHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className={cn(CREDIT_FORM_STEP_HEADER_CLASS, action && 'gap-4')}>
      <div className="min-w-0 space-y-1">
        <Typography variant="h2" className={CREDIT_FORM_STEP_TITLE_CLASS}>
          {title}
        </Typography>
        <Typography variant="body" className={CREDIT_FORM_STEP_DESC_CLASS}>
          {description}
        </Typography>
      </div>
      {action ?? null}
    </div>
  );
}

export function CreditFormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="space-y-2">
      <Typography className={CREDIT_FORM_FIELD_LABEL_CLASS}>
        {label}
        {required ? <span className={CREDIT_FORM_REQUIRED_MARK_CLASS}> *</span> : null}
      </Typography>
      {children}
      {error ? (
        <Typography variant="caption" className="text-xs text-[#DC2626]">
          {error}
        </Typography>
      ) : null}
    </div>
  );
}

export function ProfileReadOnlySelect({
  displayValue,
  placeholder,
  loading,
}: {
  displayValue: string;
  placeholder: string;
  loading?: boolean;
}): React.JSX.Element {
  const text = loading ? 'Loading…' : displayValue || placeholder;
  return (
    <div
      className={cn(
        CREDIT_FORM_READONLY_INPUT_CLASS,
        'flex w-full items-center justify-between gap-2 px-3',
        !loading && !displayValue && 'text-[#A1A1AA]'
      )}
      aria-readonly
    >
      <span className="truncate text-sm">{text}</span>
      <ChevronDown className="size-4 shrink-0 text-[#A1A1AA]" aria-hidden />
    </div>
  );
}

export function ProfileReadOnlyDate({
  value,
  loading,
}: {
  value: string;
  loading?: boolean;
}): React.JSX.Element {
  return (
    <div className="relative">
      <Input
        readOnly
        value={loading ? '' : value}
        placeholder={loading ? 'Loading…' : '—'}
        className={cn(CREDIT_FORM_READONLY_INPUT_CLASS, 'pr-10')}
      />
      <CalendarIcon
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#A1A1AA]"
        aria-hidden
      />
    </div>
  );
}
