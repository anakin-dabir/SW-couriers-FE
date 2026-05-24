import { Dialog, DialogContent } from '@/components/molecules/dialog';
import { ErrorState } from '@/components/atoms';

interface ModalErrorStateProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  description: string;
  onRetry?: () => void;
  maxWidth?: string;
}

/**
 * ModalErrorState Molecule
 *
 * Reusable error state for modals
 * Used in both Invoice Details Modal and Statement Modal
 */
export default function ModalErrorState({
  isOpen,
  onClose,
  message,
  description,
  onRetry,
  maxWidth = 'max-w-4xl',
}: ModalErrorStateProps): React.JSX.Element {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${maxWidth} max-h-[90vh] overflow-y-auto`}>
        <ErrorState message={message} description={description} onRetry={onRetry} />
      </DialogContent>
    </Dialog>
  );
}
