import { AlertCircle, Check, CheckCircle, KeyRound, Link2Off, Mail, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import FormField from '@/components/molecules/FormField';
import { FormLogo } from '@/components/pages/Auth';
import { LoginForm } from '@/components/pages/Login';
import { useFormValidation } from '@/hooks/useFormValidation';
import { notifyApiError, notifyApiSuccess } from '@/lib/notify';
import { forgotPasswordStep1Schema, forgotPasswordStep3Schema } from '@/schemas/auth.schema';
import {
  getErrorMessage,
  useActivateInviteMutation,
  useRequestInviteResendMutation,
  useValidateInviteTokenMutation,
} from '@/store/api';

export default function NewLoginScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get('token');
  const isExpired =
    searchParams.get('isExpired') === 'true' || searchParams.get('expired') === 'true';
  const isSetPasswordStep = searchParams.get('step') === 'set-password';
  const isSuccessStep = searchParams.get('step') === 'success';
  const isInlineLoginStep = searchParams.get('step') === 'login';
  const [hasInvalidInvite, setHasInvalidInvite] = useState(false);
  const [activateInvite] = useActivateInviteMutation();
  const [validateInviteToken, { isLoading: isValidatingInvite }] = useValidateInviteTokenMutation();
  const [requestInviteResend, { isLoading: isRequestingInviteResend }] =
    useRequestInviteResendMutation();

  const welcomeVariant: 'expired' | 'invalid' | 'active' =
    isExpired || hasInvalidInvite ? 'expired' : !token ? 'invalid' : 'active';

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    reset: resetEmailForm,
    formState: { errors: emailErrors, isSubmitting: isSubmittingEmail, isValid: isEmailValid },
  } = useFormValidation({
    schema: forgotPasswordStep1Schema,
    defaultValues: {
      email: '',
    },
    mode: 'onChange',
  });

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isValid },
  } = useFormValidation({
    schema: forgotPasswordStep3Schema,
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const passwordValue = watch('password') || '';

  const passwordRules = [
    { label: 'At least 8 characters', isMet: passwordValue.length >= 8 },
    { label: 'One uppercase letter', isMet: /[A-Z]/.test(passwordValue) },
    { label: 'One lower case letter', isMet: /[a-z]/.test(passwordValue) },
    { label: 'One number', isMet: /\d/.test(passwordValue) },
    {
      label: 'One symbol (special character)',
      isMet: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(passwordValue),
    },
  ];

  const openSetPasswordStep = (): void => {
    const params = new URLSearchParams(searchParams);
    params.set('step', 'set-password');
    setSearchParams(params);
  };

  const closeSetPasswordStep = (): void => {
    const params = new URLSearchParams(searchParams);
    params.delete('step');
    setSearchParams(params);
  };

  const onSavePassword = async (password: string): Promise<void> => {
    clearErrors();

    if (!token) {
      setError('root', {
        type: 'manual',
        message: 'Invalid or missing invitation token. Please use the link from your email.',
      });
      return;
    }

    try {
      const response = await activateInvite({
        token,
        password,
      }).unwrap();

      if (!response.success) {
        throw new Error(response.message || 'Could not save your password. Please try again.');
      }

      const params = new URLSearchParams(searchParams);
      params.set('step', 'success');
      setSearchParams(params);
    } catch (err) {
      const message = getErrorMessage(err) || 'Could not save your password. Please try again.';
      setError('root', { type: 'manual', message });
      console.error('Accept invite / set password error:', err);
    }
  };

  const goToLogin = (): void => {
    void navigate('/login', { replace: true });
  };

  const title =
    welcomeVariant === 'expired'
      ? 'Link Expired!'
      : welcomeVariant === 'invalid'
        ? 'Invalid invitation'
        : 'Welcome!';
  const description =
    welcomeVariant === 'expired'
      ? ['This link is no longer valid. Please request a new one.']
      : welcomeVariant === 'invalid'
        ? [
            'This invitation link is missing a token or is not valid.',
            'Ask your administrator for a new invitation email.',
          ]
        : [
            'To get started, please set up your password for your account.',
            'This helps you securely access your account.',
          ];
  const onWelcomeSecondaryClick = (): void => {
    goToLogin();
  };

  const onSetPasswordClick = async (): Promise<void> => {
    if (!token) {
      setHasInvalidInvite(true);
      return;
    }

    try {
      const response = await validateInviteToken({ token }).unwrap();
      if (!response.success) {
        throw new Error(response.message || 'Invalid or expired invite link');
      }

      setHasInvalidInvite(false);
      openSetPasswordStep();
    } catch (err) {
      notifyApiError(err);
      setHasInvalidInvite(true);
    }
  };

  const onRequestInviteSubmit = async (data: { email: string }): Promise<void> => {
    try {
      const result = await requestInviteResend({
        email: data.email.trim().toLowerCase(),
      }).unwrap();
      if (result.success) {
        notifyApiSuccess(result);
        resetEmailForm();
      } else {
        notifyApiError(result);
      }
    } catch (err) {
      notifyApiError(err);
    }
  };

  if (isInlineLoginStep) {
    return (
      <div className="h-screen w-full bg-form-surface p-5">
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-form-border-light bg-form-background p-4">
          <LoginForm />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-form-surface p-5">
      <div className="relative h-full w-full overflow-hidden rounded-xl border border-form-border-light bg-form-background">
        <div className="absolute left-1/2 top-1/2 flex w-full max-w-[460px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-[50px] rounded-[14px] border border-form-border bg-white px-6 pb-6 pt-12 shadow-sm">
          <FormLogo className="h-[52px] w-[82px]" />

          <div className="flex w-full flex-col items-center gap-[50px]">
            {isSuccessStep ? (
              <div className="flex w-full flex-col gap-[50px]">
                <div className="flex w-full flex-col items-center gap-[18px]">
                  <div className="relative flex h-[100px] w-[100px] items-center justify-center rounded-full bg-linear-to-b from-[#ededf1] to-white">
                    <KeyRound className="h-11 w-11 text-[#d2d5dc]" strokeWidth={1.8} />
                    <span className="absolute bottom-[16px] right-[12px]">
                      <CheckCircle className="h-7 w-7 fill-success text-success" />
                      <Check className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white" />
                    </span>
                  </div>

                  <div className="flex w-full flex-col items-center gap-1.5 text-center">
                    <Typography
                      variant="h3"
                      color="text"
                      weight="semibold"
                      align="center"
                      className="text-2xl leading-none tracking-tight text-form-title"
                    >
                      Password Set Successfully!
                    </Typography>
                    <Typography
                      variant="caption"
                      color="muted"
                      align="center"
                      className="text-sm leading-5 text-form-subtitle"
                    >
                      Your account is ready. You can now log in using your new password.
                    </Typography>
                  </div>
                </div>

                <div className="flex w-full flex-col">
                  <Button type="button" className="h-10 w-full" onClick={goToLogin}>
                    Go to Login
                  </Button>
                </div>
              </div>
            ) : isSetPasswordStep ? (
              <form
                className="flex w-full flex-col gap-[50px]"
                onSubmit={(e) => {
                  void handleSubmit((data) => onSavePassword(data.password))(e);
                }}
                noValidate
              >
                <div className="flex w-full flex-col items-center gap-[18px]">
                  <div className="flex w-full flex-col items-center gap-1.5 text-center">
                    <Typography
                      variant="h3"
                      color="text"
                      weight="semibold"
                      align="center"
                      className="text-2xl leading-none tracking-tight text-form-title"
                    >
                      Set Your Password
                    </Typography>
                    <Typography
                      variant="caption"
                      color="muted"
                      align="center"
                      className="text-sm leading-5 text-form-subtitle"
                    >
                      Choose a strong password to secure your account.
                    </Typography>
                  </div>

                  <div className="flex w-full flex-col gap-4">
                    <div className="flex w-full flex-col gap-2">
                      <FormField
                        label="New Password"
                        type="password"
                        placeholder="Enter New Password"
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        leftIcon={KeyRound}
                        error={errors.password}
                        {...register('password')}
                      />
                      <ul className="list-disc pl-5 text-sm text-form-subtitle">
                        {passwordRules.map((rule) => (
                          <li key={rule.label} className={rule.isMet ? 'text-success' : ''}>
                            {rule.label}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <FormField
                      label="Confirm Password"
                      type="password"
                      placeholder="Confirm Password"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      leftIcon={KeyRound}
                      error={errors.confirmPassword}
                      {...register('confirmPassword')}
                    />
                    {errors.root && (
                      <Typography variant="caption" color="error" role="alert">
                        {errors.root.message}
                      </Typography>
                    )}
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3">
                  <Button type="submit" className="h-10 w-full" disabled={!isValid || isSubmitting}>
                    Save Password
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full bg-white"
                    onClick={closeSetPasswordStep}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : welcomeVariant === 'expired' ? (
              <form
                className="flex w-full flex-col gap-4"
                onSubmit={(e) => {
                  void handleSubmitEmail(onRequestInviteSubmit)(e);
                }}
                noValidate
              >
                <div className="flex w-full flex-col gap-4">
                  <div className="relative mx-auto flex h-[100px] w-[100px] items-center justify-center rounded-full bg-linear-to-b from-[#ededf1] to-white">
                    <Link2Off className="h-[48px] w-[48px] text-[#d2d5dc]" strokeWidth={1.6} />
                    <span className="absolute bottom-[18px] right-[14px]">
                      <AlertCircle className="h-[22px] w-[22px] fill-error text-white" />
                    </span>
                  </div>

                  <div className="flex w-full flex-col items-center gap-1.5 text-center">
                    <Typography
                      variant="h3"
                      color="text"
                      weight="semibold"
                      align="center"
                      className="text-2xl leading-none tracking-tight text-form-title"
                    >
                      {title}
                    </Typography>
                    {description.map((line) => (
                      <Typography
                        key={line}
                        variant="caption"
                        color="muted"
                        align="center"
                        className="text-sm leading-5 text-form-subtitle"
                      >
                        {line}
                      </Typography>
                    ))}
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3">
                  <div className="mb-4">
                    <FormField
                      label="Email"
                      type="email"
                      placeholder="Enter Email"
                      autoComplete="email"
                      disabled={isSubmittingEmail || isRequestingInviteResend}
                      leftIcon={Mail}
                      error={emailErrors.email}
                      {...registerEmail('email')}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="h-10 w-full"
                    disabled={!isEmailValid || isSubmittingEmail || isRequestingInviteResend}
                  >
                    {isRequestingInviteResend ? 'Sending…' : 'Request Link'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full bg-white"
                    onClick={onWelcomeSecondaryClick}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex w-full flex-col items-center gap-[50px]">
                <div className="flex w-full flex-col items-center gap-[18px]">
                  <div className="relative flex h-[100px] w-[100px] items-center justify-center rounded-full bg-linear-to-b from-[#ededf1] to-white">
                    {welcomeVariant !== 'active' ? (
                      <>
                        <Link2Off className="h-[48px] w-[48px] text-[#d2d5dc]" strokeWidth={1.6} />
                        <span className="absolute bottom-[18px] right-[14px]">
                          <AlertCircle className="h-[22px] w-[22px] fill-error text-white" />
                        </span>
                      </>
                    ) : (
                      <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#dddddd]">
                        <UserRound className="h-8 w-8 text-[#b5b5b5]" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>

                  <div className="flex w-full flex-col items-center gap-1.5 text-center">
                    <Typography
                      variant="h3"
                      color="text"
                      weight="semibold"
                      align="center"
                      className="text-2xl leading-none tracking-tight text-form-title"
                    >
                      {title}
                    </Typography>
                    {description.map((line) => (
                      <Typography
                        key={line}
                        variant="caption"
                        color="muted"
                        align="center"
                        className="text-sm leading-5 text-form-subtitle"
                      >
                        {line}
                      </Typography>
                    ))}
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3">
                  {welcomeVariant !== 'invalid' && (
                    <Button
                      type="button"
                      className="h-10 w-full"
                      onClick={() => {
                        void onSetPasswordClick();
                      }}
                      disabled={isValidatingInvite}
                    >
                      {isValidatingInvite ? 'Validating...' : 'Set Password'}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full bg-white"
                    onClick={onWelcomeSecondaryClick}
                  >
                    {welcomeVariant === 'invalid' ? 'Go to Sign In' : 'Cancel'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
