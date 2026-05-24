import { useNavigate, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { ArrowLeft } from 'lucide-react';
import { otpSchema, type OtpFormData } from '@/schemas/auth.schema';
import { useFormValidation } from '@/hooks/useFormValidation';
import { AuthCard, AuthHeader, FormLogo, ResendButton } from '@/components/pages/Auth';
import OTPInputField from './OTPInputField';

/**
 * Organism component for OTP verification form
 * Contains all OTP verification logic and composition
 */
export default function OTPForm(): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const [resendTimer, setResendTimer] = useState(30);

  // Get the location user was trying to access before login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  // Get email from location state (passed from login)
  const email = (location.state as { email?: string })?.email || '';

  // Mask email for display (e.g., johndoe**@gmail.com)
  const maskEmail = (emailAddress: string): string => {
    if (!emailAddress) return 'your email';
    const [localPart, domain] = emailAddress.split('@');
    if (!localPart || !domain) return emailAddress;
    const maskedLocal = localPart.slice(0, -2) + '**';
    return `${maskedLocal}@${domain}`;
  };

  // Redirect if OTP page is opened without email context
  useEffect(() => {
    if (!email) {
      void navigate('/login', { replace: true });
    }
  }, [email, navigate]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = useFormValidation({
    schema: otpSchema,
    defaultValues: {
      otp: '',
    },
  });

  // Watch OTP value to enable/disable button
  const otpValue = watch('otp');
  const isFormValid = otpValue && otpValue.length === 6 && !errors.otp;

  const onSubmit = async (data: OtpFormData): Promise<void> => {
    clearErrors();

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (data.otp.length !== 6 || !/^\d+$/.test(data.otp)) {
        throw new Error('Invalid OTP format');
      }

      reset();
      void navigate(from, { replace: true });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'OTP verification failed. Please try again.';
      setError('root', {
        type: 'manual',
        message: errorMessage,
      });
      console.error('OTP verification error:', err);
    }
  };

  const handleResendOTP = async (): Promise<void> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      alert('OTP has been resent to your email');
      setResendTimer(30);
    } catch (err) {
      console.error('Resend OTP error:', err);
      alert('Failed to resend OTP. Please try again.');
    }
  };

  return (
    <AuthCard>
      <FormLogo />

      <AuthHeader
        title="Verify your email"
        subtitle={`We've sent a 6-digit verification code to ${maskEmail(email)}.`}
      />

      {/* Error Alert */}
      {errors.root && (
        <div
          id="otp-error"
          role="alert"
          aria-live="polite"
          className="w-full rounded-md border border-error-light bg-error-light p-3 text-sm text-error-dark"
        >
          {errors.root.message}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e);
        }}
        aria-label="OTP verification form"
        noValidate
        className="flex w-full flex-col gap-4"
      >
        <OTPInputField control={control} disabled={isSubmitting} error={errors.otp?.message} />

        {/* Verify Button */}
        <Button
          type="submit"
          variant="default"
          disabled={isSubmitting || !isFormValid}
          className="w-full h-10"
          aria-label={isSubmitting ? 'Verifying OTP, please wait' : 'Verify OTP'}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
        </Button>

        {/* Back to Sign In Button */}
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            void navigate('/login', { replace: false });
          }}
          disabled={isSubmitting}
          className="w-full h-10"
          aria-label="Back to Sign In"
        >
          <ArrowLeft className="size-4" />
          Back to Sign In
        </Button>
      </form>

      {/* Resend Code Section */}
      <ResendButton
        timer={resendTimer}
        onResend={() => {
          void handleResendOTP();
        }}
      />
    </AuthCard>
  );
}
