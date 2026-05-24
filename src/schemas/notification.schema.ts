import { z } from 'zod';

/**
 * Notification triggers form validation schema
 *
 * Validates notification trigger preferences for internal notifications.
 */
export const notificationTriggersSchema = z.object({
  notificationTriggersEnabled: z.boolean().default(false),
  pickupScanned: z.boolean().default(false),
  inboundToHub: z.boolean().default(true),
  locationAssigned: z.boolean().default(true),
  loadedToVehicle: z.boolean().default(false),
  outForDelivery: z.boolean().default(true),
  delivered: z.boolean().default(false),
  failedWithReason: z.boolean().default(false),
});

/**
 * Type inference for notification triggers form data
 */
export type NotificationTriggersFormData = z.infer<typeof notificationTriggersSchema>;

/**
 * Channels form validation schema
 *
 * Validates channel preferences for notifications.
 */
export const channelsSchema = z.object({
  channelsEnabled: z.boolean().default(false),
  email: z.boolean().default(true),
  notification: z.boolean().default(true),
});

/**
 * Type inference for channels form data
 */
export type ChannelsFormData = z.infer<typeof channelsSchema>;
