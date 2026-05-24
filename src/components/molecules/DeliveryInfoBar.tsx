import * as React from 'react';
import { MapPinIcon, PhoneIcon, UserIcon } from 'lucide-react';
import { DeliveryInfoCard } from '@/components/atoms';
import { cn } from '@/lib/utils';

interface DeliveryInfoBarProps {
  /** Optional className */
  className?: string;
  items: ReadonlyArray<{
    id: number;
    iconType: 'user' | 'phone' | 'mapPin';
    title: string;
    value: string;
  }>;
}

/**
 * DeliveryInfoBar molecule component.
 * Displays a horizontal row of customer information cards (Customer, Contact, Address).
 */
export default function DeliveryInfoBar({
  className,
  items,
}: DeliveryInfoBarProps): React.JSX.Element {
  const getIcon = (iconType: 'user' | 'phone' | 'mapPin'): React.ReactNode => {
    const iconClass = 'w-4 h-4';
    switch (iconType) {
      case 'user':
        return <UserIcon className={cn(iconClass, 'text-blue-600')} />;
      case 'phone':
        return <PhoneIcon className={cn(iconClass, 'text-yellow-500')} />;
      case 'mapPin':
        return <MapPinIcon className={cn(iconClass, 'text-red-600')} />;
      default:
        return null;
    }
  };

  return (
    <div className={cn('flex flex-row items-center justify-between gap-x-3', className)}>
      {items.map((item) => (
        <DeliveryInfoCard
          key={item.id}
          icon={getIcon(item.iconType)}
          title={item.title}
          value={item.value}
        />
      ))}
    </div>
  );
}
