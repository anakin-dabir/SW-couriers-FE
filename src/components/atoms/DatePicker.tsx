import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/molecules/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/molecules/popover';
import { cn } from '@/lib/utils';
import Typography from './Typography';

interface DatePickerProps {
  /** Selected date */
  date?: Date;
  /** Date change handler */
  onDateChange?: (date: Date | undefined) => void;
  /** Label text */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Additional className */
  className?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
}

/**
 * Atomic component for date picker
 * Uses shadcn Calendar in a popover with styled input field
 */
export default function DatePicker({
  date,
  onDateChange,
  label,
  placeholder = 'Select date',
  className,
  disabled,
}: DatePickerProps): React.JSX.Element {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <Typography variant="label" color="muted" className="text-xs uppercase ">
          {label}
        </Typography>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'flex h-10 w-full items-center gap-1 rounded-md border border-form-border-light bg-white px-3 py-2 text-sm text-form-title outline-none transition-colors cursor-pointer',
              'hover:bg-gray-50',
              'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              !date && 'text-form-placeholder'
            )}
          >
            <CalendarIcon className="h-4 w-4 text-form-subtitle" />
            <span className="flex-1 text-left">
              {date ? format(date, 'yyyy-MM-dd') : placeholder}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            initialFocus
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
