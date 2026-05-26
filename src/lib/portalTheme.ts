/**
 * B2B portal design tokens (Figma-aligned).
 * Import class constants from here or via `settingsUi` / `paymentSettingsUi` / `creditApplicationUi`.
 */
import { cn } from '@/lib/utils';

/** Raw palette — use for non-Tailwind contexts (charts, inline styles) only when necessary */
export const portalColors = {
  canvas: '#F4F4F5',
  surface: '#FFFFFF',
  surfaceMuted: '#FAFAFA',
  border: '#E5E7EB',
  borderSubtle: '#F4F4F5',
  borderDashed: '#D4D4D8',
  text: '#18181B',
  textSecondary: '#3F3F46',
  textMuted: '#71717A',
  textLabel: '#52525B',
  placeholder: '#A1A1AA',
  brand: '#C63131',
  brandHover: '#A82828',
  brandMutedBorder: '#F4C4C4',
  brandMutedBg: '#FFF5F5',
  error: '#DC2626',
  errorBorder: '#FECACA',
  errorBg: '#FEF2F2',
  success: '#16A34A',
  warning: '#F59E0B',
  progressRing: '#C63131',
  progressTrack: '#E5E7EB',
} as const;

/* ── Surfaces & layout ───────────────────────────────────────────── */

export const portalCardClass =
  'rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]';

export const portalFormCardClass = cn(portalCardClass, 'p-5 sm:p-6');

export const portalNestedCardClass = 'overflow-hidden rounded-xl border border-[#E5E7EB] bg-white';

/** Full-bleed workspace canvas — parent main must use flush padding (see DashboardLayout). */
export const portalCanvasClass =
  'flex min-h-full w-full flex-1 flex-col bg-[#F4F4F5] px-6 py-6 md:px-8';

export const portalInnerContainerClass = 'flex w-full min-w-0 flex-col gap-6';

export const portalFormHeaderDividerClass = 'border-b border-[#F4F4F5] pb-5';

export const portalFormDividerClass = 'border-t border-[#F4F4F5]';

export const portalInsetPanelClass = 'rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-5';

/* ── Typography ──────────────────────────────────────────────────── */

export const portalPageTitleClass = 'text-2xl font-semibold text-[#18181B]';

export const portalPageSubtitleClass = 'text-sm text-[#71717A]';

export const portalSectionTitleClass = 'text-base font-semibold text-[#18181B]';

export const portalSectionDescClass = 'text-sm text-[#71717A]';

export const portalFormSectionLabelClass =
  'text-[11px] font-semibold uppercase tracking-[0.08em] text-[#71717A]';

export const portalFieldLabelClass = 'text-xs font-medium text-[#52525B]';

export const portalRequiredMarkClass = 'text-[#EF4444]';

/* ── Form controls ───────────────────────────────────────────────── */

export const portalInputClass = 'h-11 border-[#E5E7EB] bg-white text-[#18181B]';

export const portalInputReadOnlyClass = 'bg-[#FAFAFA] text-[#71717A]';

export const portalSelectTriggerClass = portalInputClass;

export const portalReadOnlySelectClass = cn(
  portalInputClass,
  'flex cursor-default items-center justify-between gap-2 bg-[#FAFAFA] px-3 text-[#52525B]'
);

export const portalLogoUploadClass =
  'rounded-xl border border-dashed border-[#D4D4D8] bg-[#FAFAFA] px-4 py-4';

export const portalPhoneWrapperClass =
  'flex h-11 w-full items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3 py-2 focus-within:border-[#C63131] focus-within:ring-2 focus-within:ring-[#C63131]/15';

export const portalPhoneInputClass = 'flex min-w-0 flex-1 items-center border-0 bg-transparent p-0';

export const portalPhoneNumberInputClass =
  'flex-1 min-w-0 border-0 bg-transparent p-0 text-sm text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-0';

export function portalFieldInputClass(readOnly?: boolean): string {
  return cn(portalInputClass, readOnly && portalInputReadOnlyClass);
}

/* ── Buttons ─────────────────────────────────────────────────────── */

export const portalPrimaryButtonClass =
  'h-10 gap-1.5 bg-[#C63131] px-4 text-white hover:bg-[#A82828]';

export const portalDiscardButtonClass =
  'h-10 border-[#F4C4C4] bg-white px-4 text-[#C63131] hover:bg-[#FFF5F5]';

export const portalOutlineButtonClass =
  'h-10 border-[#E5E7EB] bg-white text-[#18181B] hover:bg-[#FAFAFA]';

export const portalDestructiveOutlineButtonClass =
  'h-10 border-[#FECACA] bg-white text-[#DC2626] hover:bg-[#FEF2F2]';

export const portalGhostButtonClass =
  'h-10 text-[#71717A] hover:bg-transparent hover:text-[#52525B]';

/* ── Tabs (settings) ─────────────────────────────────────────────── */

export const portalTabsListClass =
  'grid h-auto w-full grid-cols-2 gap-1 rounded-xl bg-[#E8E8ED] p-1 sm:grid-cols-4';

export const portalTabsTriggerClass =
  'h-10 rounded-lg px-3 text-sm font-medium text-[#71717A] data-[state=active]:bg-white data-[state=active]:text-[#18181B] data-[state=active]:shadow-[0_1px_3px_rgba(0,0,0,0.08)]';

/* ── Settings layout ───────────────────────────────────────────────── */

export const portalSettingsMainColumnClass = 'min-w-0 flex-[1_1_68%]';

export const portalSettingsSidebarClass = cn(
  portalCardClass,
  'flex w-full shrink-0 flex-col gap-6 p-6 lg:flex-[0_0_32%] lg:max-w-[400px]',
  'shadow-[0_1px_2px_0_rgba(0,0,0,0.05),0_4px_12px_0_rgba(0,0,0,0.04)]'
);

export const portalProgressRingClass = 'text-[#C63131]';

export const portalProgressTrackClass = 'text-[#E5E7EB]';
