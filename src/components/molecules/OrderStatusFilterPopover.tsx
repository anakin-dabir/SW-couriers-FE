import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/molecules/popover';
import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/checkbox';
import { Badge } from '@/components/atoms/badge';
import { cn } from '@/lib/utils';
import {
  ORDER_STATUS_FILTER_OPTIONS,
  createFullOrderStatusSelection,
} from '@/lib/orderStatusFilter';

export interface OrderStatusFilterPopoverProps {
  selectedIds: Set<string>;
  onSelectedIdsChange: (next: Set<string>) => void;
  className?: string;
}

/**
 * Multi-select order status filter — Figma 303:64272 (checkbox + badge rows, Reset / Apply).
 */
export default function OrderStatusFilterPopover({
  selectedIds,
  onSelectedIdsChange,
  className,
}: OrderStatusFilterPopoverProps): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Set<string>>(() => new Set(selectedIds));

  React.useEffect(() => {
    if (open) {
      setDraft(new Set(selectedIds));
    }
  }, [open, selectedIds]);

  const fullCount = ORDER_STATUS_FILTER_OPTIONS.length;
  const allSelected = selectedIds.size === fullCount;
  const triggerLabel = allSelected ? 'Order Status' : `Order Status (${selectedIds.size})`;

  const handleReset = (): void => {
    setDraft(createFullOrderStatusSelection());
  };

  const handleApply = (): void => {
    const next = draft.size === 0 ? createFullOrderStatusSelection() : new Set(draft);
    onSelectedIdsChange(next);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'h-10 min-w-[132px] shrink-0 justify-between gap-2 rounded-md border-[#e4e4e7] bg-white px-3 text-sm font-normal',
            allSelected ? 'text-gray-500' : 'text-[#18181b]',
            className
          )}
        >
          <span className="min-w-0 truncate">{triggerLabel}</span>
          <ChevronDown className="size-4 shrink-0 text-[#18181b]" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(calc(100vw-2rem),320px)] max-h-[min(70vh,520px)] overflow-y-auto border-[#e4e4e7] p-1 shadow-md"
      >
        <div className="flex flex-col py-1">
          {ORDER_STATUS_FILTER_OPTIONS.map((opt) => (
            <div
              key={opt.id}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-muted/60"
            >
              <Checkbox
                id={`order-status-${opt.id.replace(/\s+/g, '-').toLowerCase()}`}
                checked={draft.has(opt.id)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setDraft((prev) => {
                    const next = new Set(prev);
                    if (checked) next.add(opt.id);
                    else next.delete(opt.id);
                    return next;
                  });
                }}
                className="size-4 shrink-0"
              />
              <Badge
                className={cn(
                  'border-0 px-2.5 py-0.5 text-xs font-semibold leading-4 text-white hover:opacity-95',
                  opt.badgeClassName
                )}
              >
                {opt.label}
              </Badge>
            </div>
          ))}
        </div>
        <div className="flex gap-2 border-t border-[#e4e4e7] p-2">
          <Button
            type="button"
            variant="outline"
            className="h-8 flex-1 rounded border-form-border bg-white px-2 text-xs font-normal text-form-body hover:bg-gray-50"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            type="button"
            className="h-8 flex-1 rounded border-0 bg-[#ae2224] px-2 text-xs font-normal text-white hover:bg-[#951d1f]"
            onClick={handleApply}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
