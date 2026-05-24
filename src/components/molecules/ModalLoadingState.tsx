import { Dialog, DialogContent } from '@/components/molecules/dialog';
import { Typography } from '@/components/atoms';

interface ModalLoadingStateProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  maxWidth?: string;
}

/**
 * ModalLoadingState Molecule
 *
 * Reusable loading state for modals
 * Used in both Invoice Details Modal and Statement Modal
 */
export default function ModalLoadingState({
  isOpen,
  onClose,
  message = 'Loading...',
  maxWidth = 'max-w-4xl',
}: ModalLoadingStateProps): React.JSX.Element {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${maxWidth} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-center py-12">
          <Typography variant="body" color="muted">
            {message}
          </Typography>
        </div>
      </DialogContent>
    </Dialog>
  );
}
