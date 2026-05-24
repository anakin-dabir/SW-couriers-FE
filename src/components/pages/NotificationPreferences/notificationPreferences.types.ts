import type { NotificationEvent } from '@/store/api/notificationsApi';

export type NotificationPreferencesTabKey = 'internal_notifications' | 'customer_notifications';

export type OrganizationNotificationType = 'B2B_CUSTOMER' | 'RECIPIENT';

export interface NotificationRow {
  id: string;
  eventType: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  template: string;
  thresholdValue?: string;
}

export interface NotificationGroup {
  id: string;
  title: string;
  rows: NotificationRow[];
}

export interface NotificationTestRow {
  event: NotificationEvent;
  eventType: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
}

export const TAB_TO_NOTIFICATION_TYPE: Record<
  NotificationPreferencesTabKey,
  OrganizationNotificationType
> = {
  internal_notifications: 'B2B_CUSTOMER',
  customer_notifications: 'RECIPIENT',
};
