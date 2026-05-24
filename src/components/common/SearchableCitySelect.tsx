import * as React from 'react';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { Input } from '@/components/atoms/input';
import { UK_CITIES } from '@/lib/ukCities';
import { cn } from '@/lib/utils';
import type { FieldError } from 'react-hook-form';
import Typography from '@/components/atoms/Typography';

interface SearchableCitySelectProps {
  id?: string;
  value: string;
  onValueChange: (next: string) => void;
  disabled?: boolean;
  placeholder?: string;
  error?: FieldError;
}

export default function SearchableCitySelect({
  id,
  value,
  onValueChange,
  disabled,
  placeholder = 'Select city / town',
  error,
}: SearchableCitySelectProps): React.JSX.Element {
  const [search, setSearch] = React.useState('');

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return UK_CITIES;
    return UK_CITIES.filter(
      (c) => c.label.toLowerCase().includes(term) || c.region.toLowerCase().includes(term)
    );
  }, [search]);

  return (
    <div className="flex w-full flex-col gap-2">
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        onOpenChange={(open) => {
          if (!open) setSearch('');
        }}
      >
        <SelectTrigger
          id={id}
          className={cn(
            'h-10 w-full',
            error && 'border-error focus:ring-error/20 focus:border-error'
          )}
        >
          {value ? (
            <span className="truncate text-sm text-form-title">{value}</span>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        <SelectContent
          position="popper"
          className="max-h-[24rem] w-[var(--radix-select-trigger-width)] p-0"
        >
          <div className="border-b border-form-border-light px-3 py-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-form-subtitle" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Search city…"
                className="h-8 pl-8 text-sm"
              />
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {filtered.length > 0 ? (
              filtered.map((city) => (
                <SelectItem key={city.value} value={city.value}>
                  {city.label}
                </SelectItem>
              ))
            ) : (
              <div className="px-3 py-3 text-xs text-form-subtitle">
                No cities match this search.
              </div>
            )}
          </div>
        </SelectContent>
      </Select>
      {error && (
        <Typography variant="caption" color="error" role="alert" className="text-sm text-error">
          {error.message}
        </Typography>
      )}
    </div>
  );
}
