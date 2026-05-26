import { Input } from '@/components/atoms/input';
import Typography from '@/components/atoms/Typography';
import type {
  GeneralSettingsState,
  UpdateGeneralSettings,
} from '@/components/pages/Settings/CompanyDetails/types';
import { SETTINGS_FORM_SECTION_LABEL_CLASS } from '@/lib/settingsUi';
import {
  portalFieldInputClass,
  portalFieldLabelClass,
  portalRequiredMarkClass,
} from '@/lib/portalTheme';

interface RegistrationDetailsSectionProps {
  generalSettings: GeneralSettingsState;
  updateGeneral: UpdateGeneralSettings;
  fieldErrors?: Record<string, string>;
  readOnly?: boolean;
}

const RequiredMark = (): React.JSX.Element => <span className={portalRequiredMarkClass}> *</span>;

export default function RegistrationDetailsSection({
  generalSettings,
  updateGeneral,
  fieldErrors,
  readOnly = false,
}: RegistrationDetailsSectionProps): React.JSX.Element {
  const inputClass = portalFieldInputClass(readOnly);

  return (
    <section className="space-y-4">
      <Typography className={SETTINGS_FORM_SECTION_LABEL_CLASS}>Registration Details</Typography>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Typography className={portalFieldLabelClass}>
            Companies House Number
            <RequiredMark />
          </Typography>
          <Input
            value={generalSettings.companiesHouseNumber}
            onChange={(e) => updateGeneral('companiesHouseNumber', e.target.value)}
            errorMessage={fieldErrors?.companiesHouseNumber}
            readOnly={readOnly}
            disabled={readOnly}
            className={inputClass}
          />
        </div>
        <div className="space-y-2">
          <Typography className={portalFieldLabelClass}>EORI Number</Typography>
          <Input
            value={generalSettings.eoriNumber}
            onChange={(e) => updateGeneral('eoriNumber', e.target.value)}
            errorMessage={fieldErrors?.eoriNumber}
            readOnly={readOnly}
            disabled={readOnly}
            className={inputClass}
          />
        </div>
      </div>
    </section>
  );
}
