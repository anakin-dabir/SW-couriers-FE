import Barcode from 'react-barcode';
import { cn } from '@/lib/utils';

interface PickupConfirmationLabelBarcodeProps {
  value: string;
  /** Renders a vertical strip suitable for the label margin (Figma). */
  vertical?: boolean;
  className?: string;
}

export default function PickupConfirmationLabelBarcode({
  value,
  vertical = false,
  className,
}: PickupConfirmationLabelBarcodeProps): React.JSX.Element {
  if (vertical) {
    return (
      <div
        className={cn(
          'flex h-[188px] w-[73px] shrink-0 items-center justify-center overflow-hidden',
          className
        )}
      >
        <div className="flex h-[73px] w-[188px] items-center justify-center">
          <div className="-rotate-90">
            <Barcode
              value={value}
              format="CODE128"
              displayValue={false}
              renderer="svg"
              width={1.25}
              height={56}
              margin={0}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex w-full max-w-full justify-center overflow-x-auto', className)}>
      <Barcode
        value={value}
        format="CODE128"
        displayValue={false}
        renderer="svg"
        width={1.1}
        height={44}
        margin={0}
      />
    </div>
  );
}
