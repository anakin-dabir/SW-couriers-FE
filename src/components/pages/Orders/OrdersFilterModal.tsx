import * as React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Dialog, DialogContent } from '@/components/atoms/dialog';
import Typography from '@/components/atoms/Typography';
import { cn } from '@/lib/utils';

export type OrdersFilterModalContext = 'failed' | 'returned';

export interface OrdersFilterState {
  packageStatusIds: string[];
  attemptSteps: number[];
}

export interface PackageStatusFilterOption {
  id: string;
  label: string;
}

const FAILED_PACKAGE_STATUS_OPTIONS: PackageStatusFilterOption[] = [
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'customer_not_home', label: 'Customer not home' },
  { id: 'missing', label: 'Missing' },
  { id: 'damaged', label: 'Damaged' },
  { id: 'customer_refused', label: 'Customer refused' },
  { id: 'disposed', label: 'Disposed' },
];

const RETURNED_STOP_STATUS_OPTIONS: PackageStatusFilterOption[] = [
  { id: 'return_initiated', label: 'Return Initiated' },
  { id: 'return_in_transit', label: 'Return in Transit' },
  { id: 'returned', label: 'Returned' },
];

const ATTEMPT_MAX = 3;
const ATTEMPT_STEPS = [0, 1, 2, 3] as const;

const ATTEMPT_DOT_FILL = ['bg-[#EAB308]', 'bg-[#F97316]', 'bg-[#EF4444]'] as const;

export function emptyFilterState(): OrdersFilterState {
  return { packageStatusIds: [], attemptSteps: [] };
}

export function countActiveFilterCategories(filters: OrdersFilterState): number {
  let count = 0;
  if (filters.packageStatusIds.length > 0) count += 1;
  if (filters.attemptSteps.length > 0) count += 1;
  return count;
}

function AttemptDotsCompact({ current, max }: { current: number; max: number }): React.JSX.Element {
  return (
    <div className="flex -space-x-1 items-center pr-0.5" aria-hidden>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < current;
        return (
          <span
            key={i}
            className={cn(
              'size-3 shrink-0 rounded-full border border-black/15 shadow-[0_0_0_1px_white]',
              filled ? ATTEMPT_DOT_FILL[Math.min(i, ATTEMPT_DOT_FILL.length - 1)] : 'bg-white'
            )}
          />
        );
      })}
    </div>
  );
}

function StatusCheckbox({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}): React.JSX.Element {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-[#5d5567] bg-white py-2 pl-3.5 pr-[18px] text-left text-sm font-normal leading-5 text-[#09090b] transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AE2224]/35'
      )}
    >
      <span
        className={cn(
          'flex size-4 shrink-0 items-center justify-center rounded-sm border',
          checked ? 'border-[#AE2224] bg-[#AE2224] text-white' : 'border-[#d4d4d8] bg-white'
        )}
      >
        {checked ? <Check className="size-3" strokeWidth={2.5} aria-hidden /> : null}
      </span>
      <span className="max-w-[200px] truncate sm:max-w-none">{label}</span>
    </button>
  );
}

export interface OrdersFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: OrdersFilterModalContext;
  applied: OrdersFilterState;
  onApply: (next: OrdersFilterState) => void;
}

export default function OrdersFilterModal({
  open,
  onOpenChange,
  context,
  applied,
  onApply,
}: OrdersFilterModalProps): React.JSX.Element {
  const packageOptions =
    context === 'failed' ? FAILED_PACKAGE_STATUS_OPTIONS : RETURNED_STOP_STATUS_OPTIONS;
  const statusSectionLabel =
    context === 'returned' ? 'Select Stop Status:' : 'Select Package Status:';

  const [draft, setDraft] = React.useState<OrdersFilterState>(applied);

  React.useEffect(() => {
    if (open) {
      setDraft({
        packageStatusIds: [...applied.packageStatusIds],
        attemptSteps: [...applied.attemptSteps],
      });
    }
  }, [open, applied]);

  const toggleStatus = (id: string): void => {
    setDraft((prev) => {
      const has = prev.packageStatusIds.includes(id);
      const packageStatusIds = has
        ? prev.packageStatusIds.filter((x) => x !== id)
        : [...prev.packageStatusIds, id];
      return { ...prev, packageStatusIds };
    });
  };

  const toggleAttempt = (step: number): void => {
    setDraft((prev) => {
      const has = prev.attemptSteps.includes(step);
      const attemptSteps = has
        ? prev.attemptSteps.filter((x) => x !== step)
        : [...prev.attemptSteps, step].sort((a, b) => a - b);
      return { ...prev, attemptSteps };
    });
  };

  const handleReset = (): void => {
    setDraft(emptyFilterState());
  };

  const handleApply = (): void => {
    onApply(draft);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideCloseButton
        className={cn(
          '!flex !h-auto max-h-[90dvh] w-full max-w-[min(calc(100vw-2rem),720px)] !flex-col gap-5 overflow-y-auto rounded-[18px] border-[#cbcbd8] bg-[#fbfbfc] p-5 shadow-md sm:left-[50%] sm:top-[50%] sm:!h-auto sm:!max-h-[min(90dvh,90vh)] sm:!max-w-[720px] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-[18px]'
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <Typography variant="body" className="text-2xl font-medium leading-5 text-[#030303]">
            Filters
          </Typography>
          <button
            type="button"
            className="flex size-9 shrink-0 items-center justify-center rounded-md text-[#030303] transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AE2224]/35"
            aria-label="Close filters"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-6" strokeWidth={1.5} aria-hidden />
          </button>
        </div>

        <div className="h-px w-full bg-[#e5e5ec]" />

        <div className="flex flex-col gap-4">
          <Typography variant="body" className="text-base font-medium leading-5 text-[#030303]">
            {statusSectionLabel}
          </Typography>
          <div className="flex flex-wrap gap-2.5">
            {packageOptions.map((opt) => (
              <StatusCheckbox
                key={opt.id}
                label={opt.label}
                checked={draft.packageStatusIds.includes(opt.id)}
                onToggle={() => toggleStatus(opt.id)}
              />
            ))}
          </div>
        </div>

        <div className="h-px w-full bg-[#e5e5ec]" />

        <div className="flex flex-col gap-4">
          <Typography variant="body" className="text-base font-medium leading-5 text-[#030303]">
            Select Attempt Number:
          </Typography>
          <div className="flex flex-wrap gap-2.5">
            {ATTEMPT_STEPS.map((step) => (
              <button
                key={step}
                type="button"
                role="checkbox"
                aria-checked={draft.attemptSteps.includes(step)}
                onClick={() => toggleAttempt(step)}
                className="inline-flex items-center gap-2 rounded-full border border-[#5d5567] bg-white py-2 pl-3.5 pr-[18px] text-left text-sm font-normal leading-5 text-[#18181b] transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AE2224]/35"
              >
                <span
                  className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded-sm border',
                    draft.attemptSteps.includes(step)
                      ? 'border-[#AE2224] bg-[#AE2224] text-white'
                      : 'border-[#d4d4d8] bg-white'
                  )}
                >
                  {draft.attemptSteps.includes(step) ? (
                    <Check className="size-3" strokeWidth={2.5} aria-hidden />
                  ) : null}
                </span>
                <AttemptDotsCompact current={step} max={ATTEMPT_MAX} />
                <span className="whitespace-nowrap">
                  {step} of {ATTEMPT_MAX} Failed Attempt
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="h-px w-full bg-[#e5e5ec]" />

        <div className="flex items-center justify-between gap-3 pt-0.5">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-md border-[#e4e4e7] bg-white px-4 text-sm font-medium text-[#18181b]"
            onClick={handleReset}
          >
            Reset Filters
          </Button>
          <Button
            type="button"
            variant="default"
            className="h-10 rounded-md bg-[#AE2224] px-4 text-sm font-medium text-[#FAFAFA] hover:bg-[#991B1B]"
            onClick={handleApply}
          >
            Apply Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
