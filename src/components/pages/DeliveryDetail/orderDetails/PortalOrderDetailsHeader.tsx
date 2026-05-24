import type React from 'react';
import Typography from '@/components/atoms/Typography';
import { cn } from '@/lib/utils';
import { formatOrderDateTime } from '@/lib/orderDetailDisplay';

export interface PortalOrderDetailsHeaderProps {
  createdOn?: string | null;
  createdBy?: string | null;
  className?: string;
}

export default function PortalOrderDetailsHeader({
  createdOn,
  createdBy,
  className,
}: PortalOrderDetailsHeaderProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex w-full items-start gap-[10px] rounded-[12px] border border-[#CBCBD8] bg-white p-6',
        className
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-24">
        <div className="min-w-0">
          <Typography
            variant="body"
            className="mb-0.5 text-[14px] font-medium leading-tight text-[#858594]"
          >
            Created on
          </Typography>
          <Typography
            variant="body"
            weight="medium"
            className="text-[16px] leading-none text-[#030303]"
          >
            {formatOrderDateTime(createdOn)}
          </Typography>
        </div>
        <div className="min-w-0">
          <Typography
            variant="body"
            className="mb-0.5 text-[14px] font-medium leading-tight text-[#858594]"
          >
            Created By
          </Typography>
          <Typography
            variant="body"
            weight="medium"
            className="truncate text-[16px] leading-none text-[#030303]"
          >
            {createdBy?.trim() || '—'}
          </Typography>
        </div>
      </div>
    </div>
  );
}
