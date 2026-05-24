import { z } from 'zod';

const addressSchema = z.object({
  line1: z.string().max(255),
  line2: z.string().max(255),
  country: z.string().max(100),
  region: z.string().max(100),
  city: z.string().max(100),
  postcode: z.string().max(20),
});

const pickupSchema = z.object({
  id: z.string(),
  label: z.string().max(255).optional(),
  line1: z.string().max(255),
  line2: z.string().max(255),
  country: z.string().max(100),
  region: z.string().max(100),
  city: z.string().max(100),
  postcode: z.string().max(20),
  isDefault: z.boolean(),
  sameAsRegistered: z.boolean(),
  sameAsTrading: z.boolean(),
});

/**
 * Client-side checks before PATCH. Server remains authoritative; 422 still mapped after submit.
 */
export const orgProfileClientSchema = z.object({
  tradingName: z
    .string()
    .refine(
      (s) => s.trim().length === 0 || s.trim().length >= 2,
      'Trading name must be at least 2 characters when provided.'
    ),
  legalEntityName: z.string().max(255),
  industry: z.string().max(100),
  companySize: z.string().max(80),
  dateOfIncorporation: z.string().max(32),
  website: z.string().max(500),
  businessDescription: z.string().max(500),
  phone: z.string().max(50),
  companiesHouseNumber: z
    .string()
    .min(1, 'Companies House number is required.')
    .regex(
      /^(?:[0-9]{8}|[A-Za-z]{2}[0-9]{6})$/,
      'Companies House number must be exactly 8 alphanumeric characters (e.g. 12345678 or OC123456).'
    ),
  eoriNumber: z.string().max(100),
  vatNumber: z.string().max(50),
  registeredAddress: addressSchema,
  tradingAddressSameAsRegistered: z.boolean(),
  tradingAddress: addressSchema,
  pickupAddresses: z.array(pickupSchema),
});

export type OrgProfileClientFormValues = z.infer<typeof orgProfileClientSchema>;

export function flattenZodErrorToFieldMap(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.length > 0 ? issue.path.join('.') : '__root';
    if (out[path] === undefined) {
      out[path] = issue.message;
    }
  }
  return out;
}
