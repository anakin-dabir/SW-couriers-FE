import * as React from 'react';
import StatCard from '@/components/atoms/StatCard';
import type { StatItem } from '@/types/stats';
import type { StatCardConfigEntry } from '@/lib/statCardConfig';
import { cn } from '@/lib/utils';

interface StatBarProps {
  /** Array of stat data to display */
  stats: StatItem[];
  /** Icon + color config per stat id (e.g. STAT_CARD_CONFIG_BILLING or STAT_CARD_CONFIG_DASHBOARD) */
  config: Record<string, StatCardConfigEntry>;
  /** Additional className */
  className?: string;
}

/**
 * StatBar component
 * Generic horizontal bar of stat cards. Use with billing or dashboard stats + config.
 */
export default function StatBar({ stats, config, className }: StatBarProps): React.JSX.Element {
  return (
    <div className={cn('grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4', className)}>
      {stats.map((stat) => {
        const entry = config[stat.id];
        const IconComponent = entry?.Icon;
        const icon = IconComponent ? (
          <IconComponent className={cn('h-6 w-6 shrink-0', entry.iconColorClass)} />
        ) : undefined;
        return (
          <StatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            href={stat.href}
            onClick={stat.onClick}
            isCritical={stat.isCritical}
            icon={icon}
          />
        );
      })}
    </div>
  );
}
