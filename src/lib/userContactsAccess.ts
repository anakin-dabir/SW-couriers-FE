import {
  API_RESOURCE_TO_PERMISSION_UI_KEY,
  permissionLevelFromApi,
  type UiPermissionLevel,
} from '@/lib/orgContactPermissions';
import type { OrgContactDto } from '@/store/api/contactsApi';
import type { AuthUser } from '@/types/auth';

/** True when `/auth/me` reports ACCOUNT_OWNER or primary org contact. */
export function isAccountOwnerUser(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  const role = (user.contact_role ?? user.org_contact?.contact_role ?? '').toUpperCase();
  return role === 'ACCOUNT_OWNER' || user.org_contact?.is_primary === true;
}

/** General Settings: only the account owner may edit. */
export function canManageOrganizationSettings(user: AuthUser | null | undefined): boolean {
  return isAccountOwnerUser(user);
}

/** Resolve the signed-in user's org contact from a contacts list response. */
export function findCurrentUserOrgContact(
  user: AuthUser | null | undefined,
  owner: OrgContactDto | null | undefined,
  teamMembers: OrgContactDto[]
): OrgContactDto | null {
  if (!user) return null;

  const orgContactId = user.org_contact?.id?.trim();
  if (orgContactId) {
    if (owner?.id === orgContactId) return owner;
    const fromTeam = teamMembers.find((member) => member.id === orgContactId);
    if (fromTeam) return fromTeam;
  }

  const userId = user.id?.trim();
  if (!userId) return null;
  if (owner?.user_id?.trim() === userId) return owner;
  return teamMembers.find((member) => member.user_id?.trim() === userId) ?? null;
}

export function getContactsPermissionLevel(
  contact: OrgContactDto | null | undefined
): UiPermissionLevel {
  const contactsPermission = contact?.permissions?.find((p) => p.resource === 'CONTACTS');
  if (contactsPermission) {
    return permissionLevelFromApi(contactsPermission.level);
  }

  const viaUiKey = contact?.permissions?.find(
    (p) => API_RESOURCE_TO_PERMISSION_UI_KEY[p.resource] === 'CONTACTS'
  );
  return permissionLevelFromApi(viaUiKey?.level);
}

/** User & Contacts: account owner always; others need CONTACTS read or write. */
export function canViewUserContacts(
  user: AuthUser | null | undefined,
  contact: OrgContactDto | null | undefined
): boolean {
  if (isAccountOwnerUser(user)) return true;
  const level = getContactsPermissionLevel(contact);
  return level === 'read' || level === 'write';
}

/** User & Contacts: account owner always; others need CONTACTS write. */
export function canManageUserContacts(
  user: AuthUser | null | undefined,
  contact: OrgContactDto | null | undefined
): boolean {
  if (isAccountOwnerUser(user)) return true;
  return getContactsPermissionLevel(contact) === 'write';
}
