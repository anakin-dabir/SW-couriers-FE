import * as React from 'react';
import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import Typography from '@/components/atoms/Typography';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, checked, onChange, ...props }, ref) => {
    const isControlled = checked !== undefined;
    const [isChecked, setIsChecked] = useState(() => checked ?? false);
    const checkboxId = id || `checkbox-${label?.toLowerCase().replace(/\s+/g, '-') || 'default'}`;

    // Sync internal state when controlled checked prop changes
    useEffect(() => {
      if (isControlled && checked !== undefined) {
        setIsChecked(checked);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checked]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      if (!isControlled) {
        setIsChecked(e.target.checked);
      }
      onChange?.(e);
    };

    const checkedState = isControlled ? checked : isChecked;

    const emitToggle = (): void => {
      handleChange({
        target: { checked: !checkedState },
      } as React.ChangeEvent<HTMLInputElement>);
    };

    const labelId = label ? `${checkboxId}-label` : undefined;

    return (
      <div className="flex items-start gap-2">
        <button
          type="button"
          role="checkbox"
          aria-checked={checkedState}
          aria-labelledby={labelId}
          onClick={() => {
            emitToggle();
          }}
          className={cn(
            'size-5 shrink-0 rounded-sm border cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'flex items-center justify-center transition-colors',
            checkedState
              ? 'bg-primary border-primary'
              : 'bg-white border-form-border-light hover:border-form-border',
            className
          )}
        >
          {checkedState && <Check className="size-4 text-white stroke-3" />}
        </button>
        <input
          type="checkbox"
          id={checkboxId}
          ref={ref}
          checked={checkedState}
          onChange={handleChange}
          tabIndex={-1}
          className="sr-only pointer-events-none"
          aria-hidden
          {...props}
        />
        {label && labelId ? (
          <Typography
            id={labelId}
            variant="label"
            weight="medium"
            className="cursor-pointer select-none text-form-title"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              emitToggle();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                emitToggle();
              }
            }}
          >
            {label}
          </Typography>
        ) : null}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
