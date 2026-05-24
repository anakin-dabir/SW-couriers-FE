'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronsUpDown, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/atoms/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/atoms/popover';
import type { MapPickedAddress } from '@/components/molecules/AddressMapPicker';
import { cn } from '@/lib/utils';

interface NominatimSearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    house_number?: string;
    road?: string;
    pedestrian?: string;
    footway?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    state?: string;
    county?: string;
    state_district?: string;
    region?: string;
    postcode?: string;
    country?: string;
  };
}

export interface AddressAutocompleteProps {
  value: string;
  onSelect: (address: MapPickedAddress) => void;
  allowManualEntry?: boolean;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const comboboxInputClassName = cn(
  'h-8 border-form-border-light bg-form-surface text-xs',
  'focus-visible:ring-1 focus-visible:ring-primary-500/20'
);

export default function AddressAutocomplete({
  value,
  onSelect,
  allowManualEntry = false,
  onValueChange,
  placeholder = 'Start typing address...',
  className,
  disabled = false,
}: AddressAutocompleteProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchQuery = allowManualEntry ? value : query;

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      void fetchSuggestions(searchQuery);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  const fetchSuggestions = async (text: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          text
        )}&countrycodes=gb&addressdetails=1&limit=5`,
        {
          headers: { 'Accept-Language': 'en-GB' },
        }
      );

      if (!response.ok) throw new Error('Search failed');

      const data = (await response.json()) as NominatimSearchResult[];
      setSuggestions(data);
    } catch (error) {
      console.error('Address search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (result: NominatimSearchResult): void => {
    const addr = result.address;
    const houseNumber = addr.house_number ?? '';
    const road = addr.road ?? addr.pedestrian ?? addr.footway ?? '';
    const line1Fallback = result.display_name.split(',')[0]?.trim() ?? '';
    const line1 = [houseNumber, road].filter(Boolean).join(' ').trim() || line1Fallback;

    const pickedAddress: MapPickedAddress = {
      line1,
      line2: addr.suburb ?? addr.neighbourhood ?? '',
      country: addr.country ?? 'United Kingdom',
      region: addr.state ?? addr.county ?? addr.state_district ?? addr.region ?? '',
      city: addr.city ?? addr.town ?? addr.village ?? addr.hamlet ?? '',
      postcode: addr.postcode ?? '',
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      displayName: result.display_name,
    };

    onSelect(pickedAddress);
    setOpen(false);
    setQuery('');
  };

  const handleUseCustomAddress = (customLine1: string): void => {
    const trimmed = customLine1.trim();
    if (!trimmed) return;
    onValueChange?.(trimmed);
    setOpen(false);
    setSuggestions([]);
  };

  const handleManualInputChange = (next: string): void => {
    onValueChange?.(next);
    if (next.length >= 3) {
      setOpen(true);
    } else {
      setOpen(false);
      setSuggestions([]);
    }
  };

  const suggestionList = (
    <CommandList>
      {isLoading && (
        <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Searching...
        </div>
      )}
      {!isLoading && searchQuery.length >= 3 && suggestions.length === 0 && (
        <CommandEmpty>
          {allowManualEntry ? (
            <button
              type="button"
              className="w-full px-2 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => handleUseCustomAddress(searchQuery)}
            >
              Use &quot;{searchQuery}&quot; as address
              <span className="mt-1 block text-xs text-gray-400">
                Enter latitude and longitude manually below
              </span>
            </button>
          ) : (
            'No address found.'
          )}
        </CommandEmpty>
      )}
      {!isLoading && searchQuery.length < 3 && searchQuery.length > 0 && (
        <div className="py-6 text-center text-sm text-muted-foreground">
          Type at least 3 characters...
        </div>
      )}
      <CommandGroup>
        {suggestions.map((suggestion) => (
          <CommandItem
            key={suggestion.place_id}
            value={suggestion.display_name}
            onSelect={() => handleSelect(suggestion)}
            className="flex items-start gap-2 py-3"
          >
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex flex-col gap-0.5">
              <span className="font-medium line-clamp-1">
                {[suggestion.address.house_number, suggestion.address.road]
                  .filter(Boolean)
                  .join(' ')}
              </span>
              <span className="text-xs text-muted-foreground line-clamp-2">
                {suggestion.display_name}
              </span>
            </div>
          </CommandItem>
        ))}
      </CommandGroup>
    </CommandList>
  );

  if (allowManualEntry) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Input
            value={value}
            onChange={(event) => handleManualInputChange(event.target.value)}
            onFocus={() => {
              if (value.length >= 3) {
                setOpen(true);
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(comboboxInputClassName, className)}
            aria-expanded={open}
            aria-autocomplete="list"
          />
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] min-w-[280px] p-0"
          align="start"
        >
          <Command shouldFilter={false}>{suggestionList}</Command>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'h-8 w-full justify-between border-form-border-light bg-form-surface px-3 text-xs font-normal',
            disabled && 'cursor-not-allowed bg-gray-100 text-gray-400',
            !value && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search address..."
            value={query}
            onValueChange={setQuery}
            className="h-9"
          />
          {suggestionList}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
