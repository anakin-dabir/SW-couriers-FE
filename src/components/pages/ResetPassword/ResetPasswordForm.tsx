import { useNavigate, useSearchParams } from 'react-router-dom';
import React, { useMemo, useState } from 'react';
import { KeyRound, Lock } from 'lucide-react';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/schemas/auth.schema';
import { useFormValidation } from '@/hooks/useFormValidation';
import { getErrorMessage, useConfirmPasswordResetMutation } from '@/store/api';
import { FormField } from '@/components/molecules';
import {
  AuthCard,
  AuthFooter,
  AuthHeader,
  AuthSuccessMessage,
  FormLogo,
  SubmitButton,
} from '@/components/pages/Auth';

/**
 * Organism component for reset password form
 * Contains all reset password logic and composition
 */
export default function ResetPasswordForm(): React.JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmPasswordReset] = useConfirmPasswordResetMutation();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = useFormValidation({
    schema: resetPasswordSchema,
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const passwordRequirements = useMemo(
    () => ({
      minLength: password ? password.length >= 8 : false,
      hasUppercase: password ? /[A-Z]/.test(password) : false,
      hasLowercase: password ? /[a-z]/.test(password) : false,
      hasNumber: password ? /\d/.test(password) : false,
    }),
    [password]
  );

  const onSubmit = async (data: ResetPasswordFormData): Promise<void> => {
    clearErrors();

    if (!token) {
      setError('root', {
        type: 'manual',
        message: 'Invalid or missing reset token. Please request a new password reset link.',
      });
      return;
    }

    try {
      const response = await confirmPasswordReset({
        password_reset_token: token,
        new_password: data.password,
      }).unwrap();
      if (!response.success) {
        throw new Error(response.message || 'Failed to reset password. Please try again.');
      }

      reset();
      setIsSuccess(true);
    } catch (err) {
      const errorMessage = getErrorMessage(err) || 'Failed to reset password. Please try again.';
      setError('root', {
        type: 'manual',
        message: errorMessage,
      });
      console.error('Reset password error:', err);
    }
  };

  const handleSignIn = (): void => {
    void navigate('/login', { replace: false });
  };

  if (isSuccess) {
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
    <AuthCard>
      <FormLogo />

      <AuthHeader title="Reset your password" subtitle="Enter your new password below" />

      <form
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e);
        }}
        aria-label="Reset password form"
        noValidate
        className="flex w-full flex-col gap-4"
      >
        <div className="flex flex-col">
          <FormField
            label="New Password"
            type="password"
            autoComplete="new-password"
            placeholder="Enter your new password"
            disabled={isSubmitting}
            required
            error={errors.password}
            leftIcon={Lock}
            {...register('password')}
          />

          {/* Password Requirements */}
          <div className="flex flex-col gap-1.5 mt-2">
            <ul className="flex flex-col gap-1 list-disc list-inside">
              <li
                className={`text-xs ${
                  passwordRequirements.minLength ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                At least 8 characters
              </li>
              <li
                className={`text-xs ${
                  passwordRequirements.hasUppercase ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                One uppercase letter
              </li>
              <li
                className={`text-xs ${
                  passwordRequirements.hasLowercase ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                One lowercase letter
              </li>
              <li
                className={`text-xs ${
                  passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                One number
              </li>
            </ul>
          </div>
        </div>

        <FormField
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          placeholder="Confirm your new password"
          disabled={isSubmitting}
          required
          error={errors.confirmPassword}
          leftIcon={KeyRound}
          {...register('confirmPassword')}
        />

        {errors.root && (
          <div className="text-error text-sm" role="alert">
            {errors.root.message}
          </div>
        )}

        <SubmitButton
          text="Reset Password"
          loadingText="Resetting..."
          isLoading={isSubmitting}
          ariaLabel="Reset password"
          ariaLabelLoading="Resetting password, please wait"
        />
      </form>

      <AuthFooter text="Remember your password?" linkText="Sign in" linkTo="/login" />
    </AuthCard>
  );
}
