import type { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/atoms/input-otp';
import Typography from '@/components/atoms/Typography';

interface OTPInputFieldProps {
  /** React Hook Form control */
  control: Control<{ otp: string }>;
  /** Field name */
  name?: string;
  /** Whether input is disabled */
  disabled?: boolean;
  /** Error message */
  error?: string;
  /** OTP length */
  length?: number;
  /** Additional container className */
  containerClassName?: string;
  /** Show label */
  showLabel?: boolean;
  /** Label text */
  label?: string;
}

/**
 * Molecule component for OTP input field
 * Provides consistent OTP input with error handling
 */
export default function OTPInputField({
  control,
  name = 'otp',
  disabled = false,
  error,
  length = 6,
  containerClassName = 'justify-center',
  showLabel = false,
  label = 'Verification Code',
}: OTPInputFieldProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2 items-center">
      {showLabel && (
        <Typography
          variant="label"
          htmlFor="otp-input"
          className="text-sm font-medium leading-none text-form-title w-full text-center"
        >
          {label} <span className="text-red-500">*</span>
        </Typography>
      )}
      <Controller
        control={control}
        name={name as 'otp'}
        render={({ field }) => (
          <InputOTP
            id="otp-input"
            maxLength={length}
            disabled={disabled}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            containerClassName={containerClassName}
          >
            <InputOTPGroup>
              {Array.from({ length }).map((_, index) => (
                <InputOTPSlot key={index} index={index} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        )}
      />
      {error && (
        <Typography variant="caption" color="error" align="center">
          {error}
        </Typography>
      )}
    </div>
  );
}
