'use client';

import { forwardRef, useId, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { FieldError } from 'react-hook-form';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/atoms/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/atoms/command';
import Typography from '@/components/atoms/Typography';
import { Badge } from '@/components/atoms/badge';
import { cn } from '@/lib/utils';
import { PICKUP_CONTACT_NAME_LIST, type PickupContact, type PickupContactRole } from '@/lib/data';

function roleBadgeClass(role: PickupContactRole): string {
  const map: Record<PickupContactRole, string> = {
    owner: 'border-transparent bg-neutral-950 text-white hover:bg-neutral-950',
    logistics: 'border-transparent bg-blue-600 text-white hover:bg-blue-600',
    finance: 'border-transparent bg-emerald-600 text-white hover:bg-emerald-600',
    warehouse: 'border-transparent bg-purple-600 text-white hover:bg-purple-600',
  };
  return map[role];
}

function ContactRoleChip({ contact }: { contact: PickupContact }): React.JSX.Element {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none',
        roleBadgeClass(contact.role)
      )}
    >
      {contact.roleLabel}
    </Badge>
  );
}

function StaticRoleChip({ label }: { label: string }): React.JSX.Element {
  return (
    <Badge
      variant="secondary"
      className="shrink-0 rounded-full border-transparent bg-blue-600 px-2 py-0.5 text-[11px] font-semibold leading-none text-white hover:bg-blue-600"
    >
      {label}
    </Badge>
  );
}

export interface PickupContactNameComboboxProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  roleLabel?: string;
  disabled?: boolean;
  error?: FieldError;
}

const PLACEHOLDER = 'Select Contact name';
const SEARCH_PLACEHOLDER = 'Search name';

const PickupContactNameCombobox = forwardRef<HTMLButtonElement, PickupContactNameComboboxProps>(
  function PickupContactNameCombobox(
    { id, name, value, onChange, onBlur, roleLabel, disabled = false, error },
    ref
  ): React.JSX.Element {
    const [open, setOpen] = useState(false);
    const listId = useId();

    const displayLabel = (value ?? '').trim();
    const selectedContact: PickupContact | undefined = PICKUP_CONTACT_NAME_LIST.find(
      (c) => c.value === displayLabel
    );

    return (
      <div className="flex w-full flex-col gap-2">
        <Popover open={open} onOpenChange={setOpen} modal={false}>
          <PopoverTrigger asChild>
            <button
              ref={ref}
              id={id}
              name={name}
              type="button"
              role="combobox"
              aria-expanded={open}
              aria-controls={listId}
              aria-haspopup="listbox"
              aria-invalid={error ? 'true' : 'false'}
              disabled={disabled}
              onBlur={onBlur}
              className={cn(
                'flex h-10 w-full items-center justify-between gap-2 rounded-md border border-form-border-light bg-form-surface px-3 py-2 text-left text-sm shadow-sm outline-none',
                'focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:border-primary-500',
                'disabled:cursor-not-allowed disabled:opacity-100',
                error && 'border-error focus-visible:border-error focus-visible:ring-error/20'
              )}
            >
              <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                {selectedContact ? (
                  <>
                    <span className="min-w-0 truncate font-medium text-form-title">
                      {selectedContact.value}
                    </span>
                    <ContactRoleChip contact={selectedContact} />
                  </>
                ) : displayLabel ? (
                  <>
                    <span className="min-w-0 flex-1 truncate font-medium text-form-title">
                      {displayLabel}
                    </span>
                    {roleLabel ? <StaticRoleChip label={roleLabel} /> : null}
                  </>
                ) : (
                  <span className="min-w-0 flex-1 truncate font-medium text-form-placeholder">
                    {PLACEHOLDER}
                  </span>
                )}
              </div>
              {open ? (
                <ChevronUp className="size-4 shrink-0 text-form-subtitle" aria-hidden />
              ) : (
                <ChevronDown className="size-4 shrink-0 text-form-subtitle" aria-hidden />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent
            id={listId}
            className="w-[var(--radix-popover-trigger-width)] min-w-[min(100%,20rem)] p-0"
            align="start"
            sideOffset={4}
          >
            <Command shouldFilter loop={false} label="Search contacts">
              <CommandInput placeholder={SEARCH_PLACEHOLDER} />
              <CommandList>
                <CommandEmpty>No contact found.</CommandEmpty>
                <CommandGroup>
                  {PICKUP_CONTACT_NAME_LIST.map((contact) => (
                    <CommandItem
                      key={contact.value}
                      value={contact.value}
                      keywords={[contact.roleLabel]}
                      onSelect={() => {
                        onChange(contact.value);
                        setOpen(false);
                      }}
                    >
                      <span className="min-w-0 flex-1 truncate font-medium text-form-title">
                        {contact.value}
                      </span>
                      <ContactRoleChip contact={contact} />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {error && (
          <Typography variant="caption" color="error" role="alert" className="text-sm text-error">
            {error.message}
          </Typography>
        )}
      </div>
    );
  }
);

PickupContactNameCombobox.displayName = 'PickupContactNameCombobox';

export default PickupContactNameCombobox;
