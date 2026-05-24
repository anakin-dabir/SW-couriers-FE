import { memo } from 'react';
import { Textarea } from '@/components/atoms/textarea';
import { cn } from '@/lib/utils';
import Typography from '@/components/atoms/Typography';
import type { FieldError } from 'react-hook-form';
import type { ReactNode } from 'react';
import type { ComponentProps } from 'react';

interface FormTextareaFieldProps extends Omit<ComponentProps<'textarea'>, 'error'> {
  /**
   * Label text for the textarea
   */
  label: string;
  /**
   * Error object from react-hook-form
   */
  error?: FieldError;
  /**
   * Helper text to display below the textarea
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
}

/**
 * FormTextareaField Molecule
 *
 * Combines shadcn Textarea component with react-hook-form error handling.
 * Provides consistent form field styling and error display.
 * Mimics FormField structure but uses textarea instead of input.
 * Optimized with React.memo for performance.
 */
const FormTextareaField = memo(function FormTextareaField({
  label,
  error,
  helperText,
  required = false,
  id,
  name: nameProp,
  className,
  labelRight,
  ...props
}: FormTextareaFieldProps): React.JSX.Element {
  const name: string | undefined = typeof nameProp === 'string' ? nameProp : undefined;
  const textareaId: string = id || name || `textarea-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId: string | undefined = error ? `${textareaId}-error` : undefined;
  const helperId: string | undefined = helperText ? `${textareaId}-helper` : undefined;
  const describedBy: string | undefined =
    [errorId, helperId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <Typography
          variant="label"
          htmlFor={textareaId}
          className="text-sm font-medium leading-none text-form-title"
        >
          {label}
        </Typography>
        {labelRight && <div>{labelRight}</div>}
      </div>
      <Textarea
        id={textareaId}
        name={name}
        required={required}
        aria-required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
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

export default FormTextareaField;
