import { z } from 'zod';

export const inviteMemberSchema = z.object({
  fullName: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() : value),
    z
      .string()
      .min(1, 'Full name is required')
      .max(100, 'Full name must be less than 100 characters')
  ),
  email: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
    z.string().min(1, 'Email is required').email('Please enter a valid email address')
  ),
  role: z.enum(['Admin', 'Manager', 'Support'], {
    message: 'Please select a role',
  }),
  phoneNumber: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() : value),
    z.string().min(1, 'Phone number is required')
  ),
});

export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;
