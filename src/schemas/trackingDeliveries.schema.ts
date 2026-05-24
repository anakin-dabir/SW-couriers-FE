import { z } from 'zod';

export const trackingDeliveriesFiltersSchema = z.object({
  search: z.string().default(''),
});

export type TrackingDeliveriesFiltersValues = z.infer<typeof trackingDeliveriesFiltersSchema>;
