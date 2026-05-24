import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/molecules/popover';
import { Button } from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import { cn } from '@/lib/utils';

export interface FilterPopoverOption {
  id: string;
  label: string;
}

interface FilterPopoverProps {
  label: string;
  options: FilterPopoverOption[];
  className?: string;
}

export default function FilterPopover({
  label,
  options,
  className,
}: FilterPopoverProps): React.JSX.Element {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'h-10 w-full justify-between rounded-lg border border-gray-200 bg-white px-4 text-form-title',
            className
          )}
        >
          <Typography variant="body" className="text-sm text-form-title">
            {label}
          </Typography>
          <ChevronDown className="h-4 w-4 text-form-subtitle" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-3">
        <div className="flex flex-col gap-2">
          {options.map((opt) => (
            <Button key={opt.id} type="button" variant="ghost" className="h-9 justify-start px-3">
              <Typography variant="body" className="text-sm text-form-title">
                {opt.label}
              </Typography>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
