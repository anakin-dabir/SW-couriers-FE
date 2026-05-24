import * as React from 'react';
import { Typography } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/molecules/dialog';

export interface DeleteTeamMemberDialogProps {
  open: boolean;
  isDeleting: boolean;
  confirmText: string;
  reason: string;
  onConfirmTextChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const FIELD_LABEL_CLASS = 'text-xs font-semibold text-[#18181B]';
const INPUT_CLASS =
  'h-10 rounded-lg border-[#E5E7EB] bg-white px-3 text-sm text-[#18181B] placeholder:text-[#9CA3AF]';
const TEXTAREA_CLASS =
  'min-h-[88px] w-full resize-none rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#18181B] outline-none placeholder:text-[#9CA3AF] focus:border-primary-500/40 focus:ring-1 focus:ring-primary-500/20';

export function DeleteTeamMemberDialog({
  open,
  isDeleting,
  confirmText,
  reason,
  onConfirmTextChange,
  onReasonChange,
  onOpenChange,
  onConfirm,
}: DeleteTeamMemberDialogProps): React.JSX.Element {
  const isDeleteKeywordMatched = confirmText.trim() === 'DELETE';
  const hasDeleteReason = reason.trim().length > 0;
  const canSubmit = isDeleteKeywordMatched && hasDeleteReason && !isDeleting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={[
          'flex h-auto w-[calc(100%-2rem)] max-w-[470px] flex-col gap-0 overflow-hidden p-0',
          'rounded-xl border border-[#E5E7EB] bg-white shadow-xl',
          'left-[50%] top-[50%] max-h-[min(90vh,520px)] translate-x-[-50%] translate-y-[-50%]',
          'sm:h-auto',
        ].join(' ')}
      >
        <div className="px-7 pt-7">
          <DialogHeader className="space-y-0 p-0 text-left sm:text-left">
            <DialogTitle className="pr-8 text-xl font-semibold leading-tight text-[#18181B]">
              Delete Team Member Permanently?
            </DialogTitle>
            <DialogDescription className="mt-3 max-w-[400px] text-sm leading-relaxed text-[#6B7280]">
              Deleting this member will permanently remove associated profile and access data. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-8 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Typography variant="caption" className={FIELD_LABEL_CLASS}>
                To confirm, type DELETE below <span className="text-primary-500">*</span>
              </Typography>
              <Input
                value={confirmText}
                onChange={(e) => onConfirmTextChange(e.target.value)}
                placeholder="Type DELETE to confirm"
                className={INPUT_CLASS}
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Typography variant="caption" className={FIELD_LABEL_CLASS}>
                Reason <span className="text-primary-500">*</span>
              </Typography>
              <textarea
                value={reason}
                onChange={(e) => onReasonChange(e.target.value)}
                placeholder="Enter reason for deletion."
                rows={3}
                className={TEXTAREA_CLASS}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-8 flex-row justify-end gap-3 border-t border-[#E5E7EB] px-7 py-4 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-9 min-w-[88px] rounded-lg border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#52525B] hover:bg-[#FAFAFA]"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-9 min-w-[88px] rounded-lg bg-primary-500 px-5 text-sm font-semibold text-white hover:bg-primary-600 disabled:bg-primary-300 disabled:text-white disabled:opacity-100"
            disabled={!canSubmit}
            onClick={onConfirm}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
