/**
 * Profile Settings layout & form tokens.
 * Re-exports shared portal theme with settings-specific names for stable imports.
 */
export {
  portalCanvasClass as SETTINGS_CANVAS_CLASS,
  portalCardClass as SETTINGS_CARD_CLASS,
  portalColors,
  portalDestructiveOutlineButtonClass,
  portalDiscardButtonClass,
  portalFieldInputClass,
  portalFieldLabelClass as SETTINGS_FORM_FIELD_LABEL_CLASS,
  portalFormCardClass as SETTINGS_FORM_CARD_CLASS,
  portalFormDividerClass as SETTINGS_FORM_DIVIDER_CLASS,
  portalFormHeaderDividerClass,
  portalFormSectionLabelClass as SETTINGS_FORM_SECTION_LABEL_CLASS,
  portalGhostButtonClass,
  portalInnerContainerClass as SETTINGS_INNER_CLASS,
  portalInputClass as SETTINGS_FORM_INPUT_CLASS,
  portalInputReadOnlyClass,
  portalLogoUploadClass as SETTINGS_LOGO_UPLOAD_CLASS,
  portalNestedCardClass,
  portalOutlineButtonClass,
  portalPageSubtitleClass,
  portalPageSubtitleClass as SETTINGS_PAGE_SUBTITLE,
  portalPageTitleClass,
  portalPhoneInputClass,
  portalPhoneNumberInputClass,
  portalPhoneWrapperClass,
  portalPrimaryButtonClass as SETTINGS_SAVE_BTN_CLASS,
  portalReadOnlySelectClass,
  portalRequiredMarkClass,
  portalSectionDescClass as SETTINGS_SECTION_DESC_CLASS,
  portalSectionTitleClass as SETTINGS_SECTION_TITLE_CLASS,
  portalSelectTriggerClass as SETTINGS_FORM_SELECT_TRIGGER_CLASS,
  portalSettingsMainColumnClass as SETTINGS_MAIN_COLUMN_CLASS,
  portalSettingsSidebarClass as SETTINGS_SIDEBAR_CLASS,
  portalTabsListClass as SETTINGS_TABS_LIST_CLASS,
  portalTabsTriggerClass as SETTINGS_TABS_TRIGGER_CLASS,
  portalDiscardButtonClass as SETTINGS_DISCARD_BTN_CLASS,
  portalProgressRingClass,
  portalProgressTrackClass,
} from '@/lib/portalTheme';

export const SETTINGS_PAGE_TITLE = 'Profile Settings';

/** Dev-aligned grey workspace behind white form cards */
export const SETTINGS_CONTENT_PANEL_CLASS =
  'flex min-w-0 flex-1 flex-col gap-6 rounded-xl border border-gray-200 bg-gray-50 p-5';
