import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/molecules/popover';
import { ORDER_QUICK_RANGE_OPTIONS } from '@/lib/orderQuickDateRange';
import { cn } from '@/lib/utils';

export interface OrderQuickDateRangePopoverProps {
  label: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (label: string) => void;
}

export default function OrderQuickDateRangePopover({
  label,
  open,
  onOpenChange,
  onSelect,
}: OrderQuickDateRangePopoverProps): React.JSX.Element {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-10 min-w-[129px] shrink-0 justify-between gap-2 rounded-md border-[#e4e4e7] bg-white px-3 text-sm font-normal text-[#18181b]"
        >
          <span className="min-w-0 truncate">{label}</span>
          <ChevronDown className="size-4 shrink-0" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[200px] p-1">
        <div className="flex flex-col py-0.5" role="listbox" aria-label="Quick date range">
          {ORDER_QUICK_RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              type="button"
              role="option"
              aria-selected={label === opt.label}
              className={cn(
                'rounded-sm px-2 py-2 text-left text-sm text-[#18181b] transition-colors hover:bg-muted/70',
                label === opt.label && 'bg-muted/50 font-medium'
              )}
              onClick={() => onSelect(opt.label)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
