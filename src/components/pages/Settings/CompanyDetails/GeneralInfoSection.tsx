import { Input } from '@/components/atoms/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import Typography from '@/components/atoms/Typography';
import {
  COMPANY_SIZE_OPTIONS,
  INDUSTRY_OPTIONS,
} from '@/components/pages/Settings/CompanyDetails/constants';
import type {
  GeneralSettingsState,
  UpdateGeneralSettings,
} from '@/components/pages/Settings/CompanyDetails/types';
import { cn } from '@/lib/utils';

interface GeneralInfoSectionProps {
  generalSettings: GeneralSettingsState;
  updateGeneral: UpdateGeneralSettings;
  /** Top-level form paths: `tradingName`, `industry`, … */
  fieldErrors?: Record<string, string>;
}

export default function GeneralInfoSection({
  generalSettings,
  updateGeneral,
  fieldErrors,
}: GeneralInfoSectionProps): React.JSX.Element {
  return (
    <section className="space-y-4">
      <Typography
        variant="caption"
        weight="semibold"
        className="text-[11px] tracking-wide text-gray-700 uppercase"
      >
        General Information
      </Typography>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Typography variant="label" className="text-xs">
            Trading Name <span className="text-red-600">*</span>
          </Typography>
          <Input
            value={generalSettings.tradingName}
            onChange={(e) => updateGeneral('tradingName', e.target.value)}
            errorMessage={fieldErrors?.tradingName}
          />
        </div>
        <div className="space-y-2">
          <Typography variant="label" className="text-xs">
            Legal Entity Name <span className="text-red-600">*</span>
          </Typography>
          <Input
            value={generalSettings.legalEntityName}
            onChange={(e) => updateGeneral('legalEntityName', e.target.value)}
            errorMessage={fieldErrors?.legalEntityName}
          />
        </div>
        <div className="space-y-2">
          <Typography variant="label" className="text-xs">
            Industry <span className="text-red-600">*</span>
          </Typography>
          <Select
            value={generalSettings.industry || undefined}
            onValueChange={(v) => updateGeneral('industry', v)}
          >
            <SelectTrigger
              className={cn(
                'h-10',
                fieldErrors?.industry && 'border-red-500 focus-visible:ring-red-500/20'
              )}
            >
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors?.industry ? (
            <Typography variant="caption" className="text-red-600">
              {fieldErrors.industry}
            </Typography>
          ) : null}
        </div>
        <div className="space-y-2">
          <Typography variant="label" className="text-xs">
            Company Size <span className="text-red-600">*</span>
          </Typography>
          <Select
            value={generalSettings.companySize || undefined}
            onValueChange={(v) => updateGeneral('companySize', v)}
          >
            <SelectTrigger
              className={cn(
                'h-10',
                fieldErrors?.companySize && 'border-red-500 focus-visible:ring-red-500/20'
              )}
            >
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              {COMPANY_SIZE_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors?.companySize ? (
            <Typography variant="caption" className="text-red-600">
              {fieldErrors.companySize}
            </Typography>
          ) : null}
        </div>
        <div className="space-y-2">
          <Typography variant="label" className="text-xs">
            Date of Incorporation <span className="text-red-600">*</span>
          </Typography>
          <Input
            type="date"
            value={generalSettings.dateOfIncorporation}
            onChange={(e) => updateGeneral('dateOfIncorporation', e.target.value)}
            errorMessage={fieldErrors?.dateOfIncorporation}
          />
        </div>
        <div className="space-y-2">
          <Typography variant="label" className="text-xs">
            Website Link
          </Typography>
          <Input
            value={generalSettings.website}
            onChange={(e) => updateGeneral('website', e.target.value)}
            placeholder="https://your-domain.com"
            errorMessage={fieldErrors?.website}
          />
        </div>
        <div className="space-y-2">
          <Typography variant="label" className="text-xs">
            Phone
          </Typography>
          <Input
            value={generalSettings.phone}
            onChange={(e) => updateGeneral('phone', e.target.value)}
            placeholder="+44 ..."
            errorMessage={fieldErrors?.phone}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Typography variant="label" className="text-xs">
          Business Description
        </Typography>
        <textarea
          value={generalSettings.businessDescription}
          onChange={(e) => updateGeneral('businessDescription', e.target.value)}
          className={cn(
            'min-h-[90px] w-full resize-none rounded-md border bg-form-surface px-3 py-2 text-sm text-form-title outline-none focus-visible:ring-2',
            fieldErrors?.businessDescription
              ? 'border-red-500 focus-visible:ring-red-500/20'
              : 'border-form-border-light focus-visible:ring-primary-500/20'
          )}
          maxLength={500}
          placeholder="Describe your business model and the products you ship."
        />
        {fieldErrors?.businessDescription ? (
          <Typography variant="caption" className="text-red-600">
            {fieldErrors.businessDescription}
          </Typography>
        ) : null}
        <Typography variant="caption" color="muted" className="text-xs">
          {generalSettings.businessDescription.length}/500 characters
        </Typography>
      </div>
    </section>
  );
}
