'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import { Calendar } from '@/components/molecules/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/molecules/popover';
import { cn } from '@/lib/utils';
import Typography from './Typography';

interface DateRangePickerProps {
  /** Selected date range */
  dateRange?: DateRange;
  /** Date range change handler */
  onDateRangeChange?: (dateRange: DateRange | undefined) => void;
  /** Label text */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Additional className */
  className?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Number of months to display */
  numberOfMonths?: number;
  /** Align popover */
  align?: 'start' | 'center' | 'end';
  /** date-fns pattern for the trigger label (from / to dates) */
  dateFormat?: string;
}

/**
 * Atomic component for date range picker
 * Uses shadcn Calendar in range mode with styled input field
 */
export default function DateRangePicker({
  dateRange,
  onDateRangeChange,
  label,
  placeholder = 'Select date range',
  className,
  disabled,
  numberOfMonths = 2,
  align = 'start',
  dateFormat = 'yyyy-MM-dd',
}: DateRangePickerProps): React.JSX.Element {
  const formatDateRange = (): string => {
    if (!dateRange || !dateRange.from || !(dateRange.from instanceof Date)) return placeholder;
    const fromDate = dateRange.from;
    if (!dateRange.to || !(dateRange.to instanceof Date)) return format(fromDate, dateFormat);
    const toDate = dateRange.to;
    return `${format(fromDate, dateFormat)} - ${format(toDate, dateFormat)}`;
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <Typography variant="label" className="text-sm text-form-subtitle">
          {label}
        </Typography>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'flex h-10 min-w-0 w-full items-center gap-2 rounded-md border border-form-border-light bg-white px-3 py-2 text-sm text-form-title outline-none transition-colors cursor-pointer',
              'hover:bg-gray-50',
              'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              (!dateRange || !dateRange.from || !(dateRange.from instanceof Date)) &&
                'text-form-placeholder'
            )}
          >
            <CalendarIcon className="h-4 w-4 shrink-0 text-form-subtitle" />
            <span className="min-w-0 flex-1 truncate text-left">{formatDateRange()}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from instanceof Date ? dateRange.from : undefined}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={numberOfMonths}
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
