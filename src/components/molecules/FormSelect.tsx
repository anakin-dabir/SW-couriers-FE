import { ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Typography from '@/components/atoms/Typography';
import type { FieldError } from 'react-hook-form';

interface SelectOption {
  /** Option value */
  value: string;
  /** Option label */
  label: string;
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Select options */
  options: SelectOption[];
  /** Label text */
  label?: string;
  /** Error object from react-hook-form */
  error?: FieldError;
  /** Additional className */
  className?: string;
  /** Select wrapper className */
  wrapperClassName?: string;
  /** Icon shown inside the control on the left (e.g. search — Figma pickup address). */
  leftIcon?: LucideIcon;
}

/**
 * FormSelect Molecule component
 * Combines select element with Typography atom (for label) and error handling
 * Matches the design system styling with error support
 */
export default function FormSelect({
  options,
  label,
  error,
  className,
  wrapperClassName,
  leftIcon: LeftIcon,
  ...props
}: FormSelectProps): React.JSX.Element {
  return (
    <div className={cn('flex flex-col gap-2', wrapperClassName)}>
      {label && (
        <Typography variant="label" htmlFor={props.id} color="muted" className="text-xs uppercase">
          {label}
        </Typography>
      )}
      <div className="relative">
        {LeftIcon && (
          <LeftIcon
            className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-form-subtitle"
            aria-hidden
          />
        )}
        <select
          {...props}
          aria-invalid={error ? 'true' : 'false'}
          className={cn(
            'flex h-10 w-full rounded-md border border-form-border-light bg-form-surface py-2',
            LeftIcon ? 'pl-9 pr-10' : 'px-3 pr-10',
            'text-sm text-form-title font-normal leading-5',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:border-primary-500',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'appearance-none',
            error && 'border-error focus-visible:border-error focus-visible:ring-error/20',
            className
          )}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-form-subtitle" />
      </div>
      {error && (
        <Typography variant="caption" color="error" role="alert" className="text-sm text-error">
          {error.message}
        </Typography>
      )}
    </div>
  );
}
