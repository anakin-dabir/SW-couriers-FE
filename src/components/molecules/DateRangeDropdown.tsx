'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import { Button } from '@/components/atoms/Button';
import { DateRangeCalendar, DateRangePresetMenu } from '@/components/atoms';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/molecules/popover';
import { type DateRangePreset } from '@/lib/dateRangePresets';
import { getPresetRange, formatDateRangeDisplay } from '@/lib/utils';
import { startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateRangeDropdownProps {
  /** Selected date range */
  dateRange?: DateRange;
  /** Date range change handler */
  onDateRangeChange?: (dateRange: DateRange | undefined) => void;
  /** Additional className */
  className?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
}

/**
 * DateRangeDropdown component
 * Dropdown button with preset date ranges and custom range picker
 */
export default function DateRangeDropdown({
  dateRange,
  onDateRangeChange,
  className,
  disabled,
}: DateRangeDropdownProps): React.JSX.Element {
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>('today');
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(dateRange);

  // Initialize with today's range if no range is provided
  useEffect(() => {
    if (!dateRange) {
      const today = new Date();
      const todayRange: DateRange = {
        from: startOfDay(today),
        to: endOfDay(today),
      };
      onDateRangeChange?.(todayRange);
    }
  }, [dateRange, onDateRangeChange]);

  const handlePresetSelect = (preset: DateRangePreset): void => {
    if (preset === 'custom') {
      setIsDropdownOpen(false);
      setTempDateRange(dateRange);
      setTimeout(() => {
        setIsCustomOpen(true);
      }, 100);
      return;
    }
    setSelectedPreset(preset);
    const range = getPresetRange(preset, dateRange);
    onDateRangeChange?.(range);
    setIsDropdownOpen(false);
  };

  const handleApply = (): void => {
    if (
      tempDateRange &&
      tempDateRange.from &&
      tempDateRange.to &&
      tempDateRange.from instanceof Date &&
      tempDateRange.to instanceof Date
    ) {
      setSelectedPreset('custom');
      onDateRangeChange?.(tempDateRange);
      setIsCustomOpen(false);
    }
  };

  const handleCancel = (): void => {
    setTempDateRange(dateRange);
    setIsCustomOpen(false);
  };

  const displayText = formatDateRangeDisplay(selectedPreset, dateRange);

  return (
    <div className={cn('relative', className)}>
      <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            disabled={disabled}
            className="gap-2"
            onClick={(e) => {
              if (!isCustomOpen) {
                e.preventDefault();
                setIsDropdownOpen(true);
              }
            }}
          >
            <CalendarIcon className="h-4 w-4" />
            {displayText}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
          <DateRangeCalendar
            tempDateRange={tempDateRange}
            onDateRangeChange={setTempDateRange}
            onApply={handleApply}
            onCancel={handleCancel}
            defaultMonth={
              (tempDateRange?.from instanceof Date ? tempDateRange.from : undefined) ||
              (dateRange?.from instanceof Date ? dateRange.from : undefined)
            }
          />
        </PopoverContent>
      </Popover>

      <DateRangePresetMenu
        selectedPreset={selectedPreset}
        onPresetSelect={handlePresetSelect}
        isOpen={isDropdownOpen}
        onOpenChange={setIsDropdownOpen}
      />
    </div>
  );
}
