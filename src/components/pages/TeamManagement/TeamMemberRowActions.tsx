import * as React from 'react';
import { ArrowUpRight, EllipsisVertical, Mail, SquarePen, Trash2 } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu';

export interface TeamMemberRowActionsProps {
  canDelete: boolean;
  offerResend: boolean;
  isSendingInvite: boolean;
  onView: () => void;
  onEdit: () => void;
  onResend: () => void;
  onDelete: () => void;
}

export function TeamMemberRowActions({
  canDelete,
  offerResend,
  isSendingInvite,
  onView,
  onEdit,
  onResend,
  onDelete,
}: TeamMemberRowActionsProps): React.JSX.Element {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-md text-[#6B7280] hover:bg-[#F3F4F6]"
          aria-label="Row actions"
        >
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[200px] rounded-xl border border-[#E5E7EB] bg-white p-1.5 shadow-lg"
      >
        <DropdownMenuItem
          className="cursor-pointer gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-[#18181B] focus:bg-[#F9FAFB]"
          onClick={onView}
        >
          <ArrowUpRight className="h-4 w-4 text-[#6B7280]" aria-hidden />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-[#18181B] focus:bg-[#F9FAFB]"
          onClick={onEdit}
        >
          <SquarePen className="h-4 w-4 shrink-0 text-[#6B7280]" strokeWidth={2} aria-hidden />
          Edit Details
        </DropdownMenuItem>
        {offerResend ? (
          <DropdownMenuItem
            className="cursor-pointer gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-[#18181B] focus:bg-[#F9FAFB]"
            disabled={isSendingInvite}
            onClick={onResend}
          >
            <Mail className="h-4 w-4 text-[#6B7280]" aria-hidden />
            Resend Invite
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator className="my-1 bg-[#E5E7EB]" />
        {canDelete ? (
          <DropdownMenuItem
            className="cursor-pointer gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-[#EF4444] focus:bg-[#FEF2F2] focus:text-[#EF4444]"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 text-[#EF4444]" aria-hidden />
            Delete Member
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            disabled
            title="The account owner cannot be removed."
            className="cursor-not-allowed gap-2.5 rounded-lg px-3 py-2.5 text-sm opacity-50"
          >
            <Trash2 className="h-4 w-4 text-[#9CA3AF]" aria-hidden />
            Delete Member
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
