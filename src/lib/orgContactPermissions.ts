import type { ContactPermissionDto } from '@/store/api/contactsApi';

/** Every resource the contacts API accepts on POST/PATCH (aligned with OpenAPI examples). */
export const ORG_CONTACT_RESOURCE_ENUMS = [
  'DASHBOARD',
  'ORDERS',
  'CARD_PAYMENT',
  'BILLING',
  'NOTIFICATIONS',
  'REQUEST_CREDIT',
  'DOCUMENTS',
  'CONTACTS',
  'AUDIT_LOG',
] as const;

export type OrgContactResource = (typeof ORG_CONTACT_RESOURCE_ENUMS)[number];

/** UI module key → API resource (subset used on Settings / Invite flows). */
export const PERMISSION_KEY_TO_RESOURCE: Record<string, OrgContactResource> = {
  DASHBOARD: 'DASHBOARD',
  ORDERS: 'ORDERS',
  CARD_PAYMENT: 'CARD_PAYMENT',
  BILLING: 'BILLING',
  NOTIFICATIONS: 'NOTIFICATIONS',
  REQUEST_CREDIT: 'REQUEST_CREDIT',
  DOCUMENTS: 'DOCUMENTS',
  CONTACTS: 'CONTACTS',
  AUDIT_LOG: 'AUDIT_LOG',
};

export const API_RESOURCE_TO_PERMISSION_UI_KEY: Partial<Record<string, string>> = {
  DASHBOARD: 'DASHBOARD',
  ORDERS: 'ORDERS',
  CARD_PAYMENT: 'CARD_PAYMENT',
  BILLING: 'BILLING',
  NOTIFICATIONS: 'NOTIFICATIONS',
  REQUEST_CREDIT: 'REQUEST_CREDIT',
  DOCUMENTS: 'DOCUMENTS',
  CONTACTS: 'CONTACTS',
  AUDIT_LOG: 'AUDIT_LOG',
};

export type UiPermissionLevel = 'none' | 'read' | 'write';

export const UI_PERMISSION_LEVEL_TO_API: Record<UiPermissionLevel, 0 | 1 | 2> = {
  none: 0,
  read: 1,
  write: 2,
};

export function permissionLevelFromApi(level: number | undefined): UiPermissionLevel {
  if (level === 2) return 'write';
  if (level === 1) return 'read';
  return 'none';
}

/** Permissions array for POST/PATCH — only emits resources mapped from the UI modules. */
export function buildOrgContactPermissionsPayload(
  uiPermissions: Record<string, UiPermissionLevel>
): ContactPermissionDto[] {
  const resourceLevelMap = new Map<OrgContactResource, 0 | 1 | 2>();

  for (const resource of Object.values(PERMISSION_KEY_TO_RESOURCE)) {
    resourceLevelMap.set(resource, 0);
  }

  for (const [permissionKey, selectedLevel] of Object.entries(uiPermissions)) {
    const resource = PERMISSION_KEY_TO_RESOURCE[permissionKey];
    if (!resource) continue;
    resourceLevelMap.set(resource, UI_PERMISSION_LEVEL_TO_API[selectedLevel]);
  }

  return Array.from(resourceLevelMap, ([resource, level]) => ({ resource, level }));
}
