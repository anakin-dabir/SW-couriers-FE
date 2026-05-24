import * as React from 'react';
import { cn } from '@/lib/utils';
import { Typography } from '@/components/atoms';
import { Switch } from '@/components/atoms/switch';
import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/checkbox';

interface NotificationPreferenceItemProps {
  /** Label text or content for the preference */
  label: React.ReactNode;
  /** Whether the preference is enabled */
  checked: boolean;
  /** Change handler */
  onCheckedChange: (checked: boolean) => void;
  /** Type of control: 'switch' or 'checkbox' */
  type?: 'switch' | 'checkbox';
  /** Additional className */
  className?: string;
  /** Show customize button */
  showCustomizeButton?: boolean;
  /** Customize button click handler */
  onCustomizeClick?: () => void;
}

/**
 * NotificationPreferenceItem component
 * Individual preference item with label and control (switch or checkbox)
 * Matches Figma design 425-91232
 */
export default function NotificationPreferenceItem({
  label,
  checked,
  onCheckedChange,
  type = 'checkbox',
  className,
  showCustomizeButton = false,
  onCustomizeClick,
}: NotificationPreferenceItemProps): React.JSX.Element {
  return (
    <div
      className={cn('flex items-center justify-between py-3 bg-white px-3 rounded-xl  ', className)}
    >
      <Typography variant="body" className="text-gray-900">
        {label}
      </Typography>
      <div className="flex items-center gap-3">
        {showCustomizeButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCustomizeClick}
            className="border-0 bg-gray-100 hover:bg-gray-200 text-gray-600 h-5 px-2 py-0"
          >
            Customize
          </Button>
        )}
        {type === 'switch' ? (
          <Switch checked={checked} onCheckedChange={onCheckedChange} />
        ) : (
          <div className="flex items-center">
            <Checkbox checked={checked} onChange={(e) => onCheckedChange(e.target.checked)} />
          </div>
        )}
      </div>
    </div>
  );
}
