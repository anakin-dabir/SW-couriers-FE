import * as React from 'react';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import Typography from '@/components/atoms/Typography';
import { cn } from '@/lib/utils';

export interface InputProps extends React.ComponentProps<'input'> {
  /** Optional icon to display on the left side */
  leftIcon?: LucideIcon;
  /** Optional icon to display on the right side */
  rightIcon?: LucideIcon;
  /** Wrapper class name for the container */
  wrapperClassName?: string;
  /** Enable password visibility toggle (only works with type="password") */
  showPasswordToggle?: boolean;
  /** Inline validation message shown below the control */
  errorMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      wrapperClassName,
      showPasswordToggle,
      errorMessage,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const hasLeftIcon = Boolean(LeftIcon);
    const hasRightIcon = Boolean(RightIcon);
    const isPasswordField = type === 'password';
    const shouldShowToggle = isPasswordField && showPasswordToggle !== false;
    const hasError = Boolean(errorMessage);

    const inputType = shouldShowToggle && showPassword ? 'text' : type;

    const togglePasswordVisibility = (): void => {
      setShowPassword((prev) => !prev);
    };

    const errorBorderClass = hasError
      ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20'
      : 'border-form-border-light focus-visible:border-primary-500 focus-visible:ring-primary-500/20';

    const inputClassName = cn(
      'flex h-10 w-full rounded-md border bg-form-surface px-3 py-2',
      'text-sm text-form-title font-normal leading-5',
      'placeholder:text-form-placeholder',
      'focus-visible:outline-none focus-visible:ring-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
      hasLeftIcon && 'pl-10',
      (hasRightIcon || shouldShowToggle) && 'pr-10',
      errorBorderClass,
      className
    );

    const inputElement = <input type={inputType} className={inputClassName} ref={ref} {...props} />;

    const errorBlock = hasError ? (
      <Typography variant="caption" className="mt-1 block text-red-600">
        {errorMessage}
      </Typography>
    ) : null;

    // If no icons and no password toggle, return just the input (unless we need error UI)
    if (!hasLeftIcon && !hasRightIcon && !shouldShowToggle) {
      if (!hasError) {
        return inputElement;
      }
      return (
        <div className={cn('w-full', wrapperClassName)}>
          {inputElement}
          {errorBlock}
        </div>
      );
    }

    // Wrap with icons container
    return (
      <div className={cn('w-full space-y-1', wrapperClassName)}>
        <div className="relative w-full">
          {LeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <LeftIcon className="size-4 text-form-subtitle" />
            </div>
          )}
          {inputElement}
          {shouldShowToggle && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-form-subtitle hover:text-form-title transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          )}
          {RightIcon && !shouldShowToggle && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <RightIcon className="size-4 text-form-subtitle" />
            </div>
          )}
        </div>
        {errorBlock}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
