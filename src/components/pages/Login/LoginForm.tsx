import { useNavigate, useLocation } from 'react-router-dom';
import type React from 'react';
import { useFormValidation } from '@/hooks/useFormValidation';
import { loginSchema, type LoginFormData } from '@/schemas/auth.schema';
import { useAppDispatch } from '@/store/hooks';
import { useLoginMutation, getErrorMessage } from '@/store/api';
import { setCredentials } from '@/store/slices/authSlice';
import { ErrorAlert } from '@/components/atoms';
import { AuthCard, AuthHeader, FormLogo } from '@/components/pages/Auth';
import LoginFormFields from './LoginFormFields';
import LoginFormActions from './LoginFormActions';
import { mapBriefToAuthUser } from '@/types/auth';

/**
 * Organism component for login form
 * Contains all login form logic and composition
 */
export default function LoginForm(): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [login] = useLoginMutation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = useFormValidation({
    schema: loginSchema,
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Watch form values to enable/disable button
  const emailValue = watch('email');
  const passwordValue = watch('password');
  const isFormValid = emailValue && passwordValue && !errors.email && !errors.password;

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    clearErrors();

    try {
      const response = await login({ email: data.email, password: data.password }).unwrap();

      if (!response.success || !response.tokens?.access_token || !response.data?.id) {
        throw new Error(response.message || 'Login failed. Please try again.');
      }

      const firstName = response.data.first_name?.trim() ?? '';
      const lastName = response.data.last_name?.trim() ?? '';
      const fullName = `${firstName} ${lastName}`.trim();
      const userName = fullName || response.data.email?.split('@')[0] || 'User';
      const organizationId =
        response.data.organization_id ?? response.data.organization?.id ?? null;
      const initialUser = mapBriefToAuthUser({
        id: response.data.id,
        email: response.data.email,
        first_name: firstName || null,
        last_name: lastName || null,
        role: response.data.role ?? null,
        organization_id: organizationId,
        created_at: response.data.created_at ?? null,
      });

      dispatch(
        setCredentials({
          accessToken: response.tokens.access_token,
          loginResponse: response,
          user: {
            ...initialUser,
            name: userName,
          },
        })
      );

      reset();
      void navigate(from, { replace: true });
    } catch (err) {
      const errorMessage = getErrorMessage(err) || 'Login failed. Please try again.';
      setError('root', {
        type: 'manual',
        message: errorMessage,
      });
      console.error('Login error:', err);
    }
  };

  return (
    <AuthCard>
      <FormLogo />
      <AuthHeader title="Welcome back!" subtitle="Let's get you signed in!" />

      {/* Error Alert */}
      {errors.root && <ErrorAlert id="login-error" message={errors.root.message || ''} />}

      {/* Form */}
      <form
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e);
        }}
        aria-label="Login form"
        noValidate
        className="flex w-full flex-col gap-4"
      >
        <LoginFormFields register={register} errors={errors} isSubmitting={isSubmitting} />
        <LoginFormActions isSubmitting={isSubmitting} isFormValid={!!isFormValid} />
      </form>
    </AuthCard>
  );
}
