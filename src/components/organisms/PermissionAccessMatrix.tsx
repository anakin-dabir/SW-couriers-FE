import * as React from 'react';
import { Typography } from '@/components/atoms';
import { cn } from '@/lib/utils';
import { TEAM_PLATFORM_ACCESS_ITEMS, type TeamPlatformAccessItem } from '@/lib/teamPlatformAccess';

export type PermissionAccessLevel = 'none' | 'read' | 'write';

const LEVELS: PermissionAccessLevel[] = ['none', 'read', 'write'];
const LEVEL_LABELS: Record<PermissionAccessLevel, string> = {
  none: 'None',
  read: 'Read',
  write: 'Write',
};

interface PermissionAccessMatrixProps {
  value: Record<string, PermissionAccessLevel>;
  onChange?: (itemKey: string, level: PermissionAccessLevel) => void;
  items?: TeamPlatformAccessItem[];
  readOnly?: boolean;
  showHeader?: boolean;
  className?: string;
}

function PermissionDot({
  selected,
  disabled,
  label,
  onClick,
}: {
  selected: boolean;
  disabled: boolean;
  label: string;
  onClick?: () => void;
}): React.JSX.Element {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-4 w-4 items-center justify-center rounded-full border bg-white transition-colors disabled:cursor-default disabled:opacity-100',
        selected ? 'border-[#EF233C]' : 'border-[#C4CAD5]',
        !disabled &&
          'hover:border-[#EF233C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF233C]/25'
      )}
    >
      {selected ? <span className="h-1.5 w-1.5 rounded-full bg-[#EF233C]" /> : null}
    </button>
  );
}

export function PermissionAccessMatrix({
  value,
  onChange,
  items = TEAM_PLATFORM_ACCESS_ITEMS,
  readOnly = false,
  showHeader = true,
  className,
}: PermissionAccessMatrixProps): React.JSX.Element {
  return (
    <div className={cn('overflow-x-auto rounded-lg border border-[#E5E7EB] bg-white', className)}>
      <div className="min-w-[640px]">
        {showHeader ? (
          <div className="grid grid-cols-[minmax(260px,1fr)_66px_66px_66px] border-b border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5">
            <div>
              <Typography variant="caption" className="text-[11px] font-semibold text-[#6B7280]">
                Module
              </Typography>
            </div>
            {LEVELS.map((level) => (
              <div key={level} className="text-center">
                <Typography variant="caption" className="text-[11px] font-semibold text-[#6B7280]">
                  {LEVEL_LABELS[level]}
                </Typography>
              </div>
            ))}
          </div>
        ) : null}

        <div className="divide-y divide-[#E5E7EB]">
          {items.map((item) => {
            const current = value[item.key] ?? 'none';
            return (
              <div
                key={item.key}
                className="grid grid-cols-[minmax(260px,1fr)_66px_66px_66px] items-center px-4 py-3"
              >
                <div className="min-w-0 pr-4">
                  <Typography variant="caption" className="text-sm font-semibold text-[#111827]">
                    {item.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    className="mt-1 block max-w-[540px] text-[12px] leading-relaxed text-[#8A93A3]"
                  >
                    {item.description}
                  </Typography>
                </div>

                {LEVELS.map((level) => (
                  <div key={level} className="flex items-center justify-center">
                    <PermissionDot
                      selected={current === level}
                      disabled={readOnly || !onChange}
                      label={`${item.label} ${LEVEL_LABELS[level]} access`}
                      onClick={readOnly || !onChange ? undefined : () => onChange(item.key, level)}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
