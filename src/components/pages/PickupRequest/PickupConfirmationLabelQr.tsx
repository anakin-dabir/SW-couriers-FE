import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';

interface PickupConfirmationLabelQrProps {
  value: string;
  /** Pixel size of the QR module grid (Figma ~107). */
  size?: number;
  className?: string;
}

export default function PickupConfirmationLabelQr({
  value,
  size = 107,
  className,
}: PickupConfirmationLabelQrProps): React.JSX.Element {
  return (
    <div className={cn('shrink-0', className)}>
      <QRCodeSVG value={value} size={size} level="M" includeMargin={false} />
    </div>
  );
}
