export interface OrgContactMeProfile {
  id: string;
  contact_role: string;
  status: string;
  is_primary: boolean;
}

export interface AuthUserBrief {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role?: string | null;
  organization_id?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  contact_role?: string | null;
  region_id?: string | null;
  requires_password_change?: boolean;
  profile_type?: string | null;
  org_contact?: OrgContactMeProfile | null;
  created_at?: string | null;
}

export interface AuthUser extends AuthUserBrief {
  name: string;
}

export function getAuthUserDisplayName(user: {
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  name?: string | null;
}): string {
  const existingName = user.name?.trim();
  if (existingName) return existingName;

  const fullName = [user.first_name?.trim(), user.last_name?.trim()].filter(Boolean).join(' ');
  if (fullName) return fullName;

  return user.email?.split('@')[0] || 'User';
}

export function mapBriefToAuthUser(user: AuthUserBrief): AuthUser {
  return {
    ...user,
    name: getAuthUserDisplayName(user),
  };
}
