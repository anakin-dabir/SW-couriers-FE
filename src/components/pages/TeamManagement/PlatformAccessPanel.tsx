import * as React from 'react';
import Typography from '@/components/atoms/Typography';
import { cn } from '@/lib/utils';
import { permissionLevelBadge } from '@/lib/teamManagementUi';
import { TEAM_PLATFORM_ACCESS_ITEMS, type TeamPlatformAccessItem } from '@/lib/teamPlatformAccess';
import type { PermissionAccessLevel } from '@/components/organisms/PermissionAccessMatrix';

export interface PlatformAccessPanelProps {
  value: Record<string, PermissionAccessLevel>;
  items?: TeamPlatformAccessItem[];
  className?: string;
}

export function PlatformAccessPanel({
  value,
  items = TEAM_PLATFORM_ACCESS_ITEMS,
  className,
}: PlatformAccessPanelProps): React.JSX.Element {
  return (
    <ul className={cn('flex flex-col gap-5 px-6 py-5', className)}>
      {items.map((item) => {
        const level = value[item.key] ?? 'none';
        const badge = permissionLevelBadge(level);

        return (
          <li key={item.key} className="flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1 pr-2">
              <Typography
                variant="body"
                weight="semibold"
                className="text-sm font-semibold text-[#18181B]"
              >
                {item.label}
              </Typography>
              <Typography
                variant="caption"
                className="mt-1 block text-sm leading-relaxed text-[#6B7280]"
              >
                {item.description}
              </Typography>
            </div>
            <span
              className={cn(
                'inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold',
                badge.className
              )}
            >
              {badge.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
