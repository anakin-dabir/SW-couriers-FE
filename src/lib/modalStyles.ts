const COMMON =
  'flex flex-col !h-auto !max-h-[90vh] !w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-[18px] border border-[#CBCBD8] bg-[#FBFBFC] p-0 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.10),0px_2px_4px_-1px_rgba(0,0,0,0.06)]';

export const PORTAL_MODAL_WRAPPER = `${COMMON} sm:!max-w-[470px]`;
export const PORTAL_MODAL_FORM_WRAPPER = `${COMMON} sm:!max-w-[560px]`;
export const PORTAL_MODAL_WIDE_WRAPPER = `${COMMON} sm:!max-w-[680px]`;

export const PORTAL_MODAL_BODY = 'px-5 pb-5 pt-[30px]';
export const PORTAL_MODAL_FOOTER = 'border-t border-[#E5E5EC] p-4';
export const PORTAL_MODAL_FOOTER_ROW = 'flex flex-col gap-3 sm:flex-row';

export const PORTAL_MODAL_ICON_LARGE = 'h-[100px] w-auto max-w-[120px] object-contain';
export const PORTAL_MODAL_ICON_SMALL = 'h-[60px] w-auto max-w-[80px] object-contain';

export const PORTAL_MODAL_TITLE =
  'mt-6 text-center text-xl font-semibold leading-tight tracking-[-0.02em] text-[#18181B] sm:text-2xl';
export const PORTAL_MODAL_TITLE_SM =
  'mt-5 text-center text-lg font-medium text-[#272727] leading-7';
export const PORTAL_MODAL_DESCRIPTION = 'mt-4 text-center text-sm leading-relaxed text-[#464649]';

export const PORTAL_MODAL_CANCEL_BTN =
  'h-10 w-full rounded-md border-[#E4E4E7] bg-white text-sm font-medium text-[#18181B] hover:bg-[#F9FAFB] sm:flex-1';
export const PORTAL_MODAL_DESTRUCTIVE_BTN =
  'inline-flex h-10 w-full flex-1 items-center justify-center gap-2 rounded-md bg-[#AE2224] text-sm font-medium text-[#FAFAFA] hover:bg-[#991B1B] disabled:opacity-50';
export const PORTAL_MODAL_PRIMARY_BTN = PORTAL_MODAL_DESTRUCTIVE_BTN;

export const PORTAL_MODAL_LABEL = 'text-sm font-medium text-[#030303]';
export const PORTAL_MODAL_TEXTAREA = 'min-h-[100px] w-full resize-none';

/** Delete Draft Application modal (Credit Management drafts) — Figma 779:5703 */
export const DELETE_DRAFT_APP_MODAL_WRAPPER =
  'flex flex-col !h-auto !max-h-[90vh] !w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-[18px] border border-[#E5E5EC] bg-white p-0 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.10),0px_2px_4px_-1px_rgba(0,0,0,0.06)] sm:!max-w-[470px]';
export const DELETE_DRAFT_APP_MODAL_BODY = 'px-6 pb-6 pt-8';
export const DELETE_DRAFT_APP_MODAL_ICON = 'h-[100px] w-[109px] shrink-0 object-contain';
export const DELETE_DRAFT_APP_MODAL_TITLE =
  'mt-6 text-center text-2xl font-semibold leading-tight tracking-[-0.02em] text-[#18181B]';
export const DELETE_DRAFT_APP_MODAL_DESCRIPTION =
  'mt-4 text-center text-sm leading-[1.5] text-[#464649]';
export const DELETE_DRAFT_APP_MODAL_FOOTER = 'border-t border-[#E5E5EC] px-6 py-4';
export const DELETE_DRAFT_APP_MODAL_FOOTER_ROW = 'flex items-center justify-between gap-4';
export const DELETE_DRAFT_APP_MODAL_CANCEL_BTN =
  'h-10 min-w-[100px] rounded-md border border-[#E4E4E7] bg-white px-5 text-sm font-medium text-[#18181B] hover:bg-[#F9FAFB]';
export const DELETE_DRAFT_APP_MODAL_DELETE_BTN =
  'h-10 min-w-[120px] rounded-md bg-[#AE2224] px-5 text-sm font-medium text-white hover:bg-[#991B1B] disabled:opacity-50';

/** Credit account already exists — block duplicate credit application submit */
export const CREDIT_ACCOUNT_EXISTS_MODAL_WRAPPER = DELETE_DRAFT_APP_MODAL_WRAPPER;
export const CREDIT_ACCOUNT_EXISTS_MODAL_BODY = DELETE_DRAFT_APP_MODAL_BODY;
export const CREDIT_ACCOUNT_EXISTS_MODAL_TITLE = DELETE_DRAFT_APP_MODAL_TITLE;
export const CREDIT_ACCOUNT_EXISTS_MODAL_DESCRIPTION = DELETE_DRAFT_APP_MODAL_DESCRIPTION;
export const CREDIT_ACCOUNT_EXISTS_MODAL_FOOTER = DELETE_DRAFT_APP_MODAL_FOOTER;
export const CREDIT_ACCOUNT_EXISTS_MODAL_FOOTER_ROW = DELETE_DRAFT_APP_MODAL_FOOTER_ROW;
export const CREDIT_ACCOUNT_EXISTS_MODAL_CLOSE_BTN = DELETE_DRAFT_APP_MODAL_CANCEL_BTN;
export const CREDIT_ACCOUNT_EXISTS_MODAL_PRIMARY_BTN = DELETE_DRAFT_APP_MODAL_DELETE_BTN;
