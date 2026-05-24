import * as React from 'react';
import { cn } from '@/lib/utils';
import Typography from './Typography';

interface PageHeaderProps {
  /** Main heading text */
  title: string;
  /** Subtitle/description text */
  subtitle?: string;
  /** Action elements (buttons, etc.) to display on the right side */
  actions?: React.ReactNode;
  /** Additional className for the wrapper */
  className?: string;
  /** Title variant */
  titleVariant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /** Title weight */
  titleWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  /** Title className */
  titleClassName?: string;
  /** Subtitle variant */
  subtitleVariant?: 'body' | 'caption';
  /** Subtitle className */
  subtitleClassName?: string;
  /** Icon */
  Icon?: React.ReactNode;
  /** Icon className */
  iconClassName?: string;
}

/**
 * PageHeader component
 * Displays a page title, subtitle, and optional action elements
 * Actions are spaced between and aligned center with the heading
 */
export default function PageHeader({
  title,
  subtitle,
  actions,
  className,
  titleVariant = 'h4',
  titleWeight = 'semibold',
  titleClassName,
  subtitleVariant = 'body',
  subtitleClassName,
  Icon,
}: PageHeaderProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6',
        className
      )}
    >
      <div className="flex sm:justify-center justify-start items-center gap-3">
        {Icon && Icon}
        <div className="flex flex-col">
          <Typography
            variant={titleVariant}
            weight={titleWeight}
            className={cn('text-form-title', titleClassName)}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant={subtitleVariant}
              className={cn('text-gray-500!', subtitleClassName)}
            >
              {subtitle}
            </Typography>
          )}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
