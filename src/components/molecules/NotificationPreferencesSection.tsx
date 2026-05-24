import * as React from 'react';
import type { ReactNode } from 'react';
import { Card, CardHeader, CardContent } from '@/components/molecules/card';
import { Typography } from '@/components/atoms';
import { cn } from '@/lib/utils';

interface NotificationPreferencesSectionProps {
  /** Section title */
  title: string;
  /** Section description (optional) */
  description?: string;
  /** Section content */
  children: ReactNode;
  /** Action element (e.g., switch) to display on the right side of the title */
  action?: ReactNode;
  /** Additional className for the wrapper */
  className?: string;
  /** Additional className for the content */
  contentClassName?: string;
}

/**
 * NotificationPreferencesSection component
 * Common wrapper for notification preference sections (e.g., Notification Triggers, Channels)
 * Matches Figma design 425-91232
 */
export default function NotificationPreferencesSection({
  title,
  description,
  children,
  action,
  className,
  contentClassName,
}: NotificationPreferencesSectionProps): React.JSX.Element {
  return (
    <Card className={cn('w-full border-0 bg-gray-50', className)}>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <Typography variant="h5" weight="semibold" className="text-base text-gray-900">
              {title}
            </Typography>
            {action && <div className="flex items-center">{action}</div>}
          </div>
          {description && (
            <Typography variant="body" color="muted" className="text-sm text-gray-600">
              {description}
            </Typography>
          )}
        </div>
      </CardHeader>
      <CardContent className={cn('pt-0', contentClassName)}>{children}</CardContent>
    </Card>
  );
}
