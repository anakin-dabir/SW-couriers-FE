import * as React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/atoms/input';
import { FilterPopover } from '@/components/atoms';
import { useFormValidation } from '@/hooks/useFormValidation';
import { trackingDeliveriesFiltersSchema, type TrackingDeliveriesFiltersValues } from '@/schemas';
import { cn } from '@/lib/utils';
import type { FilterPopoverOption } from '@/components/atoms/FilterPopover';

interface TrackingFiltersHeaderProps {
  filterOptions: FilterPopoverOption[];
  className?: string;
  onSearchChange?: (value: string) => void;
}

export default function TrackingFiltersHeader({
  filterOptions,
  className,
  onSearchChange,
}: TrackingFiltersHeaderProps): React.JSX.Element {
  const form = useFormValidation({
    schema: trackingDeliveriesFiltersSchema,
    defaultValues: { search: '' } satisfies TrackingDeliveriesFiltersValues,
  });

  const searchRegister = form.register('search', {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange?.(String(e.target.value));
    },
  });

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex-1">
        <Input
          type="search"
          placeholder="Search"
          leftIcon={Search}
          className="h-10 rounded-lg"
          {...searchRegister}
        />
      </div>
      <div className="w-48">
        <FilterPopover label="Filter" options={filterOptions} />
      </div>
    </div>
  );
}
