import { parseISO, isValid } from 'date-fns';
import DatePicker from '@/components/atoms/DatePicker';
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
import { SETTINGS_FORM_SECTION_LABEL_CLASS } from '@/lib/settingsUi';
import {
  portalFieldInputClass,
  portalFieldLabelClass,
  portalRequiredMarkClass,
  portalSelectTriggerClass,
} from '@/lib/portalTheme';
import { cn } from '@/lib/utils';

interface GeneralInfoSectionProps {
  generalSettings: GeneralSettingsState;
  updateGeneral: UpdateGeneralSettings;
  fieldErrors?: Record<string, string>;
  readOnly?: boolean;
}

const RequiredMark = (): React.JSX.Element => <span className={portalRequiredMarkClass}> *</span>;

export default function GeneralInfoSection({
  generalSettings,
  updateGeneral,
  fieldErrors,
  readOnly = false,
}: GeneralInfoSectionProps): React.JSX.Element {
  const incorporationDate = generalSettings.dateOfIncorporation
    ? parseISO(generalSettings.dateOfIncorporation)
    : undefined;
  const incorporationDateValue =
    incorporationDate && isValid(incorporationDate) ? incorporationDate : undefined;

  const readOnlyInputClass = readOnly ? portalFieldInputClass(true) : portalFieldInputClass();

  return (
    <section className="space-y-4">
      <Typography className={SETTINGS_FORM_SECTION_LABEL_CLASS}>General Information</Typography>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Typography className={portalFieldLabelClass}>
            Trading Name
            <RequiredMark />
          </Typography>
          <Input
            value={generalSettings.tradingName}
            onChange={(e) => updateGeneral('tradingName', e.target.value)}
            errorMessage={fieldErrors?.tradingName}
            readOnly={readOnly}
            disabled={readOnly}
            className={readOnlyInputClass}
          />
        </div>
        <div className="space-y-2">
          <Typography className={portalFieldLabelClass}>
            Legal Entity Name
            <RequiredMark />
          </Typography>
          <Input
            value={generalSettings.legalEntityName}
            onChange={(e) => updateGeneral('legalEntityName', e.target.value)}
            errorMessage={fieldErrors?.legalEntityName}
            readOnly={readOnly}
            disabled={readOnly}
            className={readOnlyInputClass}
          />
        </div>
        <div className="space-y-2">
          <Typography className={portalFieldLabelClass}>
            Industry
            <RequiredMark />
          </Typography>
          <Select
            value={generalSettings.industry || undefined}
            onValueChange={(v) => updateGeneral('industry', v)}
            disabled={readOnly}
          >
            <SelectTrigger
              className={cn(
                portalSelectTriggerClass,
                readOnlyInputClass,
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
          <Typography className={portalFieldLabelClass}>
            Company Size
            <RequiredMark />
          </Typography>
          <Select
            value={generalSettings.companySize || undefined}
            onValueChange={(v) => updateGeneral('companySize', v)}
            disabled={readOnly}
          >
            <SelectTrigger
              className={cn(
                portalSelectTriggerClass,
                readOnlyInputClass,
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
          <Typography className={portalFieldLabelClass}>
            Date of Incorporation
            <RequiredMark />
          </Typography>
          <div className="[&_button]:h-11 [&_button]:w-full [&_button]:border-[#E5E7EB]">
            <DatePicker
              date={incorporationDateValue}
              onDateChange={(date) =>
                updateGeneral('dateOfIncorporation', date ? date.toISOString().slice(0, 10) : '')
              }
              placeholder="Select date"
              displayFormat="d MMMM yyyy"
              disabled={readOnly}
              className="gap-0"
            />
          </div>
          {fieldErrors?.dateOfIncorporation ? (
            <Typography variant="caption" className="text-red-600">
              {fieldErrors.dateOfIncorporation}
            </Typography>
          ) : null}
        </div>
        <div className="space-y-2">
          <Typography className={portalFieldLabelClass}>Website Link</Typography>
          <Input
            value={generalSettings.website}
            onChange={(e) => updateGeneral('website', e.target.value)}
            placeholder="www.example.com"
            errorMessage={fieldErrors?.website}
            readOnly={readOnly}
            disabled={readOnly}
            className={readOnlyInputClass}
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Typography className={portalFieldLabelClass}>Business Description</Typography>
          <Typography variant="caption" className="text-xs text-[#A1A1AA]">
            {generalSettings.businessDescription.length} / 500 Max characters
          </Typography>
        </div>
        <textarea
          value={generalSettings.businessDescription}
          onChange={(e) => updateGeneral('businessDescription', e.target.value)}
          readOnly={readOnly}
          disabled={readOnly}
          className={cn(
            'min-h-[120px] w-full resize-none rounded-md border px-3 py-2 text-sm text-[#18181B] outline-none focus-visible:ring-2',
            readOnly && 'bg-[#FAFAFA] text-[#71717A]',
            fieldErrors?.businessDescription
              ? 'border-red-500 focus-visible:ring-red-500/20'
              : 'border-[#E5E7EB] focus-visible:ring-[#C63131]/15'
          )}
          maxLength={500}
          placeholder="Describe your business model and the products you ship."
        />
        {fieldErrors?.businessDescription ? (
          <Typography variant="caption" className="text-red-600">
            {fieldErrors.businessDescription}
          </Typography>
        ) : null}
      </div>
    </section>
  );
}
