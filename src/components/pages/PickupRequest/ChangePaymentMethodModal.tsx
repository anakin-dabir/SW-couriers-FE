import type React from 'react';
import { useState } from 'react';
import { CreditCard, Landmark, Wallet, Banknote, PenLine } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/molecules/dialog';
import Typography from '@/components/atoms/Typography';
import { Button } from '@/components/atoms/Button';
import { cn } from '@/lib/utils';
import {
  PAY_MODAL_TITLE,
  PAY_MODAL_OPTION_CARD_TITLE,
  PAY_MODAL_OPTION_CARD_DESC,
  PAY_MODAL_OPTION_BANK_TITLE,
  PAY_MODAL_OPTION_BANK_DESC,
  PAY_MODAL_OPTION_CREDIT_TITLE,
  PAY_MODAL_OPTION_CREDIT_DESC,
  PAY_MODAL_OPTION_CASH_TITLE,
  PAY_MODAL_OPTION_CASH_DESC,
  PAY_MODAL_DEFAULT_BADGE,
  PAY_MODAL_CANCEL,
  PAY_MODAL_CONFIRM,
} from '@/lib/data';

export type PaymentMethodKind = 'card' | 'bank_transfer' | 'credit_account' | 'cash';

const ALL_OPTIONS: Array<{
  id: PaymentMethodKind;
  title: string;
  description: string;
  icon: LucideIcon;
  iconWrapClass: string;
}> = [
  {
    id: 'card',
    title: PAY_MODAL_OPTION_CARD_TITLE,
    description: PAY_MODAL_OPTION_CARD_DESC,
    icon: CreditCard,
    iconWrapClass: 'bg-[#d8ccf3]',
  },
  {
    id: 'bank_transfer',
    title: PAY_MODAL_OPTION_BANK_TITLE,
    description: PAY_MODAL_OPTION_BANK_DESC,
    icon: Landmark,
    iconWrapClass: 'bg-[#b6e9e4]',
  },
  {
    id: 'credit_account',
    title: PAY_MODAL_OPTION_CREDIT_TITLE,
    description: PAY_MODAL_OPTION_CREDIT_DESC,
    icon: Wallet,
    iconWrapClass: 'bg-[#c7daf6]',
  },
  {
    id: 'cash',
    title: PAY_MODAL_OPTION_CASH_TITLE,
    description: PAY_MODAL_OPTION_CASH_DESC,
    icon: Banknote,
    iconWrapClass: 'bg-[#fadac5]',
  },
];

interface ChangePaymentMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Current method when the modal opens; used to seed selection. */
  value: PaymentMethodKind;
  /** Which methods the org has configured. When undefined or empty, all are shown. */
  allowedKinds?: PaymentMethodKind[];
  /** Which method is flagged `is_default` on the org's config — drives the "Default" badge. */
  defaultKind?: PaymentMethodKind;
  onConfirm: (method: PaymentMethodKind) => void;
}

export default function ChangePaymentMethodModal({
  open,
  onOpenChange,
  value,
  allowedKinds,
  defaultKind,
  onConfirm,
}: ChangePaymentMethodModalProps): React.JSX.Element {
  // Show every method always; mark the ones not in `allowedKinds` as disabled so the user
  // can see what the org doesn't have configured.
  const allowsAll = !allowedKinds || allowedKinds.length === 0;
  const isAllowed = (id: PaymentMethodKind): boolean =>
    allowsAll || (allowedKinds?.includes(id) ?? false);
  const [selection, setSelection] = useState<PaymentMethodKind>(value);
  const [syncFromProps, setSyncFromProps] = useState({ open, value });
  if (open !== syncFromProps.open || (open && value !== syncFromProps.value)) {
    setSyncFromProps({ open, value });
    if (open) {
      setSelection(value);
    }
  }

  const handleConfirm = (): void => {
    onConfirm(selection);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          // DialogContent defaults include h-full — shrink-wrap to content instead of filling the viewport
          'h-auto max-h-[90vh] w-full max-w-[calc(100vw-2rem)] overflow-y-auto',
          'flex flex-col gap-0 border-form-border p-5 shadow-md sm:max-w-xl sm:rounded-2xl',
          '[&>button]:hidden'
        )}
      >
        <DialogTitle className="sr-only">{PAY_MODAL_TITLE}</DialogTitle>

        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="relative flex justify-center pt-1">
              <div className="relative flex size-[100px] items-center justify-center rounded-full bg-linear-to-b from-[#ededf1] to-white shadow-inner">
                <Wallet className="size-11 text-muted-foreground" strokeWidth={1.25} aria-hidden />
                <div className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm ring-2 ring-white">
                  <PenLine className="size-4" strokeWidth={2} aria-hidden />
                </div>
              </div>
            </div>
            <Typography
              variant="h4"
              weight="medium"
              className="text-center text-xl text-form-title"
            >
              {PAY_MODAL_TITLE}
            </Typography>
          </div>

          <div className="flex w-full flex-col gap-3">
            {ALL_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const selected = selection === opt.id;
              const isDefault = defaultKind === opt.id;
              const allowed = isAllowed(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    if (!allowed) return;
                    setSelection(opt.id);
                  }}
                  aria-pressed={selected}
                  disabled={!allowed}
                  aria-disabled={!allowed}
                  title={allowed ? undefined : 'Not configured for this organization'}
                  className={cn(
                    'flex w-full flex-col rounded-lg border bg-white p-3.5 text-left transition-colors',
                    selected
                      ? 'border-[#5d5567] shadow-sm'
                      : 'border-form-border hover:border-form-border-light',
                    !allowed && 'cursor-not-allowed opacity-50 hover:border-form-border'
                  )}
                >
                  <div className="flex w-full items-center gap-3">
                    <div
                      className={cn(
                        'flex size-[50px] shrink-0 items-center justify-center overflow-hidden rounded-full',
                        opt.iconWrapClass
                      )}
                    >
                      <Icon className="size-6 text-form-title" strokeWidth={1.5} aria-hidden />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <Typography
                          variant="body"
                          weight="medium"
                          className="text-sm capitalize text-form-title"
                        >
                          {opt.title}
                        </Typography>
                        {isDefault && (
                          <span className="shrink-0 rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-white">
                            {PAY_MODAL_DEFAULT_BADGE}
                          </span>
                        )}
                      </div>
                      <Typography
                        variant="caption"
                        className="text-xs leading-normal text-form-body"
                      >
                        {opt.description}
                      </Typography>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex w-full gap-4">
            <Button
              type="button"
              variant="secondary"
              className="h-10 flex-1 rounded-lg border border-form-border bg-linear-to-b from-white to-[#fafafa] text-base text-[#384048] shadow-sm"
              onClick={() => onOpenChange(false)}
            >
              {PAY_MODAL_CANCEL}
            </Button>
            <Button
              type="button"
              variant="default"
              className="h-10 flex-1 rounded-lg shadow-[0_0_6px_0_rgba(253,164,60,0.35)]"
              onClick={handleConfirm}
            >
              {PAY_MODAL_CONFIRM}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
