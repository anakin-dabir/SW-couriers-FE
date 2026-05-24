import { memo } from 'react';
import type { Control, FieldError, FieldValues } from 'react-hook-form';
import PhoneInputWithCountry from 'react-phone-number-input/react-hook-form';
import Typography from '@/components/atoms/Typography';
import { cn } from '@/lib/utils';
import 'react-phone-number-input/style.css';

interface FormPhoneFieldProps<T extends FieldValues> {
  /** React Hook Form control */
  control: Control<T>;
  /** Field name (e.g. 'phone') */
  name: string;
  /** Label text */
  label: string;
  /** Error object from react-hook-form */
  error?: FieldError;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Placeholder for the number input */
  placeholder?: string;
  /** Default country code (e.g. 'GB') */
  defaultCountry?: string;
}

const INPUT_CLASS =
  'flex-1 min-w-0 border-0 bg-transparent p-0 text-sm font-normal leading-5 text-form-title placeholder:text-form-placeholder focus:outline-none focus:ring-0';

const WRAPPER_CLASS =
  'flex h-10 w-full items-center rounded-md border border-form-border-light bg-form-surface px-3 py-2 gap-2 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50';

const FormPhoneFieldInner = memo(function FormPhoneFieldInner<T extends FieldValues>({
  control,
  name,
  label,
  error,
  required = false,
  disabled = false,
  placeholder = 'Enter phone number',
  defaultCountry = 'GB',
}: FormPhoneFieldProps<T>): React.JSX.Element {
  const inputId = `phone-${name}`;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center gap-1">
        <Typography
          variant="label"
          htmlFor={inputId}
          className="text-sm font-medium leading-none text-form-title"
        >
          {label}
        </Typography>
        {required && (
          <Typography variant="body" className="text-sm font-medium leading-none text-primary-600">
            *
          </Typography>
        )}
      </div>
      <div
        className={cn(
          WRAPPER_CLASS,
          error && 'border-error focus-within:border-error focus-within:ring-error/20'
        )}
      >
        <PhoneInputWithCountry
          control={control}
          name={name}
          defaultCountry={defaultCountry as 'GB'}
          disabled={disabled}
          placeholder={placeholder}
          className="flex flex-1 min-w-0 items-center border-0 bg-transparent p-0"
          numberInputProps={{
            id: inputId,
            className: INPUT_CLASS,
            'aria-invalid': error ? 'true' : 'false',
            'aria-describedby': errorId,
            'aria-required': required,
          }}
        />
      </div>
      {error && (
        <Typography
          id={errorId}
          variant="caption"
          color="error"
          role="alert"
          className="text-sm text-error"
        >
          {error.message}
        </Typography>
      )}
    </div>
  );
}) as <T extends FieldValues>(props: FormPhoneFieldProps<T>) => React.JSX.Element;

export default FormPhoneFieldInner;
