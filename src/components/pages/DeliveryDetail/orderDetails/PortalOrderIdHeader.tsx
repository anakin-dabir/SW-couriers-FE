import type React from 'react';
import { useCallback, useState } from 'react';
import { Copy } from 'lucide-react';
import Typography from '@/components/atoms/Typography';
import { Badge } from '@/components/atoms/badge';
import { cn } from '@/lib/utils';
import { mapOrderStatusToUi } from '@/lib/orderStatusUi';
import { orderStatusBadgeClassName } from '@/lib/orderDetailDisplay';

export interface PortalOrderIdHeaderProps {
  orderId: string;
  status: string;
  className?: string;
}

export default function PortalOrderIdHeader({
  orderId,
  status,
  className,
}: PortalOrderIdHeaderProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [orderId]);

  const statusLabel = mapOrderStatusToUi(status);

  return (
    <div className={cn('w-full p-4', className)}>
      <div className="space-y-2">
        <Typography
          variant="label"
          className="ml-1 text-[12px] font-medium uppercase tracking-widest text-[#858594]"
        >
          Order ID
        </Typography>
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          <div className="flex items-center gap-3">
            <Typography
              variant="h3"
              weight="semibold"
              className="whitespace-nowrap text-[20px] leading-none tracking-tight text-[#030303] md:text-[24px]"
            >
              # {orderId}
            </Typography>
            <button
              type="button"
              className="p-1 text-[#CBCBD8] transition-colors hover:text-[#858594]"
              aria-label="Copy Order ID"
              onClick={() => void handleCopy()}
            >
              <Copy className="h-5 w-5" />
            </button>
            {copied ? (
              <Typography variant="caption" className="text-xs font-medium text-emerald-600">
                Copied
              </Typography>
            ) : null}
          </div>
          <Badge className={cn(orderStatusBadgeClassName(status))}>{statusLabel}</Badge>
        </div>
      </div>
    </div>
  );
}
