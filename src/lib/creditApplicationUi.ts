/**
 * Credit application form — Figma-aligned layout & color tokens.
 */
import { cn } from '@/lib/utils';
import {
  portalCardClass,
  portalDiscardButtonClass,
  portalFieldInputClass,
  portalFieldLabelClass,
  portalInputReadOnlyClass,
  portalOutlineButtonClass,
  portalRequiredMarkClass,
  portalSectionDescClass,
} from '@/lib/portalTheme';

/** Page workspace — white main area (Figma); content aligns to the start, not centered */
export const CREDIT_FORM_CANVAS_CLASS =
  'flex min-h-0 min-w-0 w-full flex-1 flex-col gap-4 bg-white';

/** Left-aligned narrow column (header + form card) — Figma ~904px */
export const CREDIT_FORM_NARROW_COLUMN_CLASS = 'flex w-full max-w-[904px] flex-col gap-4';

/** @deprecated Use CREDIT_FORM_NARROW_COLUMN_CLASS */
export const CREDIT_FORM_PAGE_CLASS = CREDIT_FORM_NARROW_COLUMN_CLASS;

/** Full-width row for the progress stepper (wider than the form card below) */
export const CREDIT_FORM_STEPPER_ROW_CLASS = 'w-full min-w-0';

/** Top-left navigation above content (Figma) */
export const CREDIT_FORM_TOP_BACK_CLASS =
  'inline-flex items-center gap-2 text-sm font-medium text-[#18181B] transition-colors hover:text-[#3F3F46]';

/** Title block on page background (not inside a card) */
export const CREDIT_FORM_INTRO_CLASS = 'flex items-start gap-3';

export const CREDIT_FORM_TITLE_CLASS = 'text-[28px] font-semibold leading-8 text-[#18181B]';

export const CREDIT_FORM_SUBTITLE_CLASS = cn(portalSectionDescClass, 'mt-1 max-w-[640px]');

/** Full-width stepper card (spans main content area in Figma) */
export const CREDIT_FORM_STEPPER_CARD_CLASS = cn(
  portalCardClass,
  'w-full min-w-0 rounded-lg border-[#E5E7EB] bg-white px-3 py-4 shadow-none sm:px-5 sm:py-5 md:px-6 md:py-6'
);

/** Main form card — step body + footer */
export const CREDIT_FORM_MAIN_CARD_CLASS = cn(
  portalCardClass,
  'overflow-hidden border-[#E5E7EB] bg-white shadow-none'
);

/** @deprecated Use CREDIT_FORM_MAIN_CARD_CLASS */
export const CREDIT_FORM_CARD_CLASS = CREDIT_FORM_MAIN_CARD_CLASS;

export const CREDIT_FORM_STEP_TITLE_CLASS = 'text-xl font-semibold leading-7 text-[#18181B]';

export const CREDIT_FORM_STEP_DESC_CLASS = portalSectionDescClass;

export const CREDIT_FORM_SECTION_PAD = 'px-6';

export const CREDIT_FORM_STEP_BODY_CLASS = 'flex flex-col';

export const CREDIT_FORM_STEP_HEADER_CLASS = cn(
  'flex flex-wrap items-start justify-between gap-3 border-b border-[#E5E7EB] py-4',
  CREDIT_FORM_SECTION_PAD
);

export const CREDIT_FORM_FIELD_INPUT_CLASS = cn(
  portalFieldInputClass(),
  'h-11 rounded-md border-[#E5E7EB] bg-white text-sm text-[#18181B] placeholder:text-[#A1A1AA]'
);

export const CREDIT_FORM_READONLY_INPUT_CLASS = cn(
  portalFieldInputClass(),
  portalInputReadOnlyClass,
  'h-11 cursor-not-allowed rounded-md border-[#E5E7EB] bg-[#FAFAFA] text-sm text-[#52525B]'
);

export const CREDIT_FORM_FIELD_LABEL_CLASS = cn(portalFieldLabelClass, 'text-[#18181B]');

export const CREDIT_FORM_REQUIRED_MARK_CLASS = portalRequiredMarkClass;

export const CREDIT_FORM_FOOTER_CLASS = cn(
  'flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] bg-white px-6 py-4'
);

export const CREDIT_FORM_CANCEL_BTN_CLASS = portalDiscardButtonClass;

export const CREDIT_FORM_DRAFT_BTN_CLASS = cn(
  portalOutlineButtonClass,
  'border-[#E5E7EB] bg-white text-[#71717A] hover:bg-[#FAFAFA] hover:text-[#52525B]'
);

export const CREDIT_FORM_BACK_BTN_CLASS = cn(
  portalOutlineButtonClass,
  'min-w-[100px] border-[#E5E7EB] bg-white text-[#18181B] hover:bg-[#FAFAFA]'
);

/** Figma primary — muted rose */
export const CREDIT_FORM_PRIMARY_BTN_CLASS =
  'inline-flex h-10 min-w-[140px] items-center justify-center gap-1.5 rounded-md bg-[#D98880] px-4 text-sm font-medium text-white hover:bg-[#C97870]';

export const CREDIT_FORM_OUTLINE_BTN_CLASS = cn(
  portalOutlineButtonClass,
  'shrink-0 border-[#E5E7EB] bg-white text-sm font-medium text-[#18181B] hover:bg-[#FAFAFA]'
);

/** Nested reference cards inside a step */
export const CREDIT_FORM_NESTED_CARD_CLASS =
  'rounded-[10px] border border-[#E4E4E7] bg-white p-4 md:p-5';

/** Figma stepper — active dot, line, completed step */
export const CREDIT_STEP_ACTIVE_COLOR = '#991B1B';

/** Figma stepper — pale halo around active dot */
export const CREDIT_STEP_ACTIVE_HALO_COLOR = '#FDE8E8';

/** Figma stepper — inactive circles & dashed connectors */
export const CREDIT_STEP_INACTIVE_COLOR = '#D1D5DB';

export const CREDIT_STEP_LABEL_ACTIVE_CLASS = 'font-semibold text-[#18181B]';

export const CREDIT_STEP_LABEL_INACTIVE_CLASS = 'font-medium text-[#6B7280]';
