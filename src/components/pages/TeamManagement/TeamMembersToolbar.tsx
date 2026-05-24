import * as React from 'react';
import { CalendarDays, ChevronDown, Search } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/input';
import { Calendar } from '@/components/atoms/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/molecules/popover';
import { cn } from '@/lib/utils';
import {
  TEAM_LIST_TIME_PRESET_LABELS,
  TEAM_TOOLBAR_SEARCH_CLASS,
  TEAM_TOOLBAR_SEARCH_ICON_CLASS,
  TEAM_TOOLBAR_TRIGGER_CLASS,
  type TeamListTimePreset,
} from '@/lib/teamManagementUi';

export interface TeamMembersToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  timePreset: TeamListTimePreset;
  onTimePresetChange: (preset: TeamListTimePreset) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  dateButtonLabel: string;
}

export function TeamMembersToolbar({
  search,
  onSearchChange,
  timePreset,
  onTimePresetChange,
  dateRange,
  onDateRangeChange,
  dateButtonLabel,
}: TeamMembersToolbarProps): React.JSX.Element {
  const [dateOpen, setDateOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
      <div className="min-w-0 flex-[1_1_58%] sm:min-w-[280px]">
        <Input
          type="search"
          leftIcon={Search}
          placeholder="Search by name, contact role, number, email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          wrapperClassName="[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:text-[#9CA3AF]"
          className={cn(TEAM_TOOLBAR_SEARCH_CLASS, 'focus-visible:outline-none')}
          aria-label="Search team members"
        />
      </div>

      <div className="flex flex-[0_0_auto] flex-wrap items-center gap-3 sm:ml-auto">
        <Select
          value={timePreset}
          onValueChange={(v) => onTimePresetChange(v as TeamListTimePreset)}
        >
          <SelectTrigger
            className={cn(
              TEAM_TOOLBAR_TRIGGER_CLASS,
              'w-full min-w-[148px] justify-between sm:w-[160px]',
              '[&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-[#9CA3AF]'
            )}
          >
            <SelectValue placeholder="Period">
              {TEAM_LIST_TIME_PRESET_LABELS[timePreset]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="end" className="rounded-lg border-[#E5E7EB]">
            {(Object.keys(TEAM_LIST_TIME_PRESET_LABELS) as TeamListTimePreset[]).map((key) => (
              <SelectItem key={key} value={key} className="text-sm">
                {TEAM_LIST_TIME_PRESET_LABELS[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                TEAM_TOOLBAR_TRIGGER_CLASS,
                'w-full min-w-[220px] justify-between sm:w-auto sm:min-w-[240px] sm:max-w-[300px]'
              )}
            >
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <CalendarDays
                  className={cn('size-4 shrink-0', TEAM_TOOLBAR_SEARCH_ICON_CLASS)}
                  aria-hidden
                />
                <span className="truncate text-left text-sm font-medium text-[#18181B]">
                  {dateButtonLabel}
                </span>
              </span>
              <ChevronDown className="size-4 shrink-0 text-[#9CA3AF]" aria-hidden />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto rounded-xl border border-[#E5E7EB] p-0 shadow-lg"
            align="end"
          >
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => {
                onDateRangeChange(range);
                if (range?.from) setDateOpen(false);
              }}
              numberOfMonths={2}
              initialFocus
              className="rounded-xl"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

/** Label for the date-range control from preset + range */
export function formatTeamListDateButtonLabel(
  timePreset: TeamListTimePreset,
  dateRange: DateRange | undefined
): string {
  if (timePreset === 'all_time') return 'All Time';
  if (!dateRange?.from) return 'Select dates';
  const fromLabel = format(dateRange.from, 'dd MMM yyyy');
  const toLabel = dateRange.to ? format(dateRange.to, 'dd MMM yyyy') : fromLabel;
  return `${fromLabel} - ${toLabel}`;
}
