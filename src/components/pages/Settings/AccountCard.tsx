import type { Account } from '@/types/account';
import Typography from '@/components/atoms/Typography';
import { cn } from '@/lib/utils';

export interface AccountCardProps {
  account: Account;
  /** When true, card is larger (for the leftmost/featured slot). */
  size?: 'default' | 'large';
  className?: string;
}

const patternStyles: Record<NonNullable<Account['pattern']>, string> = {
  diagonal:
    'repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(255,255,255,0.03) 4px, rgba(255,255,255,0.03) 8px)',
  lines:
    'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 4px)',
  circles:
    'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)',
};

/**
 * Credit/debit card style card for Available Cards carousel.
 * Dark background, pattern, contactless icon, Default badge, brand logo, number, name, expiry.
 */
export default function AccountCard({
  account,
  size = 'default',
  className,
}: AccountCardProps): React.JSX.Element {
  const pattern = account.pattern ?? 'diagonal';
  const bgPattern = patternStyles[pattern];
  const isLarge = size === 'large';
  const normalizedType = account.card_type.toLowerCase();
  const cardTypeLabel = normalizedType.replace(/[_-]+/g, ' ').toUpperCase();

  return (
    <div
      className={cn(
        'relative h-full w-full overflow-hidden rounded-2xl border border-gray-700/50 bg-gray-800 text-white shadow-lg',
        'flex flex-col justify-between transition-all duration-300 ease-out',
        isLarge ? 'min-h-[250px] p-6' : 'min-h-[220px] p-5',
        className
      )}
      style={{
        backgroundImage: bgPattern,
      }}
    >
      {/* Top row: default chip left, dynamic card type right */}
      <div className="flex items-start justify-between">
        {account.isDefault ? (
          <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white">
            Default Card
          </span>
        ) : (
          <span />
        )}
        {normalizedType.includes('master') ? (
          <div className="flex -space-x-2" aria-label={cardTypeLabel}>
            <span className="inline-block h-6 w-6 rounded-full bg-[#eb001b]" aria-hidden />
            <span className="inline-block h-6 w-6 rounded-full bg-[#f79e1b]" aria-hidden />
          </div>
        ) : (
          <span className="text-sm font-semibold tracking-wider text-white">{cardTypeLabel}</span>
        )}
      </div>

      {/* Card number */}
      <Typography
        component="p"
        variant="body"
        className={cn(
          'font-mono tracking-widest text-white transition-[font-size] duration-300 ease-out',
          isLarge ? 'text-xl' : 'text-lg'
        )}
      >
        {account.cardNumber}
      </Typography>

      {/* Bottom row: name left, expiry right */}
      <div className="flex items-end justify-between">
        <Typography
          component="p"
          variant="body"
          className={cn(
            'font-medium text-white/95 transition-[font-size] duration-300 ease-out',
            isLarge ? 'text-base' : 'text-sm'
          )}
        >
          {account.cardholderName}
        </Typography>
        <Typography
          component="p"
          variant="body"
          className={cn(
            'text-white/90 transition-[font-size] duration-300 ease-out',
            isLarge ? 'text-base' : 'text-sm'
          )}
        >
          Exp {account.expiry}
        </Typography>
      </div>
    </div>
  );
}
