import type React from 'react';
import { cn } from '@/lib/utils';
import {
  normalizeServiceTierKey,
  serviceTierDisplayLabel,
  type OrderServiceTierKey,
} from '@/lib/orderDetailDisplay';

const TIER_BADGE_CLASS: Record<OrderServiceTierKey, string> = {
  FASTEST: 'border-[#E9D5FF] bg-[#F5F3FF] text-[#7C3AED]',
  STANDARD: 'border-[#E5E7EB] bg-[#111827] text-white',
  ECONOMY: 'border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]',
  PREMIUM: 'border-[#FBCFE8] bg-[#FDF2F8] text-[#DB2777]',
  EXPRESS: 'border-[#E9D5FF] bg-[#F5F3FF] text-[#7C3AED]',
  OTHER: 'border-[#E5E7EB] bg-[#F3F4F6] text-[#111827]',
};

export default function OrderDetailServiceTierBadge({
  tier,
  color,
  className,
}: {
  tier?: string | null;
  color?: string | null;
  className?: string;
}): React.JSX.Element {
  const key = normalizeServiceTierKey(tier);
  if (color) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[5px] text-[10px] font-semibold uppercase leading-none',
          className
        )}
        style={{
          backgroundColor: `${color}20`,
          borderColor: `${color}40`,
          color,
        }}
      >
        {serviceTierDisplayLabel(tier)}
      </span>
    );
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[5px] text-[10px] font-semibold uppercase leading-none',
        TIER_BADGE_CLASS[key],
        className
      )}
    >
      {serviceTierDisplayLabel(tier)}
    </span>
  );
}
