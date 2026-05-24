import { useNavigate } from 'react-router-dom';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useFormValidation } from '@/hooks/useFormValidation';
import { Mail, KeyRound, User } from 'lucide-react';
import {
  registerStep1Schema,
  registerStep3Schema,
  type RegisterStep1Data,
  type RegisterStep2Data,
  type RegisterStep3Data,
} from '@/schemas/auth.schema';
import { usePasswordStrengthRing } from '@/hooks';
import { setPendingAuth } from '@/lib/cookies';
import { Checkbox } from '@/components/atoms/checkbox';
import { PasswordStrengthIndicator, StepIndicator, Typography } from '@/components/atoms';
import { FormField } from '@/components/molecules';
import {
  AuthCard,
  AuthFooter,
  AuthHeader,
  BackButton,
  FormLogo,
  SubmitButton,
} from '@/components/pages/Auth';
import { BraintreeProvider, useBraintree } from '@/context/BraintreeContext';
import dropin from 'braintree-web-drop-in';

type RegistrationStep = 1 | 2 | 3;

// Step 1: Create Account Form
function Step1Form({
  onNext,
  defaultValues,
}: {
  onNext: (data: RegisterStep1Data) => void;
  defaultValues?: Partial<RegisterStep1Data>;
}): React.JSX.Element {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useFormValidation({
    schema: registerStep1Schema,
    defaultValues: {
      fullName: defaultValues?.fullName || '',
      email: defaultValues?.email || '',
      password: defaultValues?.password || '',
      confirmPassword: defaultValues?.confirmPassword || '',
      agreeToTerms: defaultValues?.agreeToTerms || false,
    },
  });

  const password = watch('password');
  const agreeToTerms = watch('agreeToTerms');
  const passwordRingClass = usePasswordStrengthRing(password);

  return (
    <>
      <AuthHeader
        title="Create your account"
        subtitle="Sign up to SW Couriers Portal. Add your email, set a password and get started."
      />

      <form
        onSubmit={(e) => {
          void handleSubmit(onNext)(e);
        }}
        noValidate
        className="flex w-full flex-col gap-4"
      >
        {/* Full Name */}
        <FormField
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Enter your full name"
          disabled={isSubmitting}
          required
          error={errors.fullName}
          leftIcon={User}
          {...register('fullName')}
        />

        {/* Email */}
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="Enter your email"
          disabled={isSubmitting}
          required
          error={errors.email}
          leftIcon={Mail}
          {...register('email')}
        />

        {/* Password with strength indicator */}
        <div className="flex flex-col gap-2">
          <FormField
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Create Password"
            disabled={isSubmitting}
            required
            error={errors.password}
            leftIcon={KeyRound}
            className={passwordRingClass}
            {...register('password')}
          />
          <PasswordStrengthIndicator password={password} />
        </div>

        {/* Confirm Password */}
        <FormField
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          placeholder="Confirm Password"
          disabled={isSubmitting}
          required
          error={errors.confirmPassword}
          leftIcon={KeyRound}
          {...register('confirmPassword')}
        />

        {/* Terms Checkbox */}
        <div className="flex flex-col gap-2">
          <Checkbox
            id="agree-terms"
            label="I agree to Terms & Privacy Policy"
            checked={agreeToTerms}
            onChange={(e) => setValue('agreeToTerms', e.target.checked)}
          />
          {errors.agreeToTerms && (
            <Typography variant="caption" color="error">
              {errors.agreeToTerms.message}
            </Typography>
          )}
        </div>

        {/* Next Button */}
        <SubmitButton text="Next" loadingText="Processing..." isLoading={isSubmitting} />
      </form>
    </>
  );
}

// Step 2: Braintree Drop-in Payment Form
function Step2Form({
  onNext,
}: {
  onNext: (data: RegisterStep2Data) => void;
  defaultValues?: Partial<RegisterStep2Data>;
}): React.JSX.Element {
  const { clientToken, isLoading: tokenLoading, error: tokenError, refetch } = useBraintree();
  const containerRef = useRef<HTMLDivElement>(null);
  const dropinInstanceRef = useRef<Awaited<ReturnType<typeof dropin.create>> | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [dropinError, setDropinError] = useState<string | null>(null);
  // Mount container only after token is ready so we always have a fresh empty DOM node for Braintree
  const showContainer = Boolean(clientToken);

  // Create Braintree Drop-in when container is mounted; defer create so ref is set and DOM is committed
  useEffect(() => {
    if (!clientToken || !showContainer) return;

    let mounted = true;

    const run = async (): Promise<void> => {
      setDropinError(null);
      const prev = dropinInstanceRef.current;
      dropinInstanceRef.current = null;
      if (prev && typeof prev.teardown === 'function') {
        await prev.teardown();
      }
      if (!mounted) return;

      // Wait for next frame so the container div is in the DOM and ref is attached
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });
      if (!mounted) return;

      const el = containerRef.current;
      if (!el) return;
      if (el.hasChildNodes()) {
        el.textContent = '';
      }

      try {
        const instance = await dropin.create({
          authorization: clientToken,
          container: el,
          card: {
            cardholderName: { required: true },
            overrides: {
              styles: {
                input: {
                  'font-size': '14px',
                  'font-family': 'Inter, system-ui, sans-serif',
                  color: '#030303',
                  'line-height': '20px',
                  padding: '6px 12px',
                  'box-sizing': 'border-box',
                },
                ':focus': {
                  color: '#030303',
                  outline: 'none',
                },
                '.invalid': {
                  color: '#ef4444',
                },
              },
            },
          },
        });
        if (mounted) dropinInstanceRef.current = instance;
      } catch (err: unknown) {
        if (mounted)
          setDropinError(err instanceof Error ? err.message : 'Failed to load payment form.');
      }
    };

    void run();

    return () => {
      mounted = false;
      const instance = dropinInstanceRef.current;
      dropinInstanceRef.current = null;
      if (instance && typeof instance.teardown === 'function') {
        void instance.teardown().catch(() => {});
      }
    };
  }, [clientToken, showContainer]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setDropinError(null);
      const instance = dropinInstanceRef.current;
      if (!instance) {
        setDropinError('Payment form is not ready. Please wait or refresh.');
        return;
      }
      setIsRequesting(true);
      instance
        .requestPaymentMethod()
        .then((payload) => {
          onNext({ paymentMethodNonce: payload.nonce });
        })
        .catch((err: Error) => {
          setDropinError(err?.message ?? 'Please complete the payment form.');
        })
        .finally(() => {
          setIsRequesting(false);
        });
    },
    [onNext]
  );

  if (tokenLoading) {
    return (
      <>
        <AuthHeader
          title="Set Up Your Payment"
          subtitle="Securely add your card details to pay for shipments and manage billing effortlessly."
        />
        <div className="flex w-full flex-col items-center justify-center gap-4 py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          <Typography variant="body" className="text-form-subtitle">
            Loading secure payment form...
          </Typography>
        </div>
      </>
    );
  }

  if (tokenError) {
    return (
      <>
        <AuthHeader
          title="Set Up Your Payment"
          subtitle="Securely add your card details to pay for shipments and manage billing effortlessly."
        />
        <div className="flex w-full flex-col gap-4 rounded-md border border-red-200 bg-red-50 p-4">
          <Typography variant="body" color="error">
            {tokenError.message}
          </Typography>
          <Typography variant="caption" className="text-form-subtitle">
            Configure your backend to provide a Braintree client token at{' '}
            <code className="rounded bg-white px-1">/api/braintree/client-token</code> or set{' '}
            <code className="rounded bg-white px-1">VITE_BRAINTREE_CLIENT_TOKEN_URL</code>.
          </Typography>
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
          >
            Retry
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <AuthHeader
        title="Set Up Your Payment"
        subtitle="Securely add your card details to pay for shipments and manage billing effortlessly. Powered by Braintree."
      />

      <form onSubmit={handleSubmit} noValidate className="flex w-full flex-col gap-4">
        {showContainer && (
          <div
            id="braintree-dropin-container"
            ref={containerRef}
            className="min-h-[220px]"
            key="braintree-dropin"
          />
        )}
        {dropinError && (
          <Typography variant="caption" color="error">
            {dropinError}
          </Typography>
        )}
        <SubmitButton text="Next" loadingText="Verifying payment..." isLoading={isRequesting} />
      </form>
    </>
  );
}

// Step 3: Billing Address Form
function Step3Form({
  onSubmit,
  defaultValues,
  isSubmitting: parentIsSubmitting,
}: {
  onSubmit: (data: RegisterStep3Data) => void | Promise<void>;
  defaultValues?: Partial<RegisterStep3Data>;
  isSubmitting: boolean;
}): React.JSX.Element {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useFormValidation({
    schema: registerStep3Schema,
    defaultValues: {
      addressLine1: defaultValues?.addressLine1 || '',
      addressLine2: defaultValues?.addressLine2 || '',
      houseNumber: defaultValues?.houseNumber || '',
      postalCode: defaultValues?.postalCode || '',
      city: defaultValues?.city || '',
      country: defaultValues?.country || '',
    },
  });

  const city = watch('city');
  const country = watch('country');
  const submitting = isSubmitting || parentIsSubmitting;

  return (
    <>
      <AuthHeader
        title="Set Up Your Billing Address"
        subtitle="Enter your billing address to make payments, invoices, and deliveries seamless."
      />

      <form
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e);
        }}
        noValidate
        className="flex w-full flex-col gap-4"
      >
        {/* Address Line 1 */}
        <FormField
          label="Address Line 1"
          type="text"
          autoComplete="address-line1"
          placeholder="e.g. Street address, P.O. box, company name"
          disabled={submitting}
          required
          error={errors.addressLine1}
          {...register('addressLine1')}
        />

        {/* Address Line 2 (Optional) */}
        <FormField
          label="Address Line 2 (Optional)"
          type="text"
          autoComplete="address-line2"
          placeholder="e.g. Apartment, suite, unit, building, floor"
          disabled={submitting}
          error={errors.addressLine2}
          {...register('addressLine2')}
        />

        {/* House Number and Postal Code Row */}
        <div className="flex gap-4">
          <div className="flex-1">
            <FormField
              label="House Number"
              type="text"
              placeholder="e.g. 221B"
              disabled={submitting}
              required
              error={errors.houseNumber}
              {...register('houseNumber')}
            />
          </div>
          <div className="flex-1">
            <FormField
              label="Postal Code / ZIP Code"
              type="text"
              autoComplete="postal-code"
              placeholder="e.g. 90210"
              disabled={submitting}
              required
              error={errors.postalCode}
              {...register('postalCode')}
            />
          </div>
        </div>

        {/* City and Country Row */}
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <Typography
              variant="label"
              htmlFor="city-select"
              className="text-sm font-medium leading-none text-form-title"
            >
              City / Town <span className="text-red-500">*</span>
            </Typography>
            <select
              id="city-select"
              value={city}
              onChange={(e) => setValue('city', e.target.value)}
              disabled={submitting}
              className="h-10 w-full rounded-md border border-form-border-light bg-white px-3 py-2 text-sm font-normal text-form-title focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <option value="">Select city/ town</option>
              <option value="London">London</option>
              <option value="Manchester">Manchester</option>
              <option value="Birmingham">Birmingham</option>
              <option value="Leeds">Leeds</option>
              <option value="Glasgow">Glasgow</option>
              <option value="Liverpool">Liverpool</option>
              <option value="Edinburgh">Edinburgh</option>
            </select>
            {errors.city && (
              <Typography variant="caption" color="error">
                {errors.city.message}
              </Typography>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <Typography
              variant="label"
              htmlFor="country-select"
              className="text-sm font-medium leading-none text-form-title"
            >
              Country <span className="text-red-500">*</span>
            </Typography>
            <select
              id="country-select"
              value={country}
              onChange={(e) => setValue('country', e.target.value)}
              disabled={submitting}
              className="h-10 w-full rounded-md border border-form-border-light bg-white px-3 py-2 text-sm font-normal text-form-title focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <option value="">Select country</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Netherlands">Netherlands</option>
            </select>
            {errors.country && (
              <Typography variant="caption" color="error">
                {errors.country.message}
              </Typography>
            )}
          </div>
        </div>

        {/* Continue Button */}
        <SubmitButton text="Continue" loadingText="Creating account..." isLoading={submitting} />
      </form>
    </>
  );
}

/**
 * Organism component for registration multi-step form
 * Contains all registration logic and composition
 */
export default function RegisterForm(): React.JSX.Element {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [step1Data, setStep1Data] = useState<RegisterStep1Data | null>(null);
  const [step2Data, setStep2Data] = useState<RegisterStep2Data | null>(null);

  const handleStep1Next = useCallback((data: RegisterStep1Data) => {
    setStep1Data(data);
    setCurrentStep(2);
  }, []);

  const handleStep2Next = useCallback((data: RegisterStep2Data) => {
    setStep2Data(data);
    setCurrentStep(3);
  }, []);

  const handleStep2Back = useCallback(() => {
    setCurrentStep(1);
  }, []);

  const handleStep3Back = useCallback(() => {
    setCurrentStep(2);
  }, []);

  const handleFinalSubmit = useCallback(
    async (step3Data: RegisterStep3Data): Promise<void> => {
      if (!step1Data || !step2Data) return;

      setIsSubmitting(true);

      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // step2Data contains paymentMethodNonce from Braintree Drop-in; send to your server to charge/vault
        console.log('Registration data:', {
          ...step1Data,
          paymentMethodNonce: step2Data.paymentMethodNonce,
          ...step3Data,
        });

        const timestamp = Math.floor(Math.random() * 1000000);
        const mockAccessToken = `mock-access-token-${timestamp}`;
        const mockUser = {
          id: '1',
          email: step1Data.email,
          name: step1Data.fullName,
        };

        setPendingAuth({
          accessToken: mockAccessToken,
          user: mockUser,
        });

        void navigate('/otp', {
          state: {
            email: step1Data.email,
            from: '/dashboard',
          },
          replace: false,
        });
      } catch (err) {
        console.error('Registration error:', err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [step1Data, step2Data, navigate]
  );

  return (
    <BraintreeProvider>
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
        <StepIndicator currentStep={currentStep} totalSteps={3} />

        <div className="relative flex w-full flex-col items-center gap-6">
          {currentStep === 1 && (
            <Step1Form onNext={handleStep1Next} defaultValues={step1Data || undefined} />
          )}
          {currentStep === 2 && (
            <Step2Form onNext={handleStep2Next} defaultValues={step2Data || undefined} />
          )}
          {currentStep === 3 && (
            <Step3Form onSubmit={handleFinalSubmit} isSubmitting={isSubmitting} />
          )}
        </div>

        <AuthFooter text="Already have an account?" linkText="Sign in" linkTo="/login" />
      </AuthCard>
    </BraintreeProvider>
  );
}
