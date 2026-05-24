'use client';

import * as React from 'react';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import type { DayPickerProps } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { type Button, buttonVariants } from '@/components/atoms/Button';

type CalendarProps = DayPickerProps & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant'];
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  formatters,
  components,
  ...props
}: CalendarProps): React.JSX.Element {
  const defaultFormatters = {
    formatMonthDropdown: (date: Date) => date.toLocaleString('default', { month: 'short' }),
  };

  const mergedFormatters = formatters ? { ...defaultFormatters, ...formatters } : defaultFormatters;

  const defaultComponents = {
    Chevron: ({
      className: chevronClassName,
      orientation,
      ...chevronProps
    }: {
      className?: string;
      orientation?: 'left' | 'right' | 'down' | 'up';
      size?: number;
      disabled?: boolean;
      [key: string]: unknown;
    }) => {
      const Icon =
        orientation === 'left'
          ? ChevronLeftIcon
          : orientation === 'right'
            ? ChevronRightIcon
            : ChevronDownIcon;

      return <Icon className={cn('h-4 w-4', chevronClassName)} {...chevronProps} />;
    },
  };

  const mergedComponents = components ? { ...defaultComponents, ...components } : defaultComponents;

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('group/calendar p-3', className)}
      style={
        {
          '--rdp-accent-color': 'hsl(var(--primary))',
          '--rdp-accent-background-color': 'hsl(var(--accent))',
          '--rdp-day-width': '2.25rem',
          '--rdp-day-height': '2.25rem',
        } as React.CSSProperties
      }
      captionLayout={captionLayout}
      formatters={mergedFormatters}
      classNames={{
        root: 'w-fit',
        months: 'relative flex flex-col gap-y-4 sm:flex-row sm:gap-y-0',
        month: 'w-full space-y-4',
        month_caption: 'relative flex h-9 items-center justify-center',
        caption_label: 'text-sm font-medium',
        nav: 'absolute top-0 left-0 right-0 z-50 flex items-start justify-between ',

        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),

        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        month_grid: 'mt-4 w-full border-collapse space-y-1',
        weekdays: 'flex',
        weekday: 'w-9 rounded-md text-[0.8rem] font-normal text-muted-foreground',
        week: 'mt-2 flex w-full',
        day: 'relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:rounded-md [&:has([aria-selected])]:bg-primary/15 [&:has([aria-selected].day-outside)]:bg-primary/10 [&:has([aria-selected].day-range-end)]:rounded-r-md',

        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100'
        ),
        range_start: 'day-range-start rounded-l-md',
        range_end: 'day-range-end rounded-r-md',
        selected:
          'rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary',
        today: 'bg-accent text-accent-foreground rounded-md',
        outside:
          'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        disabled: 'text-muted-foreground opacity-50',
        range_middle:
          'aria-selected:bg-primary/15 aria-selected:text-primary aria-selected:rounded-none',
        hidden: 'invisible',
        dropdowns: 'flex gap-2',
        dropdown_root: 'relative',
        dropdown: 'absolute inset-0 w-full appearance-none opacity-0 z-10 cursor-pointer',

        ...classNames,
      }}
      components={mergedComponents}
      {...props}
    />
  );
}

Calendar.displayName = 'Calendar';

export { Calendar };
