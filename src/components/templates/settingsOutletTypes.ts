import type { Dispatch, SetStateAction } from 'react';

/** Save/Discard bar actions for settings tabs that register with the layout (e.g. General Settings). */
export interface SettingsSubheaderActions {
  onSave: () => void | Promise<void>;
  onDiscard: () => void;
  saveDisabled?: boolean;
  discardDisabled?: boolean;
  isSaving?: boolean;
}

export interface SettingsOutletContext {
  setSubheaderActions: Dispatch<SetStateAction<SettingsSubheaderActions | null>>;
}
