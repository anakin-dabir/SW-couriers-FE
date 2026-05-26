import type { Account } from '@/types/account';
import Typography from '@/components/atoms/Typography';
import { detectCardBrand } from '@/lib/paymentCards';
import { cn } from '@/lib/utils';

export interface AccountCardProps {
  account: Account;
  /** When true, card is larger (for the leftmost/featured slot). */
  size?: 'default' | 'large';
  className?: string;
}

const patternStyles: Record<NonNullable<Account['pattern']>, string> = {
  diagonal:
    'repeating-linear-gradient(135deg, transparent, transparent 6px, rgba(255,255,255,0.04) 6px, rgba(255,255,255,0.04) 12px), linear-gradient(145deg, #1f2228 0%, #14161a 100%)',
  lines:
    'repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.05) 3px, rgba(255,255,255,0.05) 6px), linear-gradient(145deg, #1f2228 0%, #14161a 100%)',
  circles:
    'radial-gradient(circle at 18% 42%, rgba(255,255,255,0.06) 0%, transparent 42%), radial-gradient(circle at 82% 58%, rgba(255,255,255,0.05) 0%, transparent 40%), linear-gradient(145deg, #1f2228 0%, #14161a 100%)',
};

function CardBrandLogo({ cardType }: { cardType: string }): React.JSX.Element {
  const brand = detectCardBrand(cardType);

  if (brand === 'mastercard') {
    return (
      <div className="flex -space-x-2.5" aria-hidden>
        <span className="inline-block size-7 rounded-full bg-[#EB001B]" />
        <span className="inline-block size-7 rounded-full bg-[#F79E1B]" />
      </div>
    );
  }

  if (brand === 'visa') {
    return (
      <span className="text-lg font-bold italic tracking-wide text-white" aria-hidden>
        VISA
      </span>
    );
  }

  if (brand === 'amex') {
    return (
      <span className="text-sm font-bold tracking-wider text-white" aria-hidden>
        AMEX
      </span>
    );
  }

  return (
    <span className="text-xs font-semibold uppercase tracking-wider text-white/90" aria-hidden>
      CARD
    </span>
  );
}

/**
 * Saved payment card visual for Settings → Account Details carousel (Figma).
 */
export default function AccountCard({
  account,
  size = 'default',
  className,
}: AccountCardProps): React.JSX.Element {
  const pattern = account.pattern ?? 'diagonal';
  const isLarge = size === 'large';

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-2xl border border-[#2A2F38] text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)]',
        'flex flex-col justify-between transition-all duration-300 ease-out',
        isLarge ? 'min-h-[196px] p-5' : 'min-h-[180px] p-4',
        className
      )}
      style={{ background: patternStyles[pattern] }}
    >
      <div className="flex items-start justify-between gap-3">
        {account.isDefault ? (
          <span className="rounded-full border border-white/20 bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            DEFAULT CARD
          </span>
        ) : (
          <span />
        )}
        <CardBrandLogo cardType={account.card_type} />
      </div>

      <div className="mt-auto space-y-1 pt-8">
        <Typography
          component="p"
          variant="body"
          className={cn('font-medium tracking-wide text-white', isLarge ? 'text-base' : 'text-sm')}
        >
          {account.cardNumber}
        </Typography>
        <Typography
          component="p"
          variant="body"
          className={cn('text-white/85', isLarge ? 'text-sm' : 'text-xs')}
        >
          Expires {account.expiry}
        </Typography>
      </div>
    </div>
  );
}
