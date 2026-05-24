import * as React from 'react';
import { getPasswordRequirementStatuses } from '@/lib/passwordRequirements';
import { cn } from '@/lib/utils';

export interface PasswordRequirementsListProps {
  password: string;
  className?: string;
  /** Announced to screen readers when requirements update */
  id?: string;
}

export default function PasswordRequirementsList({
  password,
  className,
  id = 'password-requirements',
}: PasswordRequirementsListProps): React.JSX.Element {
  const rules = getPasswordRequirementStatuses(password);

  return (
    <ul
      id={id}
      className={cn('list-none space-y-1 p-0 text-sm leading-snug', className)}
      aria-label="Password requirements"
      aria-live="polite"
    >
      {rules.map((rule) => {
        const hasInput = password.length > 0;
        return (
          <li
            key={rule.id}
            className={cn(
              'transition-colors',
              !hasInput && 'text-gray-500',
              hasInput && rule.isMet && 'text-success',
              hasInput && !rule.isMet && 'text-red-600'
            )}
          >
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
