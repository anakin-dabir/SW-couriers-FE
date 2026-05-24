import type { CategoryGroup, NotificationEvent } from '@/store/api/notificationsApi';
import type { NotificationGroup, NotificationTestRow } from './notificationPreferences.types';

export const parseOrganizationIdFromToken = (token: string | null): string | null => {
  if (!token) return null;

  try {
    const tokenParts = token.split('.');
    if (tokenParts.length < 2) return null;

    const base64Url = tokenParts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payloadJson = window.atob(paddedBase64);
    const payload = JSON.parse(payloadJson) as { org_id?: string };

    return payload.org_id ?? null;
  } catch {
    return null;
  }
};

export const mapPreferencesToGroups = (
  preferences: CategoryGroup[] | undefined
): NotificationGroup[] => {
  if (!preferences?.length) return [];

  return preferences.map((categoryGroup) => ({
    id: categoryGroup.category.toLowerCase(),
    title: `${categoryGroup.category_display_name} Notifications`,
    rows: categoryGroup.preferences.map((eventPref) => ({
      id: eventPref.event,
      eventType: eventPref.event_display_name,
      emailEnabled: eventPref.email.enabled,
      smsEnabled: eventPref.sms.enabled,
      template: eventPref.template_customized ? 'Customized' : 'Default',
      thresholdValue: eventPref.event === 'CREDIT_LIMIT_WARNING' ? '80' : undefined,
    })),
  }));
};

export const mapGroupsToTestRows = (groups: NotificationGroup[]): NotificationTestRow[] =>
  groups.flatMap((group) =>
    group.rows.map((row) => ({
      event: row.id as NotificationEvent,
      eventType: row.eventType,
      emailEnabled: row.emailEnabled,
      smsEnabled: row.smsEnabled,
    }))
  );
