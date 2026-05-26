/**
 * Account Details / payment settings UI tokens.
 */
import { cn } from '@/lib/utils';
import {
  portalDestructiveOutlineButtonClass,
  portalFormCardClass,
  portalFormHeaderDividerClass,
  portalInsetPanelClass,
  portalOutlineButtonClass,
  portalSectionDescClass,
  portalSectionTitleClass,
} from '@/lib/portalTheme';

/** @deprecated Use SETTINGS_FORM_CARD_CLASS from `@/lib/settingsUi` */
export const ACCOUNTS_DETAILS_SECTION_CLASS = portalFormCardClass;

export const PAYMENT_SECTION_HEADER_CLASS = portalFormHeaderDividerClass;

export const PAYMENT_SECTION_TITLE_CLASS = portalSectionTitleClass;

export const PAYMENT_SECTION_DESC_CLASS = portalSectionDescClass;

export const PAYMENT_SAVED_CARDS_PANEL_CLASS = portalInsetPanelClass;

export const PAYMENT_CAROUSEL_NAV_BUTTON_CLASS = cn(
  portalOutlineButtonClass,
  'relative! left-0! top-0! size-10! translate-y-0! rounded-lg px-0'
);

export const PAYMENT_CARD_ACTION_BUTTON_CLASS = cn(
  portalOutlineButtonClass,
  'justify-center text-sm'
);

export const PAYMENT_CARD_DELETE_BUTTON_CLASS = cn(
  portalDestructiveOutlineButtonClass,
  'justify-center text-sm'
);

export const PAYMENT_BILLING_VALUE_CLASS = 'mt-1 text-2xl font-semibold leading-8 text-[#18181B]';

export const PAYMENT_BILLING_ICON_CLASS = 'size-14 shrink-0 text-[#E5E7EB]';

/** Muted inset panel (bank details, utilization summary) */
export const PAYMENT_MUTED_PANEL_CLASS =
  'rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-4 sm:p-5';

/** Read-only display value (not an editable input) */
export const PAYMENT_READ_ONLY_VALUE_CLASS =
  'rounded-md border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#18181B]';

export const PAYMENT_STAT_VALUE_CLASS = 'text-lg font-semibold text-[#18181B]';

export const PAYMENT_STAT_LABEL_CLASS = 'text-xs text-[#71717A]';
