import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/molecules/dropdown-menu';
import { DATE_RANGE_PRESETS, type DateRangePreset } from '@/lib/dateRangePresets';
import { cn } from '@/lib/utils';

interface DateRangePresetMenuProps {
  /** Currently selected preset */
  selectedPreset: DateRangePreset;
  /** Handler for preset selection */
  onPresetSelect: (preset: DateRangePreset) => void;
  /** Whether the dropdown is open */
  isOpen: boolean;
  /** Handler for open state change */
  onOpenChange: (open: boolean) => void;
}

/**
 * DateRangePresetMenu component
 * Dropdown menu displaying preset date range options
 */
export default function DateRangePresetMenu({
  selectedPreset,
  onPresetSelect,
  isOpen,
  onOpenChange,
}: DateRangePresetMenuProps): React.JSX.Element {
  const handlePresetClick = (preset: DateRangePreset): void => {
    onPresetSelect(preset);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <div className="absolute inset-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {DATE_RANGE_PRESETS.slice(0, -1).map((preset) => (
          <DropdownMenuItem
            key={preset.value}
            onClick={() => handlePresetClick(preset.value)}
            className={cn(selectedPreset === preset.value && 'bg-accent')}
          >
            {preset.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handlePresetClick('custom')}
          className={cn(selectedPreset === 'custom' && 'bg-accent')}
        >
          Custom
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
