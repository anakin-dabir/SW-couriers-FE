'use client';

import * as React from 'react';
import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { endOfDay, isWithinInterval, parseISO, startOfDay, subDays } from 'date-fns';
import { type DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import { PageHeader } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';
import { DeleteTeamMemberDialog } from '@/components/pages/TeamManagement/DeleteTeamMemberDialog';
import {
  TeamMembersTable,
  TeamMembersTableEmpty,
  type TeamMemberTableRow,
} from '@/components/pages/TeamManagement/TeamMembersTable';
import {
  formatTeamListDateButtonLabel,
  TeamMembersToolbar,
} from '@/components/pages/TeamManagement/TeamMembersToolbar';
import {
  formatContactRoleLabel,
  TEAM_PRIMARY_BUTTON_CLASS,
  type TeamListTimePreset,
} from '@/lib/teamManagementUi';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import {
  useGetOrgContactsQuery,
  useRemoveOrgContactMutation,
  useSendUserInviteMutation,
  type OrgContactDto,
} from '@/store/api/contactsApi';

function canOfferResendInvite(row: TeamMemberTableRow): boolean {
  if (row.isOwner) return false;
  if (!row.userId.trim()) return false;
  if (row.statusNorm === 'ACTIVE') return false;
  return true;
}

function mapContactToRow(contact: OrgContactDto, isOwner: boolean): TeamMemberTableRow {
  return {
    id: contact.id,
    userId: (contact.user_id ?? '').trim(),
    statusNorm: (contact.status ?? '').toUpperCase(),
    firstName: contact.first_name ?? '',
    lastName: contact.last_name ?? '',
    email: contact.email ?? '',
    phone: (contact.contact_number ?? contact.phone ?? '').trim(),
    contactRole: (contact.contact_role ?? 'OTHER').toUpperCase(),
    invitationAt: isOwner ? null : (contact.created_at ?? null),
    isOwner,
    isPrimary: contact.is_primary === true,
  };
}

function rangeForPreset(preset: TeamListTimePreset): DateRange | undefined {
  if (preset === 'all_time') return undefined;
  const to = endOfDay(new Date());
  if (preset === 'last_7_days') {
    return { from: startOfDay(subDays(to, 6)), to };
  }
  if (preset === 'last_30_days') {
    return { from: startOfDay(subDays(to, 29)), to };
  }
  return undefined;
}

function parseOrganizationIdFromToken(token: string | null): string | null {
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
}

function rowMatchesDateFilter(
  row: TeamMemberTableRow,
  range: DateRange | undefined,
  preset: TeamListTimePreset
): boolean {
  if (preset === 'all_time' || !range?.from) return true;
  if (row.invitationAt == null) return true;
  try {
    const d = parseISO(row.invitationAt);
    const from = startOfDay(range.from);
    const to = range.to ? endOfDay(range.to) : endOfDay(range.from);
    return isWithinInterval(d, { start: from, end: to });
  } catch {
    return true;
  }
}

export default function InviteTeamPage(): React.JSX.Element {
  const navigate = useNavigate();
  const organizationIdFromUser = useAppSelector(
    (state: RootState) => state.auth.user?.organization_id ?? null
  );
  const accessToken = useAppSelector((state: RootState) => state.auth.accessToken);
  const organizationId = useMemo(
    () => organizationIdFromUser ?? parseOrganizationIdFromToken(accessToken),
    [organizationIdFromUser, accessToken]
  );

  const { data: contactsResponse, isFetching } = useGetOrgContactsQuery(
    { organizationId: organizationId ?? '' },
    { skip: !organizationId }
  );

  const [sendUserInvite, { isLoading: isSendingInvite }] = useSendUserInviteMutation();
  const [removeOrgContact, { isLoading: isDeletingContact }] = useRemoveOrgContactMutation();

  const [search, setSearch] = useState('');
  const [timePreset, setTimePreset] = useState<TeamListTimePreset>('all_time');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() =>
    rangeForPreset('all_time')
  );
  const [deleteTarget, setDeleteTarget] = useState<TeamMemberTableRow | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteReason, setDeleteReason] = useState('');

  const handlePresetChange = (value: TeamListTimePreset): void => {
    setTimePreset(value);
    if (value !== 'custom') {
      setDateRange(rangeForPreset(value));
    }
  };

  const handleCalendarSelect = (next: DateRange | undefined): void => {
    setDateRange(next);
    setTimePreset('custom');
  };

  const allRows = useMemo((): TeamMemberTableRow[] => {
    const data = contactsResponse?.data;
    if (!data) return [];
    const list: TeamMemberTableRow[] = [];
    if (data.owner) {
      list.push(mapContactToRow(data.owner, true));
    }
    for (const member of data.team_members ?? []) {
      list.push(mapContactToRow(member, false));
    }
    return list;
  }, [contactsResponse]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter((row) => {
      if (!rowMatchesDateFilter(row, dateRange, timePreset)) return false;
      if (!q) return true;
      const roleLabel = formatContactRoleLabel(row.contactRole).toLowerCase();
      const blob = [
        row.firstName,
        row.lastName,
        `${row.firstName} ${row.lastName}`,
        row.email,
        row.phone,
        roleLabel,
        row.contactRole.toLowerCase(),
      ]
        .join(' ')
        .toLowerCase();
      return blob.includes(q);
    });
  }, [allRows, search, dateRange, timePreset]);

  const dateButtonLabel = formatTeamListDateButtonLabel(timePreset, dateRange);

  const handleResendInvite = async (apiUserId: string): Promise<void> => {
    const uid = apiUserId.trim();
    if (!uid) {
      toast.error('Resend invite is unavailable until this member has a user account.');
      return;
    }
    try {
      const res = await sendUserInvite({ userId: uid }).unwrap();
      const msg =
        res && typeof res === 'object' && 'message' in res && typeof res.message === 'string'
          ? res.message
          : 'Invite sent successfully';
      toast.success(msg);
    } catch (error: unknown) {
      const payload =
        error && typeof error === 'object' && 'data' in error
          ? (error as { data?: { message?: string } }).data
          : undefined;
      toast.error(payload?.message ?? 'Failed to resend invite');
    }
  };

  const handleDeleteMember = async (): Promise<void> => {
    if (!organizationId || !deleteTarget) return;
    if (deleteConfirmText.trim() !== 'DELETE' || deleteReason.trim().length === 0) return;
    try {
      await removeOrgContact({
        organizationId,
        contactId: deleteTarget.id,
        reason: deleteReason.trim(),
      }).unwrap();
      toast.success('Team member removed.');
      setDeleteTarget(null);
      setDeleteConfirmText('');
      setDeleteReason('');
    } catch (error) {
      console.error('Failed to remove contact', error);
      toast.error('Could not remove member. Please try again.');
    }
  };

  const inviteButton = (
    <Button asChild className={TEAM_PRIMARY_BUTTON_CLASS}>
      <Link to="/invite-team/create">
        <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden />
        Invite Team Member
      </Link>
    </Button>
  );

  const showEmpty = !isFetching && allRows.length === 0;
  const showNoMatches = !isFetching && allRows.length > 0 && filteredRows.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <DeleteTeamMemberDialog
        open={deleteTarget != null}
        isDeleting={isDeletingContact}
        confirmText={deleteConfirmText}
        reason={deleteReason}
        onConfirmTextChange={setDeleteConfirmText}
        onReasonChange={setDeleteReason}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteConfirmText('');
            setDeleteReason('');
          }
        }}
        onConfirm={() => void handleDeleteMember()}
      />

      <PageHeader
        title="All Team Members"
        subtitle="Manage and view all team members in your team."
        actions={inviteButton}
        titleClassName="text-2xl font-semibold tracking-tight text-[#18181B]"
        subtitleClassName="text-[15px] leading-relaxed text-[#6B7280]"
      />

      <TeamMembersToolbar
        search={search}
        onSearchChange={setSearch}
        timePreset={timePreset}
        onTimePresetChange={handlePresetChange}
        dateRange={dateRange}
        onDateRangeChange={handleCalendarSelect}
        dateButtonLabel={dateButtonLabel}
      />

      {isFetching ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]">
          <div
            className="h-9 w-9 animate-spin rounded-full border-2 border-solid border-primary-500 border-r-transparent"
            aria-label="Loading team members"
          />
        </div>
      ) : showEmpty ? (
        <TeamMembersTableEmpty
          title="No team members yet"
          description="Invite your first teammate to collaborate on orders, billing, and notifications."
          action={inviteButton}
        />
      ) : showNoMatches ? (
        <TeamMembersTableEmpty
          title="No members match your filters"
          description="Try clearing search or widening the date range."
        />
      ) : (
        <TeamMembersTable
          rows={filteredRows}
          isSendingInvite={isSendingInvite}
          canOfferResendInvite={(row) => canOfferResendInvite(row)}
          onResend={(userId) => void handleResendInvite(userId)}
          onView={(id) => void navigate(`/invite-team/${id}`)}
          onEdit={(id) =>
            void navigate(`/settings/user-contacts?focusContact=${encodeURIComponent(id)}`)
          }
          onDelete={setDeleteTarget}
        />
      )}
    </div>
  );
}
