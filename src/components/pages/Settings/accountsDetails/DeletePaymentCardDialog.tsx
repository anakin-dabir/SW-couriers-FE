import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/molecules/dialog';
import { Button } from '@/components/atoms/Button';

export interface DeletePaymentCardDialogProps {
  open: boolean;
  cardLabel: string | null;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function DeletePaymentCardDialog({
  open,
  cardLabel,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeletePaymentCardDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={[
          'flex h-auto w-[calc(100%-2rem)] max-w-[470px] flex-col gap-0 overflow-hidden p-0',
          'rounded-xl border border-[#E5E7EB] bg-white shadow-xl',
          'left-[50%] top-[50%] max-h-[min(90vh,400px)] translate-x-[-50%] translate-y-[-50%]',
          'sm:h-auto',
        ].join(' ')}
      >
        <div className="px-7 pt-7">
          <DialogHeader className="space-y-0 p-0 text-left sm:text-left">
            <DialogTitle className="pr-8 text-xl font-semibold leading-tight text-[#18181B]">
              Remove saved card?
            </DialogTitle>
            <DialogDescription className="mt-3 max-w-[400px] text-sm leading-relaxed text-[#6B7280]">
              {cardLabel
                ? `Remove ${cardLabel} from your organisation? This card will no longer be available for payments.`
                : 'Remove this saved card from your organisation? This card will no longer be available for payments.'}
            </DialogDescription>
          </DialogHeader>
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
            className="h-9 min-w-[88px] rounded-lg bg-[#DC2626] px-5 text-sm font-semibold text-white hover:bg-[#B91C1C] disabled:opacity-70"
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting ? 'Removing…' : 'Remove card'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
