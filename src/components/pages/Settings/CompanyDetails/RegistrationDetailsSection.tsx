import { Input } from '@/components/atoms/input';
import Typography from '@/components/atoms/Typography';
import type {
  GeneralSettingsState,
  UpdateGeneralSettings,
} from '@/components/pages/Settings/CompanyDetails/types';

interface RegistrationDetailsSectionProps {
  generalSettings: GeneralSettingsState;
  updateGeneral: UpdateGeneralSettings;
  fieldErrors?: Record<string, string>;
}

export default function RegistrationDetailsSection({
  generalSettings,
  updateGeneral,
  fieldErrors,
}: RegistrationDetailsSectionProps): React.JSX.Element {
  return (
    <section className="space-y-4">
      <Typography
        variant="caption"
        weight="semibold"
        className="tracking-wide text-gray-600 uppercase"
      >
        Registration Details
      </Typography>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Typography variant="label" className="text-xs">
            Companies House Number <span className="text-red-600">*</span>
          </Typography>
          <Input
            value={generalSettings.companiesHouseNumber}
            onChange={(e) => updateGeneral('companiesHouseNumber', e.target.value)}
            errorMessage={fieldErrors?.companiesHouseNumber}
          />
        </div>
        <div className="space-y-2">
          <Typography variant="label" className="text-xs">
            EORI Number
          </Typography>
          <Input
            value={generalSettings.eoriNumber}
            onChange={(e) => updateGeneral('eoriNumber', e.target.value)}
            errorMessage={fieldErrors?.eoriNumber}
          />
        </div>
        <div className="space-y-2">
          <Typography variant="label" className="text-xs">
            VAT Number
          </Typography>
          <Input
            value={generalSettings.vatNumber}
            onChange={(e) => updateGeneral('vatNumber', e.target.value)}
            errorMessage={fieldErrors?.vatNumber}
          />
        </div>
      </div>
    </section>
  );
}
