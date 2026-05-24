import { z } from 'zod';

export const deliveryStopDetailsSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(32, 'Max 32 characters'),
  lastName: z.string().trim().min(1, 'Last name is required').max(32, 'Max 32 characters'),
  contactNumber: z.string().trim().min(1, 'Contact number is required'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  addressLine1: z.string().trim().min(1, 'Address line 1 is required').max(48, 'Max 48 characters'),
  addressLine2: z.string().trim().max(48, 'Max 48 characters').optional().or(z.literal('')),
  city: z.string().trim().min(1, 'City is required'),
  postalCode: z.string().trim().min(1, 'Postal code is required').max(16, 'Max 16 characters'),
});

export type DeliveryStopDetailsFormData = z.infer<typeof deliveryStopDetailsSchema>;

function packageNumeric(label: string, max?: number, unit = ''): z.ZodSchema<string> {
  return z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine((v) => Number.isFinite(Number(v)) && Number(v) > 0, {
      message: `${label} must be greater than 0`,
    })
    .refine((v) => (max == null ? true : Number(v) <= max), {
      message: max == null ? '' : `Max ${max}${unit}`,
    });
}

export interface PackageLimits {
  max_package_length?: number | null;
  max_package_width?: number | null;
  max_package_height?: number | null;
  max_package_weight?: number | null;
}

export interface PackageEditFormData {
  id: string;
  label: string;
  length: string;
  width: string;
  height: string;
  weight: string;
  value: string;
}

export function buildPackageSchema(limits?: PackageLimits): z.ZodSchema<PackageEditFormData> {
  return z.object({
    id: z.string(),
    label: z.string(),
    length: packageNumeric('Length', limits?.max_package_length ?? undefined, 'cm'),
    width: packageNumeric('Width', limits?.max_package_width ?? undefined, 'cm'),
    height: packageNumeric('Height', limits?.max_package_height ?? undefined, 'cm'),
    weight: packageNumeric('Weight', limits?.max_package_weight ?? undefined, 'kg'),
    value: packageNumeric('Declared value'),
  });
}

export interface PackagesFormData {
  packages: PackageEditFormData[];
}

export function buildPackagesListSchema(limits?: PackageLimits): z.ZodSchema<PackagesFormData> {
  return z.object({
    packages: z.array(buildPackageSchema(limits)).min(1, 'At least one package required'),
  });
}

export const deliveryPreferenceSchema = z.object({
  preference: z.enum(['Signature Required', 'Leave at Safe Place']),
});
export type DeliveryPreferenceFormData = z.infer<typeof deliveryPreferenceSchema>;

export const serviceTierSchema = z.object({
  tierId: z.string().min(1, 'Select a tier'),
});
export type ServiceTierFormData = z.infer<typeof serviceTierSchema>;

export interface NoteFormData {
  message: string;
  packageIds: string[];
  newImagesCount: number;
  existingImagesCount: number;
}

export function buildNoteSchema(isPackageIssue: boolean): z.ZodSchema<NoteFormData> {
  return z
    .object({
      message: z.string().trim().min(1, 'Description is required').max(500, 'Max 500 characters'),
      packageIds: z.array(z.string()),
      newImagesCount: z.number().int().nonnegative(),
      existingImagesCount: z.number().int().nonnegative(),
    })
    .refine((d) => (isPackageIssue ? d.packageIds.length > 0 : true), {
      message: 'Select at least one package',
      path: ['packageIds'],
    })
    .refine((d) => (isPackageIssue ? d.newImagesCount + d.existingImagesCount > 0 : true), {
      message: 'Attach at least one image',
      path: ['newImagesCount'],
    });
}
