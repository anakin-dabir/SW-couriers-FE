import * as React from 'react';
import { Map, Package, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/molecules/card';
import { Typography } from '@/components/atoms';
import { cn } from '@/lib/utils';

const PLACEHOLDER_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'delivery-tracking': Map,
  'recent-pickup': Package,
  'delivery-status': PieChart,
};

interface DashboardPlaceholderCardProps {
  /** Card title (e.g. "Delivery Tracking") */
  title: string;
  /** Id used to pick icon: delivery-tracking | recent-pickup | delivery-status */
  id: string;
  /** Optional className for the card */
  className?: string;
}

/**
 * Placeholder card for dashboard map, recent pickup, and delivery status sections.
 * Renders a Card with centered "Coming Soon" and icon. No map/chart logic.
 */
export default function DashboardPlaceholderCard({
  title,
  id,
  className,
}: DashboardPlaceholderCardProps): React.JSX.Element {
  const Icon = PLACEHOLDER_ICON_MAP[id] ?? Package;

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <Typography variant="h5" weight="semibold" className="text-base text-gray-900">
          {title}
        </Typography>
      </CardHeader>
      <CardContent className={cn('pt-0', id === 'delivery-tracking' && 'flex flex-col')}>
        <div
          className={cn(
            'flex w-full flex-col h-full items-center justify-center rounded-lg border border-gray-100 bg-gray-50',
            id === 'delivery-tracking' ? 'min-h-map-mobile lg:min-h-map-desktop' : 'min-h-32'
          )}
        >
          <Icon className="mb-3 h-10 w-10 text-gray-400" />
          <Typography variant="body" className="text-gray-500">
            Coming Soon
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
}
