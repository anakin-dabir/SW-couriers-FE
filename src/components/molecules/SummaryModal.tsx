import type { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/molecules/dialog';
import SummarySection, { type SummaryItem } from '@/components/molecules/SummarySection';
import Typography from '@/components/atoms/Typography';
import { cn } from '@/lib/utils';

interface SummaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  items: SummaryItem[];
  footer?: ReactNode;
  className?: string;
}

/**
 * Reusable summary modal (Figma 4707-39803).
 * Displays a title and summary rows (e.g. Total Declared Value, Total Delivery Value).
 */
export default function SummaryModal({
  open,
  onOpenChange,
  title,
  items,
  footer,
  className,
}: SummaryModalProps): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-md', className)}>
        <DialogHeader>
          <DialogTitle>
            <Typography variant="h4" weight="semibold" className="text-gray-900">
              {title}
            </Typography>
          </DialogTitle>
        </DialogHeader>
        <SummarySection items={items} spacing="normal" className="pt-2" />
        {footer != null && <DialogFooter className="pt-4">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
