/**
 * Credit application form layout tokens (multi-step flow).
 */
import { cn } from '@/lib/utils';
import {
  portalCanvasClass,
  portalCardClass,
  portalFieldInputClass,
  portalFormDividerClass,
  portalFormHeaderDividerClass,
  portalFormSectionLabelClass,
  portalPageSubtitleClass,
  portalPrimaryButtonClass,
  portalSectionDescClass,
  portalSectionTitleClass,
} from '@/lib/portalTheme';

export const CREDIT_FORM_CANVAS_CLASS = portalCanvasClass;

export const CREDIT_FORM_PAGE_CLASS = 'mx-auto w-full max-w-[904px]';

export const CREDIT_FORM_CARD_CLASS = cn(
  portalCardClass,
  'shadow-[0_1px_2px_0_rgba(0,0,0,0.05),0_4px_16px_0_rgba(0,0,0,0.06)]'
);

export const CREDIT_FORM_STEP_TITLE_CLASS = 'text-xl font-semibold leading-7 text-[#18181B]';

export const CREDIT_FORM_STEP_DESC_CLASS = portalSectionDescClass;

export const CREDIT_FORM_SECTION_PAD = 'px-6';

export const CREDIT_FORM_STEP_PANEL_CLASS =
  'mx-6 mb-2 mt-6 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white';

export const CREDIT_FORM_FIELD_INPUT_CLASS = portalFieldInputClass();

export const CREDIT_FORM_SECTION_LABEL_CLASS = portalFormSectionLabelClass;

export const CREDIT_FORM_HEADER_DIVIDER_CLASS = portalFormHeaderDividerClass;

export const CREDIT_FORM_FOOTER_DIVIDER_CLASS = portalFormDividerClass;

export const CREDIT_FORM_PRIMARY_BUTTON_CLASS = portalPrimaryButtonClass;

export const CREDIT_FORM_PAGE_SUBTITLE_CLASS = portalPageSubtitleClass;

export const CREDIT_FORM_SECTION_TITLE_CLASS = portalSectionTitleClass;
