import * as React from 'react';
import Typography from './Typography';
import { cn } from '@/lib/utils';

interface DeliveryInfoCardProps {
  /** Icon to display */
  icon: React.ReactNode;
  /** Card title/label */
  title: string;
  /** Card value */
  value: string;
  /** Optional className */
  className?: string;
}

/**
 * DeliveryInfoCard atom component.
 * Displays a single delivery information card with icon, title, and value.
 */
export default function DeliveryInfoCard({
  icon,
  title,
  value,
  className,
}: DeliveryInfoCardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col w-full gap-y-1 border border-gray-200 rounded-lg px-6 pb-[40px] pt-4 h-[126px]',
        className
      )}
    >
      <div>{icon}</div>
      <div className="flex flex-col mt-[2px] max-w-[180px]">
        <Typography variant="caption" className="text-gray-500">
          {title}
        </Typography>
        <Typography variant="body" weight="semibold" className="text-gray-900 wrap-break-word">
          {value}
        </Typography>
      </div>
    </div>
  );
}
