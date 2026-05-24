'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/atoms/dialog';
import { GenerateStatementIcon } from '@/assets/img';
import { Button } from '@/components/atoms/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { Calendar } from '@/components/molecules/calendar';
import { Typography } from '@/components/atoms';
import { cn } from '@/lib/utils';

/** Custom dropdown nav with "Month" and "Year" labels above each select (for Generate Statement calendars). */
function StatementCalendarDropdownNav({
  className,
  style,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  const childArray = React.Children.toArray(children);
  const monthControl =
    childArray.find((c) => React.isValidElement(c) && c.key === 'month') ?? childArray[0];
  const yearControl =
    childArray.find((c) => React.isValidElement(c) && c.key === 'year') ?? childArray[1];
  return (
    <div className={cn('flex w-full gap-4', className)} style={style} {...rest}>
      <div
        className="flex min-w-0 flex-1 flex-col gap-1.5"
        role="group"
        aria-labelledby="statement-month-label"
      >
        <Typography
          variant="label"
          id="statement-month-label"
          className="text-xs font-medium text-muted-foreground"
        >
          Month
        </Typography>
        {monthControl}
      </div>
      <div
        className="flex min-w-0 flex-1 flex-col gap-1.5"
        role="group"
        aria-labelledby="statement-year-label"
      >
        <Typography
          variant="label"
          id="statement-year-label"
          className="text-xs font-medium text-muted-foreground"
        >
          Year
        </Typography>
        {yearControl}
      </div>
    </div>
  );
}

/** Options passed by react-day-picker to the Dropdown component. */
interface DropdownOption {
  value: number;
  label: string;
  disabled: boolean;
}

/** Custom Dropdown using shadcn Select for month/year (for Generate Statement calendars). */
function StatementCalendarDropdown(props: {
  value?: string | number | readonly string[];
  options?: DropdownOption[] | undefined;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
  components?: unknown;
  classNames?: unknown;
  [key: string]: unknown;
}): React.ReactElement {
  const {
    value = '',
    options = [],
    onChange,
    disabled,
    className,
    'aria-label': ariaLabel,
  } = props;
  const valueStr = value !== undefined && value !== null ? String(value) : '';
  const handleValueChange = (val: string): void => {
    onChange?.({ target: { value: val } } as React.ChangeEvent<HTMLSelectElement>);
  };
  return (
    <Select value={valueStr} onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger className={className} aria-label={ariaLabel}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={String(opt.value)} disabled={opt.disabled}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Selected-date styling: red-bordered circle with light red fill and red text; no hover on dates */
const STATEMENT_CALENDAR_CLASS_NAMES = {
  dropdowns: 'flex w-full gap-4',
  day: 'relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:rounded-full [&:has([aria-selected])]:border-2 [&:has([aria-selected])]:border-red-500 [&:has([aria-selected])]:bg-red-100 [&:has([aria-selected].day-outside)]:bg-red-100/50',
  day_button: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-transparent',
  selected: 'rounded-full border-2 border-red-500 bg-red-100 text-red-600 focus:bg-red-100',
} as const;

export interface GenerateStatementDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Called when open state should change (e.g. close button or overlay click) */
  onOpenChange: (open: boolean) => void;
  /** Called when Cancel is clicked */
  onCancel?: () => void;
  /** Called when Generate Statement is clicked; receives start and end date */
  onGenerateStatement?: (startDate: Date, endDate: Date) => void;
}

/**
 * Generate Statement Dialog
 * Modal for selecting a date range to generate a statement of account.
 */
export default function GenerateStatementDialog({
  open,
  onOpenChange,
  onCancel,
  onGenerateStatement,
}: GenerateStatementDialogProps): React.JSX.Element {
  const [statementStartDate, setStatementStartDate] = useState<Date | undefined>(undefined);
  const [statementEndDate, setStatementEndDate] = useState<Date | undefined>(undefined);

  const handleCancel = (): void => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleGenerateStatement = (): void => {
    if (statementStartDate && statementEndDate && !isEndBeforeStart && onGenerateStatement) {
      onGenerateStatement(statementStartDate, statementEndDate);
      onOpenChange(false);
    }
  };

  const startDay = statementStartDate
    ? new Date(
        statementStartDate.getFullYear(),
        statementStartDate.getMonth(),
        statementStartDate.getDate()
      ).getTime()
    : 0;
  const endDay = statementEndDate
    ? new Date(
        statementEndDate.getFullYear(),
        statementEndDate.getMonth(),
        statementEndDate.getDate()
      ).getTime()
    : 0;
  const isEndBeforeStart = startDay > 0 && endDay > 0 && endDay < startDay;
  const canGenerate = Boolean(statementStartDate && statementEndDate && !isEndBeforeStart);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-auto max-h-[90vh] flex-col p-0 sm:max-w-3xl">
        <div className="shrink-0 px-6 py-4">
          <DialogHeader className="flex flex-row items-center gap-3 text-left">
            <img
              src={GenerateStatementIcon}
              alt=""
              className="h-12 w-auto shrink-0 object-contain"
              aria-hidden
            />
            <div className="flex min-w-0 flex-col gap-0.5">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Generate Statement
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Select a date range to generate a statement of account.
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        <div className="overflow-auto px-6 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            <div className="flex flex-1 flex-col rounded-lg border bg-card p-4">
              <span className="mb-3 text-sm font-semibold text-gray-900">Start Date</span>
              <Calendar
                mode="single"
                captionLayout="dropdown"
                hideNavigation
                selected={statementStartDate}
                onSelect={setStatementStartDate}
                defaultMonth={statementStartDate ?? new Date()}
                className="w-full p-0"
                components={{
                  DropdownNav: StatementCalendarDropdownNav,
                  Dropdown: StatementCalendarDropdown,
                }}
                classNames={STATEMENT_CALENDAR_CLASS_NAMES}
              />
            </div>
            <div className="flex flex-1 flex-col rounded-lg border bg-card p-4">
              <span className="mb-3 text-sm font-semibold text-gray-900">End Date</span>
              <Calendar
                mode="single"
                captionLayout="dropdown"
                hideNavigation
                selected={statementEndDate}
                onSelect={setStatementEndDate}
                defaultMonth={
                  statementEndDate ??
                  (statementStartDate
                    ? new Date(
                        statementStartDate.getFullYear(),
                        statementStartDate.getMonth() + 1,
                        1
                      )
                    : new Date())
                }
                className="w-full p-0"
                components={{
                  DropdownNav: StatementCalendarDropdownNav,
                  Dropdown: StatementCalendarDropdown,
                }}
                classNames={STATEMENT_CALENDAR_CLASS_NAMES}
              />
            </div>
          </div>
          {isEndBeforeStart && (
            <Typography variant="body" className="mt-3 text-sm text-red-600" role="alert">
              End date must be on or after the start date.
            </Typography>
          )}
        </div>

        <div className="shrink-0 border-t px-6 py-4">
          <DialogFooter className="flex w-full flex-row justify-between sm:justify-between">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-32 rounded-lg"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              className="rounded-lg"
              disabled={!canGenerate}
              onClick={handleGenerateStatement}
            >
              Generate Statement
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
