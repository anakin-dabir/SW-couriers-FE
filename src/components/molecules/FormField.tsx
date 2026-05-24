import { memo } from 'react';
import { Input } from '@/components/atoms/input';
import { cn } from '@/lib/utils';
import Typography from '@/components/atoms/Typography';
import type { FieldError } from 'react-hook-form';
import type { ReactNode } from 'react';
import type { ComponentProps } from 'react';
import type { LucideIcon } from 'lucide-react';

interface FormFieldProps extends Omit<ComponentProps<'input'>, 'error'> {
  /**
   * Label text for the input
   */
  label: string;
  /**
   * Error object from react-hook-form
   */
  error?: FieldError;
  /**
   * Helper text to display below the input
   */
  helperText?: string;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Optional element to display on the right side of the label
   */
  labelRight?: ReactNode;
  /**
   * Optional icon component to display on the left side of the input
   */
  leftIcon?: LucideIcon;
  /**
   * Enable password visibility toggle (automatically enabled for password fields)
   */
  showPasswordToggle?: boolean;
}

/**
 * FormField Molecule
 *
 * Combines shadcn Input component with react-hook-form error handling.
 * Provides consistent form field styling and error display.
 * Optimized with React.memo for performance.
 *
 * The register() props from react-hook-form (onChange, onBlur, ref, name, etc.)
 * are spread directly to the Input component, ensuring proper integration.
 */
const FormField = memo(function FormField({
  label,
  error,
  helperText,
  required = false,
  id,
  name: nameProp,
  className,
  labelRight,
  leftIcon: LeftIcon,
  showPasswordToggle,
  ...props
}: FormFieldProps): React.JSX.Element {
  const name: string | undefined = typeof nameProp === 'string' ? nameProp : undefined;
  const inputId: string = id || name || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId: string | undefined = error ? `${inputId}-error` : undefined;
  const helperId: string | undefined = helperText ? `${inputId}-helper` : undefined;
  const describedBy: string | undefined =
    [errorId, helperId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Typography
            variant="label"
            htmlFor={inputId}
            className="text-sm font-medium leading-none text-form-title"
          >
            {label}
          </Typography>
          {required && (
            <Typography
              variant="body"
              className="text-sm font-medium leading-none text-primary-600"
            >
              *
            </Typography>
          )}
        </div>

        {labelRight && <div>{labelRight}</div>}
      </div>
      <Input
        id={inputId}
        name={name}
        required={required}
        aria-required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        leftIcon={LeftIcon}
        showPasswordToggle={showPasswordToggle !== false && props.type === 'password'}
        className={cn(error && 'border-error focus-visible:border-error', className)}
        {...props}
      />
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
      {helperText && !error && (
        <Typography id={helperId} variant="caption" className="text-sm text-form-subtitle">
          {helperText}
        </Typography>
      )}
    </div>
  );
});

export default FormField;
