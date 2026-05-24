import { Mail, KeyRound } from 'lucide-react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import FormField from '@/components/molecules/FormField';
import { ForgotPasswordLink } from '@/components/pages/Auth';
import type { LoginFormData } from '@/schemas/auth.schema';

interface LoginFormFieldsProps {
  /** React Hook Form register function */
  register: UseFormRegister<LoginFormData>;
  /** Form errors */
  errors: FieldErrors<LoginFormData>;
  /** Whether form is submitting */
  isSubmitting: boolean;
}

/**
 * Molecule component for login form fields
 * Combines email and password fields with forgot password link
 */
export default function LoginFormFields({
  register,
  errors,
  isSubmitting,
}: LoginFormFieldsProps): React.JSX.Element {
  return (
    <>
      {/* Email Field */}
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

      {/* Password Field */}
      <FormField
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="Enter Password"
        disabled={isSubmitting}
        required
        error={errors.password}
        leftIcon={KeyRound}
        labelRight={<ForgotPasswordLink />}
        {...register('password')}
      />
    </>
  );
}
