import { useNavigate } from 'react-router-dom';
import React, { useState, useCallback, useEffect } from 'react';
import { useFormValidation } from '@/hooks/useFormValidation';
import { Mail, KeyRound } from 'lucide-react';
import {
  forgotPasswordStep1Schema,
  forgotPasswordStep2Schema,
  forgotPasswordStep3Schema,
  type ForgotPasswordStep1Data,
  type ForgotPasswordStep2Data,
  type ForgotPasswordStep3Data,
} from '@/schemas/auth.schema';
import { usePasswordStrengthRing } from '@/hooks';
import {
  getErrorMessage,
  useConfirmPasswordResetMutation,
  useRequestPasswordResetMutation,
  useVerifyPasswordResetOtpMutation,
} from '@/store/api';
import { cn } from '@/lib/utils';
import { Controller } from 'react-hook-form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/atoms/input-otp';
import { PasswordStrengthIndicator, Typography } from '@/components/atoms';
import { FormField } from '@/components/molecules';
import {
  AuthCard,
  AuthHeader,
  AuthSuccessMessage,
  BackButton,
  FormLogo,
  ResendButton,
  SubmitButton,
  SupportLink,
} from '@/components/pages/Auth';

type ForgotPasswordStep = 1 | 2 | 3 | 4;
type VerifiedResetOtpData = ForgotPasswordStep2Data & { passwordResetToken: string };
const PASSWORD_RESET_TOKEN_REGEX = /^[a-f0-9]{64}$/i;

// Step 1: Enter Email Form
function Step1Form({
  onNext,
  defaultValues,
}: {
  onNext: (data: ForgotPasswordStep1Data) => void;
  defaultValues?: Partial<ForgotPasswordStep1Data>;
}): React.JSX.Element {
  const [requestPasswordReset] = useRequestPasswordResetMutation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useFormValidation({
    schema: forgotPasswordStep1Schema,
    defaultValues: {
      email: defaultValues?.email || '',
    },
  });

  const onSubmit = async (data: ForgotPasswordStep1Data): Promise<void> => {
    try {
      const response = await requestPasswordReset({ email: data.email }).unwrap();
      if (!response.success) {
        throw new Error(response.message || 'Failed to send reset link. Please try again.');
      }

      onNext(data);
    } catch (err) {
      setError('root', {
        type: 'manual',
        message: getErrorMessage(err) || 'Failed to send reset link. Please try again.',
      });
    }
  };

  return (
    <>
      <AuthHeader
        title="Reset your password!"
        subtitle="Enter your registered email address and we'll send you a link to reset your password."
      />

      <form
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e);
        }}
        noValidate
        className="flex w-full flex-col gap-4"
      >
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="Enter Email"
          disabled={isSubmitting}
          required
          error={errors.email}
          leftIcon={Mail}
          {...register('email')}
        />

        {errors.root && (
          <div className="text-sm text-red-500" role="alert">
            {errors.root.message}
          </div>
        )}

        <SubmitButton text="Get Reset Link" loadingText="Sending..." isLoading={isSubmitting} />
      </form>

      <SupportLink />
    </>
  );
}

// Step 2: OTP Verification Form
function Step2Form({
  onNext,
  email,
  defaultValues,
}: {
  onNext: (data: VerifiedResetOtpData) => void;
  email: string;
  defaultValues?: Partial<ForgotPasswordStep2Data>;
}): React.JSX.Element {
  const [verifyPasswordResetOtp] = useVerifyPasswordResetOtpMutation();
  const [requestPasswordReset, { isLoading: isResending }] = useRequestPasswordResetMutation();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useFormValidation({
    schema: forgotPasswordStep2Schema,
    defaultValues: {
      otp: defaultValues?.otp || '',
    },
  });

  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleResend = (): void => {
    void (async (): Promise<void> => {
      try {
        const response = await requestPasswordReset({ email }).unwrap();
        if (!response.success) {
          throw new Error(response.message || 'Failed to resend verification code.');
        }
        setResendTimer(30);
      } catch (err) {
        setError('root', {
          type: 'manual',
          message: getErrorMessage(err) || 'Failed to resend verification code.',
        });
      }
    })();
  };

  const onSubmit = async (data: ForgotPasswordStep2Data): Promise<void> => {
    try {
      const response = await verifyPasswordResetOtp({
        email,
        otp: data.otp,
      }).unwrap();

      const passwordResetToken = response.data?.password_reset_token;
      if (!response.success || !passwordResetToken) {
        throw new Error(response.message || 'Invalid or expired verification code');
      }
      const normalizedToken = passwordResetToken.trim();
      if (!PASSWORD_RESET_TOKEN_REGEX.test(normalizedToken)) {
        throw new Error('Invalid password reset session token. Please verify OTP again.');
      }

      onNext({
        ...data,
        passwordResetToken: normalizedToken,
      });
    } catch (err) {
      setError('root', {
        type: 'manual',
        message: getErrorMessage(err) || 'Failed to verify code. Please try again.',
      });
    }
  };

  const maskEmail = (emailAddress: string): string => {
    if (!emailAddress) return 'your email';
    const [localPart, domain] = emailAddress.split('@');
    if (!localPart || !domain) return emailAddress;
    const maskedLocal = localPart.slice(0, 2) + '**';
    return `${maskedLocal}@${domain}`;
  };

  return (
    <>
      <AuthHeader
        title="Enter Verification Code"
        subtitle={`We've sent a 6-digit verification code to ${maskEmail(email)}. Please enter it below.`}
      />

      <form
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e);
        }}
        noValidate
        className="flex w-full flex-col gap-4"
      >
        <div className="flex flex-col gap-2 items-center">
          <Typography
            variant="label"
            htmlFor="otp-input"
            className="text-sm font-medium leading-none text-form-title w-full text-center"
          >
            Verification Code <span className="text-red-500">*</span>
          </Typography>
          <Controller
            control={control}
            name="otp"
            render={({ field }) => (
              <InputOTP id="otp-input" maxLength={6} {...field} containerClassName="justify-center">
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            )}
          />
          {errors.otp && (
            <Typography variant="caption" color="error" align="center">
              {errors.otp.message}
            </Typography>
          )}
        </div>

        {errors.root && (
          <div className="text-sm text-red-500" role="alert">
            {errors.root.message}
          </div>
        )}

        <ResendButton
          timer={resendTimer}
          onResend={handleResend}
          disabled={isResending}
          buttonText={isResending ? 'Sending...' : 'Resend code'}
        />

        <SubmitButton text="Verify" loadingText="Verifying..." isLoading={isSubmitting} />
      </form>
    </>
  );
}

// Step 3: Update Password Form
function Step3Form({
  onSubmit,
  defaultValues,
  isSubmitting: parentIsSubmitting,
  submitError,
}: {
  onSubmit: (data: ForgotPasswordStep3Data) => void | Promise<void>;
  defaultValues?: Partial<ForgotPasswordStep3Data>;
  isSubmitting: boolean;
  submitError?: string | null;
}): React.JSX.Element {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useFormValidation({
    schema: forgotPasswordStep3Schema,
    defaultValues: {
      password: defaultValues?.password || '',
      confirmPassword: defaultValues?.confirmPassword || '',
    },
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');
  const passwordRingClass = usePasswordStrengthRing(password);

  const submitting = isSubmitting || parentIsSubmitting;

  const showPasswordMismatch =
    password && confirmPassword && password !== confirmPassword && confirmPassword.length > 0;

  return (
    <>
      <AuthHeader
        title="Update Your Password"
        subtitle="Enter and confirm your new password, with a combination of at least 1 uppercase, 1 lowercase and a number ( 0-9 ) required."
      />

      <form
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e);
        }}
        noValidate
        className="flex w-full flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <FormField
            label="New Password"
            type="password"
            autoComplete="new-password"
            placeholder="Enter New Password"
            disabled={submitting}
            required
            error={errors.password}
            leftIcon={KeyRound}
            className={cn(
              passwordRingClass,
              showPasswordMismatch && 'ring-2 ring-red-500 ring-offset-2'
            )}
            {...register('password')}
          />
          {showPasswordMismatch ? (
            <Typography variant="caption" color="error">
              Passwords do not match
            </Typography>
          ) : (
            <PasswordStrengthIndicator password={password} />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <FormField
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            placeholder="Confirm Password"
            disabled={submitting}
            required
            error={errors.confirmPassword}
            leftIcon={KeyRound}
            className={showPasswordMismatch ? 'ring-2 ring-red-500 ring-offset-2' : ''}
            {...register('confirmPassword')}
          />
          {showPasswordMismatch && (
            <Typography variant="caption" color="error">
              Passwords do not match
            </Typography>
          )}
        </div>

        <SubmitButton text="Update password" loadingText="Updating..." isLoading={submitting} />
        {submitError && (
          <Typography variant="caption" color="error">
            {submitError}
          </Typography>
        )}
      </form>
    </>
  );
}

/**
 * Organism component for forgot password multi-step form
 * Contains all forgot password logic and composition
 */
export default function ForgotPasswordForm(): React.JSX.Element {
  const navigate = useNavigate();
  const [confirmPasswordReset] = useConfirmPasswordResetMutation();
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [step1Data, setStep1Data] = useState<ForgotPasswordStep1Data | null>(null);
  const [step2Data, setStep2Data] = useState<VerifiedResetOtpData | null>(null);

  const handleStep1Next = useCallback((data: ForgotPasswordStep1Data) => {
    setStep1Data(data);
    setCurrentStep(2);
  }, []);

  const handleStep2Next = useCallback((data: VerifiedResetOtpData) => {
    setSubmitError(null);
    setStep2Data(data);
    setCurrentStep(3);
  }, []);

  const handleStep2Back = useCallback(() => {
    setCurrentStep(1);
  }, []);

  const handleStep3Back = useCallback(() => {
    setSubmitError(null);
    setCurrentStep(2);
  }, []);

  const handleFinalSubmit = useCallback(
    async (step3Data: ForgotPasswordStep3Data): Promise<void> => {
      if (!step1Data || !step2Data) return;

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const resetToken = step2Data.passwordResetToken?.trim() || '';
        if (!PASSWORD_RESET_TOKEN_REGEX.test(resetToken)) {
          throw new Error('Reset session expired or invalid. Please verify OTP again.');
        }

        const response = await confirmPasswordReset({
          password_reset_token: resetToken,
          new_password: step3Data.password,
        }).unwrap();

        if (!response.success) {
          throw new Error(response.message || 'Failed to reset password. Please try again.');
        }

        setCurrentStep(4);
      } catch (err) {
        setSubmitError(getErrorMessage(err) || 'Failed to reset password. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [confirmPasswordReset, step1Data, step2Data]
  );

  const handleSignIn = useCallback(() => {
    void navigate('/login', { replace: false });
  }, [navigate]);

  // Step 4: Success Screen
  if (currentStep === 4) {
    return (
      <AuthSuccessMessage
        title="Password updated successfully"
        description="You can now sign in using your new password."
        buttonText="Go to Sign In"
        onButtonClick={handleSignIn}
      />
    );
  }

  return (
    <>
      {/* Back Button */}
      {currentStep > 1 && (
        <BackButton
          onClick={currentStep === 2 ? handleStep2Back : handleStep3Back}
          disabled={isSubmitting}
          className="absolute top-6 left-6 z-10"
        />
      )}

      <AuthCard>
        <FormLogo />

        <div className="relative flex w-full flex-col items-center gap-6">
          {currentStep === 1 && (
            <Step1Form onNext={handleStep1Next} defaultValues={step1Data || undefined} />
          )}
          {currentStep === 2 && step1Data && (
            <Step2Form
              onNext={handleStep2Next}
              email={step1Data.email}
              defaultValues={step2Data || undefined}
            />
          )}
          {currentStep === 3 && (
            <Step3Form
              onSubmit={handleFinalSubmit}
              isSubmitting={isSubmitting}
              submitError={submitError}
            />
          )}
        </div>
      </AuthCard>
    </>
  );
}
