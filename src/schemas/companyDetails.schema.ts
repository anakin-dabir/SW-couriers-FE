import { z } from 'zod';
import { isPasswordRequirementsMet } from '@/lib/passwordRequirements';

/**
 * Company profile form validation schema (Settings > Company Details).
 * All fields are required.
 */
export const companyProfileSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  registeredNumber: z.string().min(1, 'Registered number is required'),
  registeredAddress: z.string().min(1, 'Registered address is required'),
  primaryContact: z.string().min(1, 'Primary contact is required'),
  accountsEmail: z
    .string()
    .min(1, 'Accounts email is required')
    .email('Please enter a valid email address'),
  vatNumber: z.string().min(1, 'VAT number is required'),
});

export type CompanyProfileFormData = z.infer<typeof companyProfileSchema>;

/**
 * Change password form validation schema (Security > Update Your Password).
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(1, 'New password is required').refine(isPasswordRequirementsMet, {
      message: 'PASSWORD_REQUIREMENTS_UNMET',
    }),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords must match',
    path: ['confirmNewPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

/** Active session for Security > Active Sessions list. */
export interface ActiveSession {
  id: string;
  device: string;
  ip: string;
  lastUsed: string;
  location: string;
}
