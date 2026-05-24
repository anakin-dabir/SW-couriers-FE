import * as React from 'react';
import { Search, FilterX, Check, ChevronDown } from 'lucide-react';
import { Input } from '@/components/atoms/input';
import { DatePicker } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';
import { Typography } from '@/components/atoms';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/molecules/dropdown-menu';
import { cn } from '@/lib/utils';
import type { DeliveryStatus } from '@/types/delivery';
import { DELIVERY_LIST_STATUS_CHIP_OPTIONS } from '@/lib/data';

export interface DeliveryFiltersState {
  search: string;
  status: DeliveryStatus | '';
  fromDate?: Date;
  toDate?: Date;
}

interface DeliveriesFiltersProps {
  /** Current filter values */
  filters: DeliveryFiltersState;
  /** Filter change handler */
  onFiltersChange: (filters: DeliveryFiltersState) => void;
  /** Clear filters handler */
  onClearFilters: () => void;
  /** Additional className */
  className?: string;
}

/**
 * Molecule component for deliveries table filters
 * Provides search and status filtering
 */
export default function DeliveriesFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  className,
}: DeliveriesFiltersProps): React.JSX.Element {
  const [selectedStatusOptionId, setSelectedStatusOptionId] = React.useState<string | null>(() => {
    const firstMatch = DELIVERY_LIST_STATUS_CHIP_OPTIONS.find(
      (option) => option.value === filters.status
    );
    return firstMatch?.id ?? null;
  });

  React.useEffect(() => {
    if (!filters.status) {
      setSelectedStatusOptionId(null);
    }
  }, [filters.status]);

  const handleFilterChange = (
    key: keyof DeliveryFiltersState,
    value: string | Date | undefined
  ): void => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters =
    (filters.search && filters.search.trim() !== '') ||
    filters.status !== '' ||
    filters.fromDate !== undefined ||
    filters.toDate !== undefined;

  return (
    <div className={cn('flex flex-col sm:flex-row gap-4 items-end', className)}>
      {/* Search Input */}
      <div className="flex flex-col gap-2 flex-1 w-full sm:w-auto">
        <Typography variant="label" color="muted" className="text-xs uppercase">
          Advance Search
        </Typography>
        <Input
          type="search"
          placeholder="Search by tracking ID, recipient name, address.."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          leftIcon={Search}
          className="w-full"
        />
      </div>

      {/* From Date */}
      <DatePicker
        label="From Date"
        date={filters.fromDate}
        onDateChange={(date) => handleFilterChange('fromDate', date)}
        placeholder="Select from date"
        className="w-full sm:w-60"
      />

      {/* To Date */}
      <DatePicker
        label="To Date"
        date={filters.toDate}
        onDateChange={(date) => handleFilterChange('toDate', date)}
        placeholder="Select to date"
        className="w-full sm:w-60"
      />

      {/* Status Select */}
      <div className="flex flex-col gap-2 w-full sm:w-80">
        <Typography variant="label" color="muted" className="text-xs uppercase">
          Status
        </Typography>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'h-10 w-full rounded-xl border border-[#D4D4DC] bg-white px-4',
                'flex items-center justify-between text-form-title text-lg'
              )}
            >
              <span>
                {selectedStatusOptionId
                  ? (DELIVERY_LIST_STATUS_CHIP_OPTIONS.find(
                      (option) => option.id === selectedStatusOptionId
                    )?.label ?? 'Status')
                  : 'Status'}
              </span>
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[min(26rem,92vw)] rounded-xl p-3">
            <div className="px-1 pb-3">
              <Typography variant="h5" weight="semibold" className="text-form-title">
                Filter by: Status
              </Typography>
            </div>
            <div className="space-y-1">
              {DELIVERY_LIST_STATUS_CHIP_OPTIONS.map((option) => {
                const isSelected = selectedStatusOptionId === option.id;
                return (
                  <DropdownMenuItem
                    key={option.id}
                    onClick={() => {
                      setSelectedStatusOptionId(option.id);
                      handleFilterChange('status', option.value);
                    }}
                    className="rounded-lg px-2 py-2"
                  >
                    <span className="inline-flex w-5 justify-center">
                      {isSelected ? <Check className="h-4 w-4 text-black" /> : null}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-4 py-1 text-sm leading-none font-semibold',
                        option.chipClassName
                      )}
                    >
                      {option.label}
                    </span>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuItem
                onClick={() => {
                  setSelectedStatusOptionId(null);
                  handleFilterChange('status', '');
                }}
                className="rounded-lg px-2 py-2"
              >
                <span className="inline-flex w-5 justify-center">
                  {selectedStatusOptionId === null ? (
                    <Check className="h-4 w-4 text-black" />
                  ) : null}
                </span>
                <span className="inline-flex items-center rounded-full bg-gray-100 px-4 py-1 text-sm font-medium text-gray-700">
                  All statuses
                </span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Clear Filters Button */}
      <div className="flex flex-col gap-2 w-full sm:w-auto">
        <Typography variant="label" className="text-sm text-transparent sm:hidden">
          Action
        </Typography>
        <Button
          type="button"
          variant="outline"
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
          className="h-10 w-full sm:w-auto px-4 bg-gray-50 hover:bg-gray-100 text-form-title border-0"
        >
          <FilterX className="h-4 w-4 mr-2" />
          <Typography variant="caption" weight="medium">
            Clear Filters
          </Typography>
        </Button>
      </div>
    </div>
  );
}
