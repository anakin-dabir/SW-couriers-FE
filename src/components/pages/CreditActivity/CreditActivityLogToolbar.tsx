import * as React from 'react';
import { CalendarDays, Check, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import { Button } from '@/components/atoms/Button';
import { Calendar } from '@/components/atoms/calendar';
import { Input } from '@/components/atoms/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/molecules/popover';
import { cn } from '@/lib/utils';
import {
  CREDIT_ACTIVITY_APPLY_BUTTON_CLASS,
  CREDIT_ACTIVITY_DROPDOWN_PANEL_CLASS,
  CREDIT_ACTIVITY_PAGE_EVENT_FILTERS,
  CREDIT_ACTIVITY_TIME_PRESETS,
  CREDIT_ACTIVITY_TOOLBAR_TRIGGER_CLASS,
  formatCreditActivityWindowLabel,
  type CreditActivityTimePreset,
} from '@/lib/creditActivityUi';

export interface CreditActivityLogToolbarProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  timePreset: CreditActivityTimePreset;
  onTimePresetChange: (preset: CreditActivityTimePreset) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  windowIso: { fromIso: string; toIso: string } | undefined;
  selectedEventTypes: string[];
  onApplyEventTypes: (types: string[]) => void;
}

export function CreditActivityLogToolbar({
  searchInput,
  onSearchChange,
  timePreset,
  onTimePresetChange,
  dateRange,
  onDateRangeChange,
  windowIso,
  selectedEventTypes,
  onApplyEventTypes,
}: CreditActivityLogToolbarProps): React.JSX.Element {
  const [timeMenuOpen, setTimeMenuOpen] = React.useState(false);
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  const [eventTypeOpen, setEventTypeOpen] = React.useState(false);
  const [eventTypeDraft, setEventTypeDraft] = React.useState<string[]>(selectedEventTypes);

  React.useEffect(() => {
    if (eventTypeOpen) {
      setEventTypeDraft(selectedEventTypes);
    }
  }, [eventTypeOpen, selectedEventTypes]);

  const dateButtonLabel = formatCreditActivityWindowLabel(windowIso, dateRange, timePreset);
  const eventTypeLabel =
    selectedEventTypes.length === 0 ? 'Any' : `Event Type (${selectedEventTypes.length})`;
  const presetActive = !dateRange?.from;

  return (
    <div className="flex flex-col gap-3 border-b border-[#E5E7EB] px-5 py-4 lg:flex-row lg:items-center">
      <Input
        type="search"
        value={searchInput}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by Event Type, User type, Email..."
        leftIcon={Search}
        className="h-10 flex-1 rounded-lg border-[#E4E4E7] bg-white text-[#18181B] placeholder:text-[#9CA3AF] lg:min-w-0"
      />

      <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
        <DropdownMenu open={timeMenuOpen} onOpenChange={setTimeMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(CREDIT_ACTIVITY_TOOLBAR_TRIGGER_CLASS, 'min-w-[132px]')}
            >
              <span>{timePreset}</span>
              {timeMenuOpen ? (
                <ChevronUp className="size-4 shrink-0 text-[#71717A]" aria-hidden />
              ) : (
                <ChevronDown className="size-4 shrink-0 text-[#71717A]" aria-hidden />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={cn(
              CREDIT_ACTIVITY_DROPDOWN_PANEL_CLASS,
              'min-w-[var(--radix-dropdown-menu-trigger-width)]'
            )}
          >
            {CREDIT_ACTIVITY_TIME_PRESETS.map((preset) => {
              const selected = presetActive && timePreset === preset;
              return (
                <DropdownMenuItem
                  key={preset}
                  onSelect={() => {
                    onTimePresetChange(preset);
                    onDateRangeChange(undefined);
                  }}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-3 py-2.5 pl-3 pr-2 text-sm text-[#18181B]',
                    selected && 'bg-[#F4F4F5]'
                  )}
                >
                  <span>{preset}</span>
                  {selected ? (
                    <Check className="size-4 shrink-0 text-[#BE1E2D]" aria-hidden />
                  ) : null}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                CREDIT_ACTIVITY_TOOLBAR_TRIGGER_CLASS,
                'min-w-[240px] max-w-[min(100%,320px)]'
              )}
            >
              <span className="inline-flex min-w-0 flex-1 items-center gap-2 truncate text-left">
                <CalendarDays className="size-4 shrink-0 text-[#71717A]" aria-hidden />
                {dateButtonLabel}
              </span>
              {datePickerOpen ? (
                <ChevronUp className="size-4 shrink-0 text-[#71717A]" aria-hidden />
              ) : (
                <ChevronDown className="size-4 shrink-0 text-[#71717A]" aria-hidden />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className={cn(CREDIT_ACTIVITY_DROPDOWN_PANEL_CLASS, 'w-auto')}
          >
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => onDateRangeChange(range)}
              numberOfMonths={2}
              initialFocus
              className="rounded-lg"
            />
          </PopoverContent>
        </Popover>

        <Popover open={eventTypeOpen} onOpenChange={setEventTypeOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(CREDIT_ACTIVITY_TOOLBAR_TRIGGER_CLASS, 'min-w-[132px]')}
            >
              <span>{eventTypeLabel}</span>
              {eventTypeOpen ? (
                <ChevronUp className="size-4 shrink-0 text-[#71717A]" aria-hidden />
              ) : (
                <ChevronDown className="size-4 shrink-0 text-[#71717A]" aria-hidden />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className={cn(CREDIT_ACTIVITY_DROPDOWN_PANEL_CLASS, 'w-[300px]')}
          >
            <div className="max-h-[min(300px,_55vh)] space-y-3 overflow-y-auto px-4 py-3">
              {CREDIT_ACTIVITY_PAGE_EVENT_FILTERS.map(({ value, label }) => {
                const checked = eventTypeDraft.includes(value);
                return (
                  <div
                    key={value}
                    className="flex cursor-pointer items-start gap-3 text-sm text-[#18181B]"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      aria-label={label}
                      onChange={(event) => {
                        setEventTypeDraft((prev) =>
                          event.target.checked
                            ? [...prev, value]
                            : prev.filter((item) => item !== value)
                        );
                      }}
                      className="mt-0.5 size-4 shrink-0 rounded border-[#D4D4D8] accent-[#BE1E2D]"
                    />
                    <span className="leading-snug">{label}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-[#E5E7EB] px-4 py-3">
              <Button
                variant="ghost"
                type="button"
                className="h-9 px-0 text-sm font-medium text-[#18181B] hover:bg-transparent"
                onClick={() => {
                  setEventTypeDraft([]);
                  onApplyEventTypes([]);
                  setEventTypeOpen(false);
                }}
              >
                Reset
              </Button>
              <Button
                type="button"
                className={CREDIT_ACTIVITY_APPLY_BUTTON_CLASS}
                onClick={() => {
                  onApplyEventTypes(eventTypeDraft);
                  setEventTypeOpen(false);
                }}
              >
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
