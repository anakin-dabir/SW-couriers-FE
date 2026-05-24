import * as React from 'react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowUpRight, ChevronLeft, Eye, EyeOff, SquarePen, Trash2, X } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Typography } from '@/components/atoms';
import { Avatar, AvatarFallback } from '@/components/atoms/avatar';
import { Card, CardContent } from '@/components/molecules/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/molecules/dialog';
import { cn } from '@/lib/utils';
import { contactRoleBadgeClass, formatContactRoleLabel } from '@/lib/teamManagementUi';
import { DeleteTeamMemberDialog } from '@/components/pages/TeamManagement/DeleteTeamMemberDialog';
import { PlatformAccessPanel } from '@/components/pages/TeamManagement/PlatformAccessPanel';
import { API_RESOURCE_TO_PERMISSION_UI_KEY } from '@/lib/orgContactPermissions';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { useGetOrgContactByIdQuery, useRemoveOrgContactMutation } from '@/store/api/contactsApi';
import { toast } from 'sonner';

export default function InviteTeamDetailPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const organizationIdFromUser = useAppSelector(
    (state: RootState) => state.auth.user?.organization_id ?? null
  );
  const accessToken = useAppSelector((state: RootState) => state.auth.accessToken);
  const organizationId = React.useMemo(
    () => organizationIdFromUser ?? parseOrganizationIdFromToken(accessToken),
    [organizationIdFromUser, accessToken]
  );
  const [removeOrgContact, { isLoading: isDeletingContact }] = useRemoveOrgContactMutation();
  const contactQuery = useGetOrgContactByIdQuery(
    { organizationId: organizationId ?? '', contactId: id ?? '' },
    { skip: !organizationId || !id }
  );
  const contact = contactQuery.data?.data;

  if (!contactQuery.isFetching && !contact) {
    return (
      <div className="p-6">
        <Typography variant="caption" className="text-sm text-gray-500">
          Unable to find the requested member. Please return to team list and try again.
        </Typography>
      </div>
    );
  }

  if (contactQuery.isFetching || !contact) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#D90429] border-r-transparent" />
      </div>
    );
  }

  const member = mapContactToDetail(contact);

  const fullName = `${member.firstName} ${member.lastName}`;
  const canRemoveMember = !member.isPrimary && member.role !== 'ACCOUNT_OWNER';
  const statusColorClass =
    member.status === 'Active'
      ? 'text-[#10B981]'
      : member.status === 'Invited'
        ? 'text-[#F59E0B]'
        : 'text-[#EF4444]';
  const statusDotClass =
    member.status === 'Active'
      ? 'bg-[#10B981]'
      : member.status === 'Invited'
        ? 'bg-[#F59E0B]'
        : 'bg-[#EF4444]';
  const passwordHasMinLength = newPassword.length >= 8;
  const passwordHasUppercase = /[A-Z]/.test(newPassword);
  const passwordHasNumber = /\d/.test(newPassword);
  const passwordHasSymbol = /[^A-Za-z0-9]/.test(newPassword);
  const confirmMatches = confirmPassword.length > 0 && confirmPassword === newPassword;
  const showPasswordError =
    newPassword.length > 0 && (!passwordHasMinLength || !passwordHasUppercase);
  const showConfirmError = confirmPassword.length > 0 && !confirmMatches;
  const isDeleteKeywordMatched = deleteConfirmText.trim() === 'DELETE';
  const hasDeleteReason = deleteReason.trim().length > 0;

  const handleDeleteContact = async (): Promise<void> => {
    if (!organizationId || !id) {
      toast.error('Organization or contact id is missing.');
      return;
    }
    if (!isDeleteKeywordMatched || !hasDeleteReason) return;

    try {
      await removeOrgContact({
        organizationId,
        contactId: id,
        reason: deleteReason.trim(),
      }).unwrap();
      toast.success('Member deleted successfully.');
      setIsDeleteOpen(false);
      setDeleteConfirmText('');
      setDeleteReason('');
      void navigate('/invite-team');
    } catch (error) {
      console.error('Failed to delete contact', error);
      toast.error('Failed to delete member. Please try again.');
    }
  };

  return (
    <>
      <Dialog
        open={isChangePasswordOpen}
        onOpenChange={(open) => {
          setIsChangePasswordOpen(open);
          if (!open) {
            setNewPassword('');
            setConfirmPassword('');
            setShowNewPassword(false);
            setShowConfirmPassword(false);
          }
        }}
      >
        <DialogContent className="h-auto max-w-[560px] rounded-[18px] border border-[#E3E5EC] p-0">
          <div className="px-6 pb-6 pt-6">
            <DialogHeader className="pr-10">
              <div className="space-y-1 text-left">
                <DialogTitle className="text-[18px] font-semibold text-gray-900">
                  Change Password
                </DialogTitle>
                <DialogDescription className="text-[13px] text-gray-500">
                  Set a new password for {fullName}.
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <Typography variant="caption" className="text-sm font-semibold text-gray-900">
                  New Password <span className="text-[#D90429]">*</span>
                </Typography>
                <div
                  className={cn(
                    'relative flex h-11 items-center rounded-lg border bg-white',
                    showPasswordError ? 'border-[#D90429]' : 'border-gray-200'
                  )}
                >
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="h-full w-full bg-transparent px-3 pr-10 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                    placeholder="********"
                  />
                  <button
                    type="button"
                    onPointerDown={(event) => {
                      event.preventDefault();
                      setShowNewPassword((prev) => !prev);
                    }}
                    className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {showPasswordError ? (
                  <Typography variant="caption" className="text-xs text-[#D90429]">
                    Password must be at least 8 characters and include one uppercase letter.
                  </Typography>
                ) : (
                  <ul className="space-y-1 text-xs">
                    <li className={passwordHasMinLength ? 'text-green-600' : 'text-gray-500'}>
                      - At least 8 characters
                    </li>
                    <li className={passwordHasUppercase ? 'text-green-600' : 'text-gray-500'}>
                      - One uppercase letter
                    </li>
                    <li className={passwordHasNumber ? 'text-green-600' : 'text-gray-500'}>
                      - One number
                    </li>
                    <li className={passwordHasSymbol ? 'text-green-600' : 'text-gray-500'}>
                      - One symbol
                    </li>
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <Typography variant="caption" className="text-sm font-semibold text-gray-900">
                  Confirm Password <span className="text-[#D90429]">*</span>
                </Typography>
                <div
                  className={cn(
                    'relative flex h-11 items-center rounded-lg border bg-white',
                    showConfirmError ? 'border-[#D90429]' : 'border-gray-200'
                  )}
                >
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="h-full w-full bg-transparent px-3 pr-10 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                    placeholder="********"
                  />
                  <button
                    type="button"
                    onPointerDown={(event) => {
                      event.preventDefault();
                      setShowConfirmPassword((prev) => !prev);
                    }}
                    className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {showConfirmError && (
                  <Typography variant="caption" className="text-xs text-[#D90429]">
                    Passwords do not match.
                  </Typography>
                )}
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-5">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="border-gray-200"
                >
                  Discard
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    // TODO: Integrate change password API.
                    setIsChangePasswordOpen(false);
                  }}
                  disabled={showPasswordError || showConfirmError || !newPassword}
                >
                  Save Password
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isSuspendOpen}
        onOpenChange={(open) => {
          setIsSuspendOpen(open);
          if (!open) setSuspendReason('');
        }}
      >
        <DialogContent className="h-auto max-w-[520px] overflow-hidden rounded-3xl border-none p-0 shadow-2xl">
          <div className="p-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#FF1F44]">
                <X className="h-10 w-10 text-white" strokeWidth={3} />
              </div>
              <DialogTitle className="text-[24px] font-bold text-gray-900">
                Suspend {fullName}?
              </DialogTitle>
              <DialogDescription className="mt-2 text-[15px] font-medium leading-relaxed text-gray-500">
                This will immediately suspend the member account. They will not be able to log in or
                perform any actions.
              </DialogDescription>
            </div>
            <div className="mt-8 space-y-2">
              <Typography variant="caption" className="text-sm font-bold text-gray-900">
                Reason
              </Typography>
              <textarea
                className="min-h-27.5 w-full resize-none rounded-xl border border-gray-200 bg-white p-4 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-[#D90429] focus:outline-none"
                placeholder="Enter reason for suspension"
                value={suspendReason}
                onChange={(event) => setSuspendReason(event.target.value)}
              />
            </div>
          </div>
          <div className="border-t border-gray-100 px-8 py-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-200"
                onClick={() => setIsSuspendOpen(false)}
              >
                Close
              </Button>
              <Button
                size="sm"
                className="bg-[#CC0000] text-white hover:bg-[#B30000]"
                onClick={() => {
                  // TODO: Integrate suspend member API.
                  setIsSuspendOpen(false);
                }}
                disabled={!suspendReason.trim()}
              >
                Confirm Suspension
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteTeamMemberDialog
        open={isDeleteOpen}
        isDeleting={isDeletingContact}
        confirmText={deleteConfirmText}
        reason={deleteReason}
        onConfirmTextChange={setDeleteConfirmText}
        onReasonChange={setDeleteReason}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) {
            setDeleteConfirmText('');
            setDeleteReason('');
          }
        }}
        onConfirm={() => void handleDeleteContact()}
      />

      <div className="-m-6 flex min-h-full flex-col gap-6 bg-[#F9FAFB] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            className="h-10 gap-2 rounded-[10px] px-3 text-[#18181B] hover:bg-white"
            onClick={() => void navigate('/invite-team')}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Back
          </Button>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {canRemoveMember ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 gap-2 rounded-[10px] border-primary-500 bg-white text-sm font-semibold text-primary-500 hover:bg-primary-50"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                Delete Member
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-primary-500 px-4 text-sm font-semibold text-white hover:bg-primary-600"
              onClick={() =>
                void navigate(
                  `/settings/user-contacts?focusContact=${encodeURIComponent(member.id)}`
                )
              }
            >
              <SquarePen className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              Edit Details
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white shadow-sm">
          <div className="border-b border-[#F4F4F5] px-6 py-4">
            <Typography variant="body" weight="semibold" className="text-lg text-[#18181B]">
              Basic Information
            </Typography>
          </div>
          <CardContent className="p-6">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
              <Avatar className="h-28 w-28 shrink-0 rounded-full border border-[#E5E7EB]">
                <AvatarFallback className="rounded-full bg-[#E4E4E7] text-2xl font-semibold text-[#3F3F46]">
                  {getInitials(fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <Typography
                    variant="h3"
                    weight="semibold"
                    className="text-2xl tracking-tight text-[#18181B]"
                  >
                    {fullName}
                  </Typography>
                  <span
                    className={cn(
                      'inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold',
                      contactRoleBadgeClass(member.role)
                    )}
                  >
                    {formatContactRoleLabel(member.role)}
                  </span>
                  <span
                    className={cn(
                      'inline-flex w-fit items-center gap-2 text-sm font-medium',
                      statusColorClass
                    )}
                  >
                    <span className={cn('h-2 w-2 rounded-full', statusDotClass)} aria-hidden />
                    {member.status}
                  </span>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Typography variant="caption" className="text-xs font-medium text-[#71717A]">
                      Contact Number
                    </Typography>
                    <Typography variant="body" className="text-sm font-medium text-[#18181B]">
                      {member.phone}
                    </Typography>
                  </div>
                  <div className="space-y-1">
                    <Typography variant="caption" className="text-xs font-medium text-[#71717A]">
                      Email
                    </Typography>
                    <a
                      href={member.email ? `mailto:${member.email}` : undefined}
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#18181B] underline decoration-[#18181B] underline-offset-2"
                    >
                      {member.email}
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white shadow-sm">
          <div className="border-b border-[#E5E7EB] px-6 py-4">
            <Typography variant="body" weight="semibold" className="text-lg text-[#18181B]">
              Platform Access
            </Typography>
          </div>
          <PlatformAccessPanel value={member.permissions} />
        </Card>
      </div>
    </>
  );
}

interface ContactApi {
  id: string;
  contact_number?: string;
  contact_role?: string;
  status?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
  is_primary?: boolean;
  permissions?: Array<{ resource: string; level: number }>;
}

interface DetailMemberView {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: 'Active' | 'Invited' | 'Suspended';
  isPrimary: boolean;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postcode: string;
  permissions: Record<string, 'none' | 'read' | 'write'>;
}

const parseOrganizationIdFromToken = (token: string | null): string | null => {
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

function mapContactToDetail(contact: ContactApi): DetailMemberView {
  const normalizedStatus = (contact.status ?? '').toUpperCase();
  const normalizedRole = (contact.contact_role ?? '').toUpperCase();
  const role =
    normalizedRole === 'ACCOUNT_OWNER' ||
    normalizedRole === 'BILLING' ||
    normalizedRole === 'OPERATIONS' ||
    normalizedRole === 'TECHNICAL' ||
    normalizedRole === 'OTHER'
      ? normalizedRole
      : 'OTHER';
  const permissions = (contact.permissions ?? []).reduce<Record<string, 'none' | 'read' | 'write'>>(
    (acc, item) => {
      const uiKey = API_RESOURCE_TO_PERMISSION_UI_KEY[item.resource];
      if (!uiKey) return acc;
      acc[uiKey] = item.level === 2 ? 'write' : item.level === 1 ? 'read' : 'none';
      return acc;
    },
    {}
  );

  return {
    id: contact.id,
    firstName: contact.first_name ?? '',
    lastName: contact.last_name ?? '',
    email: contact.email ?? '',
    phone: contact.contact_number || contact.phone || '—',
    role,
    status:
      normalizedStatus === 'ACTIVE'
        ? 'Active'
        : normalizedStatus === 'SUSPENDED'
          ? 'Suspended'
          : 'Invited',
    isPrimary: contact.is_primary === true,
    addressLine1: '-',
    addressLine2: '-',
    city: '-',
    postcode: '-',
    permissions,
  };
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.at(0) ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
