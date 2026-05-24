export type DateRangePreset = 'today' | 'lastWeek' | 'lastMonth' | 'lastYear' | 'custom';

export interface DateRangePresetOption {
  value: DateRangePreset;
  label: string;
}

export const DATE_RANGE_PRESETS: DateRangePresetOption[] = [
  { value: 'today', label: 'Today' },
  { value: 'lastWeek', label: 'Last week' },
  { value: 'lastMonth', label: 'Last month' },
  { value: 'lastYear', label: 'Last year' },
  { value: 'custom', label: 'Custom' },
];

export const PRESET_LABELS: Record<DateRangePreset, string> = {
  today: 'Today',
  lastWeek: 'Last week',
  lastMonth: 'Last month',
  lastYear: 'Last year',
  custom: 'Custom',
};
