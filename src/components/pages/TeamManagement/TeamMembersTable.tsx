import * as React from 'react';
import { format, parseISO } from 'date-fns';
import Typography from '@/components/atoms/Typography';
import { cn } from '@/lib/utils';
import {
  contactRoleBadgeClass,
  formatContactRoleLabel,
  TEAM_LIST_GRID_CLASS,
} from '@/lib/teamManagementUi';
import { TeamMemberRowActions } from '@/components/pages/TeamManagement/TeamMemberRowActions';

export interface TeamMemberTableRow {
  id: string;
  userId: string;
  statusNorm: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  contactRole: string;
  invitationAt: string | null;
  isOwner: boolean;
  isPrimary: boolean;
}

export interface TeamMembersTableProps {
  rows: TeamMemberTableRow[];
  isSendingInvite: boolean;
  canOfferResendInvite: (row: TeamMemberTableRow) => boolean;
  onResend: (userId: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (row: TeamMemberTableRow) => void;
}

function formatInvitationDisplay(iso: string | null): string {
  if (!iso) return '-';
  try {
    return format(parseISO(iso), 'dd MMM yyyy, h:mm a');
  } catch {
    return '-';
  }
}

function displayName(row: TeamMemberTableRow): string {
  return `${row.firstName} ${row.lastName}`.trim() || '-';
}

function canDeleteRow(row: TeamMemberTableRow): boolean {
  return !row.isPrimary && !row.isOwner && row.contactRole !== 'ACCOUNT_OWNER';
}

function RoleBadge({ role }: { role: string }): React.JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-xs font-semibold text-white',
        contactRoleBadgeClass(role)
      )}
    >
      {formatContactRoleLabel(role)}
    </span>
  );
}

function RowActions({
  row,
  isSendingInvite,
  canOfferResendInvite,
  onResend,
  onView,
  onEdit,
  onDelete,
}: {
  row: TeamMemberTableRow;
  isSendingInvite: boolean;
  canOfferResendInvite: (row: TeamMemberTableRow) => boolean;
  onResend: (userId: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (row: TeamMemberTableRow) => void;
}): React.JSX.Element {
  return (
    <TeamMemberRowActions
      canDelete={canDeleteRow(row)}
      offerResend={canOfferResendInvite(row)}
      isSendingInvite={isSendingInvite}
      onView={() => onView(row.id)}
      onEdit={() => onEdit(row.id)}
      onResend={() => onResend(row.userId)}
      onDelete={() => onDelete(row)}
    />
  );
}

const HEAD_CELL = 'text-sm font-medium text-[#6B7280]';

function DesktopTeamRow({
  row,
  ...actions
}: {
  row: TeamMemberTableRow;
  isSendingInvite: boolean;
  canOfferResendInvite: (row: TeamMemberTableRow) => boolean;
  onResend: (userId: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (row: TeamMemberTableRow) => void;
}): React.JSX.Element {
  return (
    <article
      role="listitem"
      className={cn(
        TEAM_LIST_GRID_CLASS,
        'rounded-lg border border-[#E5E7EB] bg-white px-4 py-4 text-sm text-[#18181B] shadow-[0_1px_2px_rgba(16,24,40,0.04)]'
      )}
    >
      <div className="min-w-0 font-medium text-[#18181B]">{displayName(row)}</div>
      <div className="min-w-0 text-[#52525B]">{formatInvitationDisplay(row.invitationAt)}</div>
      <div className="min-w-0">
        <RoleBadge role={row.contactRole} />
      </div>
      <div className="min-w-0 tabular-nums text-[#52525B]">{row.phone || '-'}</div>
      <div className="min-w-0 truncate text-[#52525B]">{row.email || '-'}</div>
      <div className="flex justify-end">
        <RowActions row={row} {...actions} />
      </div>
    </article>
  );
}

function MobileTeamRow({
  row,
  ...actions
}: {
  row: TeamMemberTableRow;
  isSendingInvite: boolean;
  canOfferResendInvite: (row: TeamMemberTableRow) => boolean;
  onResend: (userId: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (row: TeamMemberTableRow) => void;
}): React.JSX.Element {
  return (
    <article
      role="listitem"
      className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Typography variant="body" weight="medium" className="text-[#18181B]">
            {displayName(row)}
          </Typography>
          <Typography variant="caption" className="mt-1 block truncate text-[#52525B]">
            {row.email}
          </Typography>
        </div>
        <RowActions row={row} {...actions} />
      </div>
      <dl className="mt-3 space-y-2 text-xs">
        <div className="flex justify-between gap-2">
          <dt className="text-[#6B7280]">Invitation Date</dt>
          <dd className="text-[#18181B]">{formatInvitationDisplay(row.invitationAt)}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-[#6B7280]">Contact Role</dt>
          <dd>
            <RoleBadge role={row.contactRole} />
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-[#6B7280]">Contact Number</dt>
          <dd className="tabular-nums text-[#18181B]">{row.phone || '-'}</dd>
        </div>
      </dl>
    </article>
  );
}

export function TeamMembersTable({
  rows,
  isSendingInvite,
  canOfferResendInvite,
  onResend,
  onView,
  onEdit,
  onDelete,
}: TeamMembersTableProps): React.JSX.Element {
  const actionProps = {
    isSendingInvite,
    canOfferResendInvite,
    onResend,
    onView,
    onEdit,
    onDelete,
  };

  return (
    <div
      className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4"
      role="region"
      aria-label="Team members list"
    >
      <div className={cn(TEAM_LIST_GRID_CLASS, 'mb-3 hidden px-4 md:grid')} role="row">
        <div className={HEAD_CELL}>Name</div>
        <div className={HEAD_CELL}>Invitation Date</div>
        <div className={HEAD_CELL}>Contact Role</div>
        <div className={HEAD_CELL}>Contact Number</div>
        <div className={HEAD_CELL}>Email</div>
        <div className="sr-only">Actions</div>
      </div>

      <div className="hidden flex-col gap-2 md:flex" role="list">
        {rows.map((row) => (
          <DesktopTeamRow key={row.id} row={row} {...actionProps} />
        ))}
      </div>

      <div className="flex flex-col gap-2 md:hidden" role="list">
        {rows.map((row) => (
          <MobileTeamRow key={row.id} row={row} {...actionProps} />
        ))}
      </div>
    </div>
  );
}

export function TeamMembersTableEmpty({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-6 py-16 text-center">
      <Typography variant="body" weight="semibold" className="text-[#18181B]">
        {title}
      </Typography>
      <Typography variant="caption" className="mt-2 max-w-md text-[#6B7280]">
        {description}
      </Typography>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
