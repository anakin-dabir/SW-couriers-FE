'use client';

import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { Search } from 'lucide-react';

import { cn } from '@/lib/utils';

type CommandContainerProps = React.ComponentPropsWithoutRef<'div'>;
type CommandInputProps = React.ComponentPropsWithoutRef<'input'> & {
  /** cmdk controlled search value (see https://github.com/pacocoursey/cmdk) */
  onValueChange?: (value: string) => void;
};
type CommandRootProps = CommandContainerProps & {
  shouldFilter?: boolean;
  loop?: boolean;
  value?: string;
  label?: string;
  onValueChange?: (value: string) => void;
};
type CommandItemProps = CommandContainerProps & {
  value?: string;
  keywords?: string[];
  disabled?: boolean;
  forceMount?: boolean;
  onSelect?: (value: string) => void;
};

const TypedCommandPrimitive = CommandPrimitive as unknown as React.ForwardRefExoticComponent<
  CommandContainerProps & React.RefAttributes<HTMLDivElement>
> & {
  Input: React.ForwardRefExoticComponent<CommandInputProps & React.RefAttributes<HTMLInputElement>>;
  List: React.ForwardRefExoticComponent<
    CommandContainerProps & React.RefAttributes<HTMLDivElement>
  >;
  Empty: React.ForwardRefExoticComponent<
    CommandContainerProps & React.RefAttributes<HTMLDivElement>
  >;
  Group: React.ForwardRefExoticComponent<
    CommandContainerProps & React.RefAttributes<HTMLDivElement>
  >;
  Item: React.ForwardRefExoticComponent<
    CommandContainerProps & React.RefAttributes<HTMLDivElement>
  >;
};

const Command = React.forwardRef<HTMLDivElement, CommandRootProps>(
  ({ className, ...props }, ref) => (
    <TypedCommandPrimitive
      ref={ref}
      className={cn(
        'flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
        className
      )}
      {...props}
    />
  )
);
Command.displayName = 'Command';

const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  ({ className, ...props }, ref) => (
    <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
      <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      <TypedCommandPrimitive.Input
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border-0 bg-transparent py-2 text-sm outline-none',
          'placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    </div>
  )
);
CommandInput.displayName = 'CommandInput';

const CommandList = React.forwardRef<HTMLDivElement, CommandContainerProps>(
  ({ className, ...props }, ref) => (
    <TypedCommandPrimitive.List
      ref={ref}
      className={cn('max-h-[min(280px,50vh)] overflow-y-auto overflow-x-hidden p-1', className)}
      {...props}
    />
  )
);
CommandList.displayName = 'CommandList';

const CommandEmpty = React.forwardRef<HTMLDivElement, CommandContainerProps>((props, ref) => (
  <TypedCommandPrimitive.Empty ref={ref} className="py-6 text-center text-sm" {...props} />
));
CommandEmpty.displayName = 'CommandEmpty';

const CommandGroup = React.forwardRef<HTMLDivElement, CommandContainerProps>(
  ({ className, ...props }, ref) => (
    <TypedCommandPrimitive.Group
      ref={ref}
      className={cn(
        'overflow-hidden p-1 text-foreground **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground',
        className
      )}
      {...props}
    />
  )
);
CommandGroup.displayName = 'CommandGroup';

const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>(
  ({ className, ...props }, ref) => (
    <TypedCommandPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center justify-between gap-2 rounded-sm px-2 py-2 text-sm outline-none',
        'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
        "data-[selected='true']:bg-accent data-[selected='true']:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
);
CommandItem.displayName = 'CommandItem';

export { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem };
