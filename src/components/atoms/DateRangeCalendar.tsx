import * as React from 'react';
import { type DateRange } from 'react-day-picker';
import { Calendar } from '@/components/molecules/calendar';
import { Button } from '@/components/atoms/Button';

interface DateRangeCalendarProps {
  /** Temporary date range being selected */
  tempDateRange?: DateRange;
  /** Handler for date range selection */
  onDateRangeChange: (range: DateRange | undefined) => void;
  /** Handler for apply button click */
  onApply: () => void;
  /** Handler for cancel button click */
  onCancel: () => void;
  /** Default month to display */
  defaultMonth?: Date;
}

/**
 * DateRangeCalendar component
 * Calendar with Apply/Cancel buttons for date range selection
 */
export default function DateRangeCalendar({
  tempDateRange,
  onDateRangeChange,
  onApply,
  onCancel,
  defaultMonth,
}: DateRangeCalendarProps): React.JSX.Element {
  const IS_APPLY_DISABLED =
    !tempDateRange ||
    !tempDateRange.from ||
    !tempDateRange.to ||
    !(tempDateRange.from instanceof Date) ||
    !(tempDateRange.to instanceof Date);

  return (
    <div className="flex min-w-0 flex-col">
      <Calendar
        mode="range"
        defaultMonth={defaultMonth}
        selected={tempDateRange}
        onSelect={onDateRangeChange}
        numberOfMonths={2}
        className="min-w-[560px] p-3"
      />
      <div className="flex items-center justify-end gap-2 border-t p-3">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="default" size="sm" onClick={onApply} disabled={IS_APPLY_DISABLED}>
          Apply
        </Button>
      </div>
    </div>
  );
}
