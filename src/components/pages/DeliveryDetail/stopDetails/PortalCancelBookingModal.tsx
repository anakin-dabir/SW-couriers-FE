import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/atoms/dialog';
import { Button } from '@/components/atoms/Button';
import { Textarea } from '@/components/atoms/textarea';
import Typography from '@/components/atoms/Typography';
import { CancelIcon } from '@/assets/svg';
import {
  PORTAL_MODAL_BODY,
  PORTAL_MODAL_CANCEL_BTN,
  PORTAL_MODAL_DESCRIPTION,
  PORTAL_MODAL_DESTRUCTIVE_BTN,
  PORTAL_MODAL_FOOTER,
  PORTAL_MODAL_FOOTER_ROW,
  PORTAL_MODAL_ICON_LARGE,
  PORTAL_MODAL_LABEL,
  PORTAL_MODAL_TEXTAREA,
  PORTAL_MODAL_TITLE,
  PORTAL_MODAL_WRAPPER,
} from '@/lib/modalStyles';

interface PortalCancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  saving?: boolean;
}

export default function PortalCancelBookingModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Cancel Booking Order?',
  description = 'Are you sure you want to cancel this booking? This action will cancel the entire order and may trigger refunds or billing adjustments.',
  confirmLabel = 'Confirm Cancellation',
  saving,
}: PortalCancelBookingModalProps): React.JSX.Element {
  const [reason, setReason] = React.useState('');
  React.useEffect(() => {
    if (isOpen) setReason('');
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={PORTAL_MODAL_WRAPPER}>
        <div className={PORTAL_MODAL_BODY}>
          <div className="flex flex-col items-center">
            <img src={CancelIcon} alt="" className={PORTAL_MODAL_ICON_LARGE} />
          </div>
          <DialogTitle className={PORTAL_MODAL_TITLE}>{title}</DialogTitle>
          <DialogDescription className={PORTAL_MODAL_DESCRIPTION}>{description}</DialogDescription>
          <div className="mt-6 space-y-2">
            <Typography variant="label" className={PORTAL_MODAL_LABEL}>
              Enter detailed reason <span className="text-[#EF4444]">*</span>
            </Typography>
            <Textarea
              placeholder="Enter reason for cancellation…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={PORTAL_MODAL_TEXTAREA}
            />
          </div>
        </div>
        <div className={PORTAL_MODAL_FOOTER}>
          <div className={PORTAL_MODAL_FOOTER_ROW}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className={PORTAL_MODAL_CANCEL_BTN}
            >
              Go Back
            </Button>
            <Button
              type="button"
              onClick={() => onConfirm(reason)}
              disabled={saving || !reason.trim()}
              className={PORTAL_MODAL_DESTRUCTIVE_BTN}
            >
              {saving ? 'Cancelling…' : confirmLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
