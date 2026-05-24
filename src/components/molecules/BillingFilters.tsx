import * as React from 'react';
import { Search, FilterX } from 'lucide-react';
import { Input } from '@/components/atoms/input';
import { FormSelect } from '@/components/molecules';
import { Button } from '@/components/atoms/Button';
import { Typography } from '@/components/atoms';
import { cn } from '@/lib/utils';
import type { PaymentStatus } from '@/types/billing';

export interface BillingFiltersState {
  search: string;
  status: PaymentStatus | '';
}

interface BillingFiltersProps {
  /** Current filter values */
  filters: BillingFiltersState;
  /** Filter change handler */
  onFiltersChange: (filters: BillingFiltersState) => void;
  /** Clear filters handler */
  onClearFilters: () => void;
  /** Additional className */
  className?: string;
}

const STATUS_OPTIONS = [
  { value: '', label: 'Select' },
  { value: 'paid', label: 'Paid' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'overdue', label: 'Overdue' },
];

/**
 * Molecule component for billing table filters
 * Provides search and status filtering
 */
export default function BillingFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  className,
}: BillingFiltersProps): React.JSX.Element {
  const handleFilterChange = (key: keyof BillingFiltersState, value: string): void => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters = filters.search || filters.status;

  return (
    <div className={cn('flex flex-col sm:flex-row gap-4', className)}>
      {/* Search Input - Full width on mobile, flex-1 on desktop */}
      <div className="flex flex-col gap-2 w-full">
        <Typography variant="label" className="text-sm text-form-subtitle">
          Advance Search
        </Typography>
        <Input
          type="search"
          placeholder="Search by invoice, Delivery Ref.."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          leftIcon={Search}
          className="w-full"
        />
      </div>

      {/* Status and Clear Filters - 50/50 on mobile, inline on desktop */}
      <div className="grid grid-cols-2 gap-3 md:flex md:items-end md:gap-4">
        {/* Status Select */}
        <FormSelect
          label="Status"
          options={STATUS_OPTIONS}
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value as PaymentStatus | '')}
          className="w-full md:w-40"
        />

        {/* Clear Filters Button */}
        <div className="flex flex-col gap-2">
          <Typography variant="label" className="text-sm text-transparent md:hidden">
            Action
          </Typography>
          <Button
            type="button"
            variant="outline"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className="h-10 w-full px-4 bg-gray-50 hover:bg-gray-100 text-form-title border-form-border-light md:w-auto"
          >
            <FilterX className="h-4 w-4 mr-2" />
            <Typography variant="caption" weight="medium">
              Clear Filters
            </Typography>
          </Button>
        </div>
      </div>
    </div>
  );
}
