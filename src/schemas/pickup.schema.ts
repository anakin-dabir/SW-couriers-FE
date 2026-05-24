import { z } from 'zod';
import { isPickupAddressUuid } from '@/lib/pickupAddressForm';

/**
 * Address form validation schema (reused for pickup and delivery address)
 */
export const addressSchema = z.object({
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

export type AddressFormData = z.infer<typeof addressSchema>;

/**
 * Pickup address form validation schema (Figma B2B Pickup Details 6:43508)
 * Saved address selector, nested address card (lines, country, region, city, postcode), contact at pickup.
 */
/**
 * Only the pickup address selector (`pickupInfo` → `pickup_address_id`) is strictly required.
 * All other address fields are auto-populated from the selected saved pickup address, so they
 * carry only length-cap sanity checks and never block submission on the client portal.
 */
export const pickupAddressSchema = z.object({
  pickupInfo: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z
      .string()
      .min(1, 'Select a saved pickup address')
      .max(64, 'Invalid pickup address selection')
      .refine((id) => isPickupAddressUuid(id), {
        message: 'Select a saved pickup address from your organization profile',
      })
  ),
  postalCode: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().max(20, 'Postcode must be less than 20 characters').optional()
  ),
  personFirstName: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().max(100, 'First name must be less than 100 characters').optional()
  ),
  personSecondName: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().max(100, 'Second name must be less than 100 characters').optional()
  ),
  state: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().max(100, 'Region must be less than 100 characters').optional()
  ),
  addressLine: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().max(255, 'Address line 1 must be less than 255 characters').optional()
  ),
  addressLine2: z.preprocess((val) => {
    if (typeof val !== 'string') return val;
    const t = val.trim();
    return t === '' ? undefined : t;
  }, z.string().max(255, 'Address line 2 must be less than 255 characters').optional()),
  country: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().max(100, 'Country must be less than 100 characters').optional()
  ),
  city: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().max(100, 'City must be less than 100 characters').optional()
  ),
});

export type PickupAddressFormData = z.infer<typeof pickupAddressSchema>;

/**
 * Pickup detail form validation schema (contact and reference info).
 * All fields are auto-populated from the selected saved pickup address / account owner, so
 * they're optional with length caps only — they won't block submission on the client portal.
 */
export const pickupDetailSchema = z.object({
  contactName: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().max(100, 'Name must be less than 100 characters').optional()
  ),

  phone: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().max(20, 'Phone number must be valid (with country code)').optional()
  ),

  email: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim().toLowerCase() : val),
    z
      .string()
      .max(255, 'Email must be less than 255 characters')
      .email('Please enter a valid email address')
      .optional()
      .or(z.literal(''))
  ),

  companyName: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().max(100, 'Company name must be less than 100 characters').optional()
  ),

  reference: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().max(50, 'Reference must be less than 50 characters').optional()
  ),

  specialInstructions: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().max(500, 'Instructions must be less than 500 characters').optional()
  ),
});

export type PickupDetailFormData = z.infer<typeof pickupDetailSchema>;

/**
 * Package fields only (dimensions, weight, declared value) — nested under each delivery item.
 */
export const packageFieldsSchema = z.object({
  length: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().min(1, 'Length is required').max(20, 'Length must be less than 20 characters')
  ),
  width: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().min(1, 'Width is required').max(20, 'Width must be less than 20 characters')
  ),
  height: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().min(1, 'Height is required').max(20, 'Height must be less than 20 characters')
  ),
  weight: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().min(1, 'Weight is required').max(20, 'Weight must be less than 20 characters')
  ),
  declaredValue: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z
      .string()
      .min(1, 'Declared value is required')
      .max(20, 'Declared value must be less than 20 characters')
  ),
});

export type PackageFieldsFormData = z.infer<typeof packageFieldsSchema>;

/**
 * One delivery item: drop-off details + list of packages.
 */
export const deliveryItemSchema = z.object({
  recipientFirstName: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z
      .string()
      .min(1, 'First name is required')
      .max(100, 'First name must be less than 100 characters')
  ),
  recipientLastName: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z
      .string()
      .min(1, 'Last name is required')
      .max(100, 'Last name must be less than 100 characters')
  ),
  recipientEmail: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim().toLowerCase() : val),
    z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .max(255, 'Email must be less than 255 characters')
  ),
  addressLine1: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z
      .string()
      .min(1, 'First line of address is required')
      .max(255, 'Address must be less than 255 characters')
  ),
  addressLine2: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().max(255, 'Address must be less than 255 characters').optional()
  ),
  city: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().min(1, 'City is required').max(100, 'City must be less than 100 characters')
  ),
  postalCode: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z
      .string()
      .min(1, 'Postal code is required')
      .max(20, 'Postal code must be less than 20 characters')
  ),
  contactNumber: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z
      .string()
      .min(1, 'Contact number is required')
      .max(25, 'Contact number must be less than 25 characters')
  ),
  stopNotes: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().max(250, 'Notes must be at most 250 characters').optional()
  ),
  deliveryInstruction: z.enum(['signature', 'safe_place']),
  /** Service tier id (UUID) selected from the org's effective service tiers. */
  deliveryPackage: z.string().min(1, 'Select a delivery service'),
  packages: z.array(packageFieldsSchema).min(1, 'At least one package is required'),
});

export type DeliveryItemFormData = z.infer<typeof deliveryItemSchema>;

/**
 * Package & Delivery step: list of delivery items. Each item has drop-off details + packages.
 */
export const packageDeliverySchema = z.object({
  deliveryItems: z.array(deliveryItemSchema).min(1, 'At least one delivery item is required'),
});

export type PackageDeliveryFormData = z.infer<typeof packageDeliverySchema>;

/**
 * Settings > Pickup Address drawer form validation.
 * All fields required except id (for add) and county (optional).
 */
export const settingsPickupAddressSchema = z.object({
  id: z.string(),
  label: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z
      .string()
      .min(1, 'Address title is required')
      .max(100, 'Address title must be less than 100 characters')
  ),
  contactFirstName: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z
      .string()
      .min(1, 'Contact first name is required')
      .max(100, 'First name must be less than 100 characters')
  ),
  contactLastName: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z
      .string()
      .min(1, 'Contact last name is required')
      .max(100, 'Last name must be less than 100 characters')
  ),
  phoneNumber: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z
      .string()
      .min(1, 'Registered number is required')
      .max(20, 'Phone number must be less than 20 characters')
  ),
  buildingHouseNumber: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z
      .string()
      .min(1, 'Building / House number is required')
      .max(50, 'Building number must be less than 50 characters')
  ),
  firstLineOfAddress: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z
      .string()
      .min(1, 'First line of address is required')
      .max(255, 'Address must be less than 255 characters')
  ),
  secondLineOfAddress: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z
      .string()
      .min(1, 'Second line of address is required')
      .max(255, 'Address must be less than 255 characters')
  ),
  townCity: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z
      .string()
      .min(1, 'Town / City is required')
      .max(100, 'Town / City must be less than 100 characters')
  ),
  postalCode: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z
      .string()
      .min(1, 'Postal code is required')
      .max(20, 'Postal code must be less than 20 characters')
  ),
  country: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().min(1, 'Country is required').max(100, 'Country must be less than 100 characters')
  ),
  county: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().max(100).optional()
  ),
  isDefault: z.boolean(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type SettingsPickupAddressFormData = z.infer<typeof settingsPickupAddressSchema>;

/**
 * Combined pickup request form schema (detail + pickup address + delivery address).
 * deliveryAddress is optional so step 1 (contact + pickup only) validates without it.
 */
export const pickupRequestSchema = pickupDetailSchema.extend({
  pickupAddress: pickupAddressSchema,
  deliveryAddress: addressSchema.optional(),
});

export type PickupRequestFormData = z.infer<typeof pickupRequestSchema>;
