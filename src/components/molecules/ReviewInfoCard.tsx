import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { SquarePen } from 'lucide-react';
import Typography from '@/components/atoms/Typography';
import { cn } from '@/lib/utils';

export interface ReviewInfoCardItem {
  label: string;
  value: string;
}

export type ReviewInfoCardIconColor = 'primary' | 'blue' | 'orange' | 'purple' | 'green';

const ICON_COLOR_CLASSES: Record<ReviewInfoCardIconColor, string> = {
  primary: 'text-primary',
  blue: 'text-info',
  orange: 'text-warning',
  purple: 'text-purple-500',
  green: 'text-success',
};

interface ReviewInfoCardProps {
  title: string;
  icon: LucideIcon;
  iconColor?: ReviewInfoCardIconColor;
  onEdit: () => void;
  items?: ReviewInfoCardItem[];
  notProvided?: string;
  className?: string;
  /** When provided, renders instead of items grid (e.g. for Package Details layout). */
  children?: ReactNode;
}

/**
 * ReviewInfoCard Molecule (Figma 4709-40534).
 *
 * Reusable review card with icon, title, edit button, and a 2-column grid of label/value pairs.
 */
export default function ReviewInfoCard({
  title,
  icon: Icon,
  iconColor = 'primary',
  onEdit,
  items = [],
  notProvided = '—',
  className,
  children,
}: ReviewInfoCardProps): React.JSX.Element {
  const iconClasses = ICON_COLOR_CLASSES[iconColor];

  return (
    <div
      className={cn(
        'flex flex-col gap-6 rounded-lg border border-form-border bg-[#fbfbfb] px-4 py-5',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Icon className={cn('size-6 shrink-0', iconClasses)} strokeWidth={1.5} />
          <Typography variant="h5" weight="medium" className="text-xl leading-5 text-form-title">
            {title}
          </Typography>
        </div>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${title}`}
          className="flex size-6 items-center justify-center text-form-title transition-colors hover:text-form-subtitle focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <SquarePen className="size-6 shrink-0" strokeWidth={1.5} />
        </button>
      </div>

      {/* Separator */}
      <div className="h-px w-full bg-form-border" />

      {/* Content */}
      {children != null ? (
        children
      ) : (
        <div className="flex flex-col gap-6">
          {/* Group items in rows of 2 */}
          {Array.from({ length: Math.ceil(items.length / 2) }, (_, rowIndex) => {
            const startIndex = rowIndex * 2;
            const rowItems = items.slice(startIndex, startIndex + 2);
            return (
              <div key={rowIndex} className="flex gap-3">
                {rowItems.map((item, colIndex) => (
                  <div key={startIndex + colIndex} className="flex flex-1 flex-col gap-2">
                    <Typography
                      variant="caption"
                      weight="medium"
                      className="text-sm leading-none text-form-subtitle"
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      variant="body"
                      weight="medium"
                      className="text-base leading-none text-form-title"
                    >
                      {item.value || notProvided}
                    </Typography>
                  </div>
                ))}
                {/* If odd number of items in last row, add empty spacer */}
                {rowItems.length === 1 && <div className="flex-1" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
