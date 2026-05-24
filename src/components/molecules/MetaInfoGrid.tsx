import { Typography } from '@/components/atoms';
import { InvoiceMetaRow } from '@/components/molecules';
import { cn } from '@/lib/utils';

export interface MetaInfoItem {
  label: string;
  value: string;
}

interface MetaInfoGridProps {
  items: MetaInfoItem[];
  layout?: 'equal' | 'custom';
  className?: string;
  footerText?: string;
  footerAlign?: 'left' | 'right';
  rightColumnAlign?: 'left' | 'right';
}

/**
 * MetaInfoGrid Molecule
 *
 * Displays metadata in a grid layout with consistent styling
 * - 'equal' layout: Items distributed equally across columns (2x2 for 4 items)
 * - 'custom' layout: First column gets first items, second column gets remaining items
 *   For 3 items: 2 in first column, 1 in second column (right-aligned if specified)
 */
export default function MetaInfoGrid({
  items,
  layout = 'equal',
  className,
  footerText,
  footerAlign = 'right',
  rightColumnAlign = 'left',
}: MetaInfoGridProps): React.JSX.Element {
  if (layout === 'equal') {
    // Equal distribution: 2 columns, items split evenly
    const MID_POINT = Math.ceil(items.length / 2);
    const FIRST_COLUMN = items.slice(0, MID_POINT);
    const SECOND_COLUMN = items.slice(MID_POINT);

    return (
      <div className={cn('bg-gray-200  rounded-lg p-5', className)}>
        <div className="grid grid-cols-2 gap-10">
          <div className="space-y-4">
            {FIRST_COLUMN.map((item, index) => (
              <InvoiceMetaRow key={index} label={item.label} value={item.value} />
            ))}
          </div>
          <div className={cn('space-y-4', rightColumnAlign === 'right' && 'text-right')}>
            {SECOND_COLUMN.map((item, index) => (
              <InvoiceMetaRow key={index} label={item.label} value={item.value} />
            ))}
            {footerText && (
              <Typography
                variant="caption"
                color="muted"
                className={cn('text-xs text-gray-500', footerAlign === 'right' && 'text-right')}
              >
                {footerText}
              </Typography>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Custom layout: First column gets first items, second column gets remaining
  // For 3 items: 2 in first column, 1 in second column (aligned with 2nd row)
  const FIRST_COLUMN_COUNT = Math.ceil(items.length / 2);
  const FIRST_COLUMN = items.slice(0, FIRST_COLUMN_COUNT);
  const SECOND_COLUMN = items.slice(FIRST_COLUMN_COUNT);
  const HAS_THREE_ITEMS = items.length === 3;

  return (
    <div className={cn('bg-gray-50 rounded-lg p-5', className)}>
      <div className="grid grid-cols-2 gap-10">
        <div className="space-y-4">
          {FIRST_COLUMN.map((item, index) => (
            <InvoiceMetaRow key={index} label={item.label} value={item.value} />
          ))}
        </div>
        <div className={cn('space-y-4', rightColumnAlign === 'right' && 'text-right')}>
          {HAS_THREE_ITEMS && (
            <div className="flex flex-col gap-2 invisible">
              <Typography variant="caption" color="muted" className="text-sm text-gray-500">
                Spacer
              </Typography>
              <Typography variant="body" weight="medium" className="text-base text-gray-900">
                Spacer
              </Typography>
            </div>
          )}
          {SECOND_COLUMN.map((item, index) => (
            <InvoiceMetaRow key={index} label={item.label} value={item.value} />
          ))}
          {footerText && (
            <Typography
              variant="caption"
              color="muted"
              className={cn('text-xs text-gray-500', footerAlign === 'right' && 'text-right')}
            >
              {footerText}
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
}
