import { z } from 'zod';

/**
 * Login form validation schema
 *
 * Validates email and password fields for login form.
 * Uses zod for schema validation.
 */
export const loginSchema = z.object({
  email: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim().toLowerCase() : val),
    z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .max(255, 'Email must be less than 255 characters')
  ),

  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be less than 128 characters'),
});

/**
 * Type inference for login form data
 */
export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Step 1: Account Creation Schema
 * Full name, Email, Password, Confirm Password, Terms agreement
 */
export const registerStep1Schema = z
  .object({
    fullName: z.preprocess(
      (val) => (typeof val === 'string' ? val.trim() : val),
      z
        .string()
        .min(1, 'Full name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters')
    ),

    email: z.preprocess(
      (val) => (typeof val === 'string' ? val.trim().toLowerCase() : val),
      z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address')
        .max(255, 'Email must be less than 255 characters')
    ),

    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/,
        'Password must contain uppercase, lowercase, number and symbol'
      ),

    confirmPassword: z.string().min(1, 'Please confirm your password'),

    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the Terms & Privacy Policy',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

export type RegisterStep1Data = z.infer<typeof registerStep1Schema>;

/**
 * Step 2: Payment Setup Schema (Braintree Drop-in)
 * Payment method nonce from Braintree Drop-in UI; card details are never stored client-side.
 */
export const registerStep2Schema = z.object({
  /** Braintree payment method nonce from Drop-in requestPaymentMethod() */
  paymentMethodNonce: z
    .string()
    .min(1, 'Payment method is required. Please complete the payment form above.'),
});

export type RegisterStep2Data = z.infer<typeof registerStep2Schema>;

/**
 * Step 3: Billing Address Schema
 * Address lines, House number, Postal code, City, Country
 */
export const registerStep3Schema = z.object({
  addressLine1: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().min(1, 'Address is required').max(255, 'Address must be less than 255 characters')
  ),

  addressLine2: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().max(255, 'Address must be less than 255 characters').optional()
  ),

  houseNumber: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z
      .string()
      .min(1, 'House number is required')
      .max(20, 'House number must be less than 20 characters')
  ),

  postalCode: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z
      .string()
      .min(1, 'Postal code is required')
      .max(20, 'Postal code must be less than 20 characters')
  ),

  city: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().min(1, 'City is required').max(100, 'City must be less than 100 characters')
  ),

  country: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().min(1, 'Country is required').max(100, 'Country must be less than 100 characters')
  ),
});

export type RegisterStep3Data = z.infer<typeof registerStep3Schema>;

/**
 * Combined Registration Form Data for all steps
 */
export type RegisterFormData = RegisterStep1Data & RegisterStep2Data & RegisterStep3Data;

/**
 * Legacy register schema (for backward compatibility)
 */
export const registerSchema = z
  .object({
    name: z.preprocess(
      (val) => (typeof val === 'string' ? val.trim() : val),
      z
        .string()
        .min(1, 'Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters')
    ),

    email: z.preprocess(
      (val) => (typeof val === 'string' ? val.trim().toLowerCase() : val),
      z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address')
        .max(255, 'Email must be less than 255 characters')
    ),

    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),

    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

/**
 * Step 1: Forgot Password - Enter Email Schema
 */
export const forgotPasswordStep1Schema = z.object({
  email: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim().toLowerCase() : val),
    z.string().min(1, 'Email is required').email('Please enter a valid email address')
  ),
});

export type ForgotPasswordStep1Data = z.infer<typeof forgotPasswordStep1Schema>;

/**
 * Step 2: Forgot Password - OTP Verification Schema
 */
export const forgotPasswordStep2Schema = z.object({
  otp: z
    .string()
    .min(1, 'Verification code is required')
    .length(6, 'Verification code must be exactly 6 digits')
    .regex(/^\d+$/, 'Verification code must contain only numbers'),
});

export type ForgotPasswordStep2Data = z.infer<typeof forgotPasswordStep2Schema>;

/**
 * Step 3: Forgot Password - Update Password Schema
 */
export const forgotPasswordStep3Schema = z
  .object({
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/,
        'Password must contain uppercase, lowercase, number and symbol'
      ),

    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ForgotPasswordStep3Data = z.infer<typeof forgotPasswordStep3Schema>;

/**
 * Legacy forgot password schema (for backward compatibility)
 */
export const forgotPasswordSchema = forgotPasswordStep1Schema;

/**
 * Type inference for forgot password form data
 */
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset password form validation schema (for future use)
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),

    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

/**
 * Type inference for reset password form data
 */
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * OTP verification form validation schema
 */
export const otpSchema = z.object({
  otp: z
    .string()
    .min(1, 'OTP is required')
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
});

/**
 * Type inference for OTP form data
 */
export type OtpFormData = z.infer<typeof otpSchema>;
