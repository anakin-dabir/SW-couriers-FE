import * as React from 'react';
import { format } from 'date-fns';
import { ArrowRight, Plus, Upload } from 'lucide-react';
import { parsePhoneNumber } from 'libphonenumber-js';
import PhoneInput, { type Country } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/checkbox';
import { Input } from '@/components/atoms/input';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/atoms/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { Typography } from '@/components/atoms';
import {
  CREDIT_ACCOUNT_EXISTS_MODAL_BODY,
  CREDIT_ACCOUNT_EXISTS_MODAL_CLOSE_BTN,
  CREDIT_ACCOUNT_EXISTS_MODAL_DESCRIPTION,
  CREDIT_ACCOUNT_EXISTS_MODAL_FOOTER,
  CREDIT_ACCOUNT_EXISTS_MODAL_FOOTER_ROW,
  CREDIT_ACCOUNT_EXISTS_MODAL_PRIMARY_BTN,
  CREDIT_ACCOUNT_EXISTS_MODAL_TITLE,
  CREDIT_ACCOUNT_EXISTS_MODAL_WRAPPER,
} from '@/lib/modalStyles';
import {
  useCreateCreditApplicationDraftMutation,
  useCreateCreditApplicationMutation,
  useGetCurrentCreditApplicationQuery,
  useGetCreditApplicationDraftQuery,
  usePublishCreditApplicationDraftMutation,
  useUpdateCreditApplicationDraftMutation,
  type CreditApplicationPayload,
  type CreditBankAccountType,
  type CreditIndustry,
  type CreditNumberOfEmployees,
} from '@/store/api/creditApplicationsApi';
import {
  useGetOrganizationProfileQuery,
  type OrganizationProfileOrganizationDto,
} from '@/store/api/organizationProfileApi';
import { creditApplicationIndustryOrNull } from '@/lib/creditIndustryMapping';
import CreditApplicationFormShell from '@/components/pages/CreditApplication/CreditApplicationFormShell';
import {
  CreditFormField,
  CreditFormStepHeader,
  CreditFormStepPanel,
  ProfileReadOnlyDate,
  ProfileReadOnlySelect,
} from '@/components/pages/CreditApplication/creditFormPrimitives';
import {
  CREDIT_FORM_BACK_BTN_CLASS,
  CREDIT_FORM_CANCEL_BTN_CLASS,
  CREDIT_FORM_DRAFT_BTN_CLASS,
  CREDIT_FORM_FIELD_INPUT_CLASS,
  CREDIT_FORM_FOOTER_CLASS,
  CREDIT_FORM_NESTED_CARD_CLASS,
  CREDIT_FORM_OUTLINE_BTN_CLASS,
  CREDIT_FORM_PRIMARY_BTN_CLASS,
  CREDIT_FORM_READONLY_INPUT_CLASS,
} from '@/lib/creditApplicationUi';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';

const INDUSTRY_OPTIONS: ReadonlyArray<{ label: string; value: CreditIndustry }> = [
  { label: 'Agriculture and Farming', value: 'AGRICULTURE_AND_FARMING' },
  { label: 'Automotive', value: 'AUTOMOTIVE' },
  { label: 'Construction and Building', value: 'CONSTRUCTION_AND_BUILDING' },
  { label: 'Education', value: 'EDUCATION' },
  { label: 'Energy and Utilities', value: 'ENERGY_AND_UTILITIES' },
  { label: 'Financial Services', value: 'FINANCIAL_SERVICES' },
  { label: 'Food and Beverage', value: 'FOOD_AND_BEVERAGE' },
  { label: 'Healthcare and Pharmaceuticals', value: 'HEALTHCARE_AND_PHARMACEUTICALS' },
  { label: 'Home and Lifestyle', value: 'HOME_AND_LIFESTYLE' },
  { label: 'Hospitality and Tourism', value: 'HOSPITALITY_AND_TOURISM' },
  { label: 'IT and Technology', value: 'IT_AND_TECHNOLOGY' },
  { label: 'Logistics and Transport', value: 'LOGISTICS_AND_TRANSPORT' },
  { label: 'Manufacturing', value: 'MANUFACTURING' },
  { label: 'Media and Entertainment', value: 'MEDIA_AND_ENTERTAINMENT' },
  { label: 'Professional Services', value: 'PROFESSIONAL_SERVICES' },
  { label: 'Real Estate', value: 'REAL_ESTATE' },
  { label: 'Retail', value: 'RETAIL' },
  { label: 'Telecommunications', value: 'TELECOMMUNICATIONS' },
  { label: 'Wholesale and Distribution', value: 'WHOLESALE_AND_DISTRIBUTION' },
  { label: 'Other', value: 'OTHER' },
];
const EMPLOYEE_OPTIONS = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees',
] as const satisfies ReadonlyArray<CreditNumberOfEmployees>;
const RELATIONSHIP_DURATION_OPTIONS: ReadonlyArray<{ label: string; value: string }> = [
  { label: 'Less than 1 year', value: 'LESS_THAN_1_YEAR' },
  { label: '1-2 years', value: '1_TO_2_YEARS' },
  { label: '2-5 years', value: '2_TO_5_YEARS' },
  { label: '5-10 years', value: '5_TO_10_YEARS' },
  { label: 'Over 10 years', value: 'OVER_10_YEARS' },
];
const PAYMENT_TERMS_OPTIONS = [
  { label: 'Net 15', value: 15 },
  { label: 'Net 30', value: 30 },
  { label: 'Net 45', value: 45 },
  { label: 'Net 60', value: 60 },
] as const;
const SEASONAL_MONTH_OPTIONS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const STEP_ITEMS = [
  'Company Financial\nInformation',
  'Trade\nReferences',
  'Bank\nReference',
  'Requested\nCredit Terms',
  'Declarations &\nConsent',
] as const;

const NUMERIC_ONLY_ERROR = 'Must contain only numbers';
const EMAIL_INVALID_ERROR = 'Enter a valid email address';
const PHONE_INVALID_ERROR =
  'Enter a valid phone number for the selected country (or use international +… format)';
const PROFILE_FIELD_MISSING_ERROR =
  'This field is missing from your company profile. Update it in Company Settings.';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapProfileCompanySizeToEmployees(companySize: string | null | undefined): string {
  const trimmed = (companySize ?? '').trim();
  if (!trimmed) return '';
  if (trimmed === '500+ employees') return '501-1000 employees';
  if ((EMPLOYEE_OPTIONS as readonly string[]).includes(trimmed)) return trimmed;
  return trimmed;
}

function parseProfileDate(value: string | null | undefined): Date | undefined {
  if (!value?.trim()) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function getIndustryDisplayLabel(value: string): string {
  if (!value.trim()) return '';
  const creditValue = creditApplicationIndustryOrNull(value);
  if (creditValue) {
    return INDUSTRY_OPTIONS.find((option) => option.value === creditValue)?.label ?? creditValue;
  }
  return value;
}

function getEmployeeDisplayLabel(value: string): string {
  if (!value.trim()) return '';
  return value;
}

function sanitizeIntegerInput(value: string): string {
  return value.replace(/\D/g, '');
}

function sanitizeDecimalInput(value: string): string {
  const digitsAndDots = value.replace(/[^\d.]/g, '');
  const [whole, ...fractional] = digitsAndDots.split('.');
  if (fractional.length === 0) return whole;
  return `${whole}.${fractional.join('')}`;
}

function sanitizeSortCodeInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 6);
}

function sanitizeAccountLast4Input(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4);
}

function isNumericInteger(value: string): boolean {
  return /^\d+$/.test(value);
}

function isNumericDecimal(value: string): boolean {
  return /^\d+(\.\d+)?$/.test(value);
}

function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

/**
 * Validates contact phones for any country selected in PhoneInput.
 * International (+…) values are parsed globally; national formats use the selected country.
 */
function isValidContactPhone(value: string, country: Country = 'GB'): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;

  try {
    const phone = parsePhoneNumber(
      trimmed,
      trimmed.startsWith('+') ? undefined : { defaultCountry: country }
    );
    return phone.isValid() || phone.isPossible();
  } catch {
    return false;
  }
}

interface FirstStepForm {
  companyRegistrationNumber: string;
  vatRegistrationNumber: string;
  industry: string;
  numberOfEmployees: string;
  yearsTrading: string;
  annualTurnover: string;
  netProfit: string;
}

interface TradeReference {
  companyName: string;
  contactPerson: string;
  contactPhone: string;
  contactPhoneCountry: Country;
  contactEmail: string;
  accountNumber: string;
  creditLimit: string;
  relationshipDuration: string;
}

interface BankReferenceForm {
  bankName: string;
  sortCode: string;
  accountNumberLast4: string;
  accountType: string;
  referenceLetterName: string;
}

interface RequestedCreditTermsForm {
  requestedCreditLimit: string;
  requestedPaymentTermsDays: string;
  expectedMonthlySpend: string;
  seasonalPeaks: string[];
  justification: string;
}

interface DeclarationsConsentForm {
  signatoryName: string;
  positionTitle: string;
  consentCreditCheck: boolean;
  consentTerms: boolean;
  consentDataProcessing: boolean;
}

const FIRST_STEP_INITIAL: FirstStepForm = {
  companyRegistrationNumber: '',
  vatRegistrationNumber: '',
  industry: '',
  numberOfEmployees: '',
  yearsTrading: '',
  annualTurnover: '',
  netProfit: '',
};

const NEW_REFERENCE = (): TradeReference => ({
  companyName: '',
  contactPerson: '',
  contactPhone: '',
  contactPhoneCountry: 'GB',
  contactEmail: '',
  accountNumber: '',
  creditLimit: '',
  relationshipDuration: '',
});

const BANK_REFERENCE_INITIAL: BankReferenceForm = {
  bankName: '',
  sortCode: '',
  accountNumberLast4: '',
  accountType: '',
  referenceLetterName: '',
};

const REQUESTED_TERMS_INITIAL: RequestedCreditTermsForm = {
  requestedCreditLimit: '',
  requestedPaymentTermsDays: '',
  expectedMonthlySpend: '',
  seasonalPeaks: [],
  justification: '',
};

const DECLARATIONS_INITIAL: DeclarationsConsentForm = {
  signatoryName: '',
  positionTitle: '',
  consentCreditCheck: false,
  consentTerms: false,
  consentDataProcessing: false,
};

function mapOrganizationProfileToFirstStep(
  org: OrganizationProfileOrganizationDto
): Pick<
  FirstStepForm,
  'companyRegistrationNumber' | 'vatRegistrationNumber' | 'industry' | 'numberOfEmployees'
> {
  return {
    companyRegistrationNumber: org.companies_house_number ?? '',
    vatRegistrationNumber: org.vat_number ?? '',
    industry: creditApplicationIndustryOrNull(org.industry) ?? '',
    numberOfEmployees: mapProfileCompanySizeToEmployees(org.company_size),
  };
}

function mapDraftApplicationToFirstStepFields(
  app: CreditApplicationPayload
): Partial<FirstStepForm> {
  const employees = app.number_of_employees;
  return {
    companyRegistrationNumber: app.company_registration_number ?? '',
    vatRegistrationNumber: app.vat_registration_number ?? '',
    industry: creditApplicationIndustryOrNull(app.industry) ?? '',
    numberOfEmployees:
      employees != null && String(employees).trim().length > 0
        ? mapProfileCompanySizeToEmployees(String(employees))
        : '',
    yearsTrading: app.years_trading != null ? String(app.years_trading) : '',
    annualTurnover: app.annual_turnover != null ? String(app.annual_turnover) : '',
    netProfit: app.net_profit != null ? String(app.net_profit) : '',
  };
}

function resetNewApplicationFormState(): {
  firstStep: FirstStepForm;
  references: TradeReference[];
  bankReference: BankReferenceForm;
  requestedTerms: RequestedCreditTermsForm;
  declarations: DeclarationsConsentForm;
} {
  return {
    firstStep: { ...FIRST_STEP_INITIAL },
    references: [NEW_REFERENCE(), NEW_REFERENCE()],
    bankReference: { ...BANK_REFERENCE_INITIAL },
    requestedTerms: { ...REQUESTED_TERMS_INITIAL },
    declarations: { ...DECLARATIONS_INITIAL },
  };
}

interface CreditApplicationFormLocationState {
  /** Set when opening the form from the draft list (Continue editing). */
  returnTo?: string;
}

export default function CreditLimitIncreaseFormPage(): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const draftIdFromUrl = searchParams.get('draftId');
  const returnToFromNavigation = (location.state as CreditApplicationFormLocationState | null)
    ?.returnTo;
  const organizationIdFromUser = useAppSelector(
    (state: RootState) =>
      state.auth.user?.organization_id ??
      state.auth.loginResponse?.data?.organization_id ??
      state.auth.loginResponse?.data?.organization?.id ??
      null
  );
  const accessToken = useAppSelector((state: RootState) => state.auth.accessToken);
  const organizationId = React.useMemo(
    () => organizationIdFromUser ?? parseOrganizationIdFromToken(accessToken),
    [organizationIdFromUser, accessToken]
  );
  const [createCreditApplication, { isLoading: isSubmittingApplication }] =
    useCreateCreditApplicationMutation();
  const [createCreditDraft, { isLoading: isCreatingDraft }] =
    useCreateCreditApplicationDraftMutation();
  const [updateCreditDraft, { isLoading: isUpdatingDraft }] =
    useUpdateCreditApplicationDraftMutation();
  const [publishCreditDraft, { isLoading: isPublishingDraft }] =
    usePublishCreditApplicationDraftMutation();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [dateOfIncorporation, setDateOfIncorporation] = React.useState<Date | undefined>(undefined);
  const [dateOfIncorporationError, setDateOfIncorporationError] = React.useState<
    string | undefined
  >(undefined);
  const [draftId, setDraftId] = React.useState<string | null>(null);
  const [bankReferenceLetterFile, setBankReferenceLetterFile] = React.useState<File | null>(null);
  const [firstStepForm, setFirstStepForm] = React.useState<FirstStepForm>(FIRST_STEP_INITIAL);
  const [firstStepErrors, setFirstStepErrors] = React.useState<
    Partial<Record<keyof FirstStepForm, string>>
  >({});
  const [references, setReferences] = React.useState<TradeReference[]>([
    NEW_REFERENCE(),
    NEW_REFERENCE(),
  ]);
  const [tradeReferenceErrors, setTradeReferenceErrors] = React.useState<
    Array<Partial<Record<keyof TradeReference, string>>>
  >([]);
  const [bankReferenceForm, setBankReferenceForm] =
    React.useState<BankReferenceForm>(BANK_REFERENCE_INITIAL);
  const [bankReferenceErrors, setBankReferenceErrors] = React.useState<
    Partial<Record<keyof BankReferenceForm, string>>
  >({});
  const [requestedTermsForm, setRequestedTermsForm] =
    React.useState<RequestedCreditTermsForm>(REQUESTED_TERMS_INITIAL);
  const [requestedTermsErrors, setRequestedTermsErrors] = React.useState<
    Partial<Record<keyof RequestedCreditTermsForm, string>>
  >({});
  const [declarationsForm, setDeclarationsForm] =
    React.useState<DeclarationsConsentForm>(DECLARATIONS_INITIAL);
  const [declarationsErrors, setDeclarationsErrors] = React.useState<
    Partial<Record<keyof DeclarationsConsentForm, string>>
  >({});
  const [creditAccountExistsDialogOpen, setCreditAccountExistsDialogOpen] = React.useState(false);
  const bankReferenceFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const hydratedDraftRef = React.useRef<string | null>(null);
  const hasShownDraftLoadErrorRef = React.useRef(false);
  const { data: draftDetailRes, isError: isDraftLoadError } = useGetCreditApplicationDraftQuery(
    { organizationId: organizationId ?? '', draftId: draftIdFromUrl ?? '' },
    { skip: !organizationId || !draftIdFromUrl }
  );
  const { data: currentCreditApplicationRes } = useGetCurrentCreditApplicationQuery(
    { organizationId: organizationId ?? '' },
    { skip: !organizationId }
  );
  const { data: organizationProfileRes, isLoading: isOrganizationProfileLoading } =
    useGetOrganizationProfileQuery(
      { organizationId: organizationId ?? '' },
      { skip: !organizationId }
    );
  const isSavingDraft = isCreatingDraft || isUpdatingDraft;
  const isSubmitting = isSubmittingApplication || isPublishingDraft;
  const hasExistingCreditAccount = Boolean(currentCreditApplicationRes?.data?.id);

  React.useEffect(() => {
    const draft = draftDetailRes?.data;
    if (!draft || hydratedDraftRef.current === draft.id) return;
    hydratedDraftRef.current = draft.id;
    setDraftId(draft.id);
    const app = draft.application ?? {};
    setFirstStepForm((prev) => ({
      ...prev,
      ...mapDraftApplicationToFirstStepFields(app),
    }));
    const draftIncorporationDate = parseProfileDate(app.date_of_incorporation ?? undefined);
    if (draftIncorporationDate) {
      setDateOfIncorporation(draftIncorporationDate);
      setDateOfIncorporationError(undefined);
    }
    setReferences(
      app.trade_references && app.trade_references.length > 0
        ? app.trade_references.map((ref) => ({
            companyName: ref.company_name ?? '',
            contactPerson: ref.contact_person ?? '',
            contactPhone: ref.contact_phone ?? '',
            contactPhoneCountry: 'GB',
            contactEmail: ref.contact_email ?? '',
            accountNumber: ref.account_number_reference ?? '',
            creditLimit:
              ref.credit_limit_with_reference != null
                ? String(ref.credit_limit_with_reference)
                : '',
            relationshipDuration: ref.relationship_duration ?? '',
          }))
        : [NEW_REFERENCE(), NEW_REFERENCE()]
    );
    setBankReferenceForm({
      bankName: app.bank_reference?.bank_name ?? app.bank_name ?? '',
      sortCode: app.bank_reference?.bank_sort_code ?? app.bank_sort_code ?? '',
      accountNumberLast4:
        app.bank_reference?.bank_account_number_last4 ?? app.bank_account_number_last4 ?? '',
      accountType: app.bank_reference?.bank_account_type ?? app.bank_account_type ?? '',
      referenceLetterName: app.bank_reference?.reference_letter?.filename ?? '',
    });
    setBankReferenceLetterFile(null);
    setRequestedTermsForm({
      requestedCreditLimit:
        app.requested_credit_limit != null ? String(app.requested_credit_limit) : '',
      requestedPaymentTermsDays:
        app.requested_payment_terms_days != null ? String(app.requested_payment_terms_days) : '',
      expectedMonthlySpend:
        app.expected_monthly_spend != null ? String(app.expected_monthly_spend) : '',
      seasonalPeaks: Array.isArray(app.seasonal_peaks)
        ? app.seasonal_peaks.filter((item): item is string => typeof item === 'string')
        : [],
      justification: app.justification ?? '',
    });
    setDeclarationsForm({
      signatoryName: app.director_signatory_name ?? '',
      positionTitle: app.director_signatory_position ?? '',
      consentCreditCheck: Boolean(app.consent_credit_check),
      consentTerms: Boolean(app.consent_terms_and_conditions),
      consentDataProcessing: Boolean(app.consent_data_processing),
    });
    setCurrentStep(0);
    setFirstStepErrors({});
    setTradeReferenceErrors([]);
    setBankReferenceErrors({});
    setRequestedTermsErrors({});
    setDeclarationsErrors({});
    setDateOfIncorporationError(undefined);
  }, [draftDetailRes]);

  /** New application: reset form and pre-fill company fields from GET /organizations/{id}/profile */
  React.useEffect(() => {
    if (draftIdFromUrl) return;

    const reset = resetNewApplicationFormState();
    setDraftId(null);
    hydratedDraftRef.current = null;
    setCurrentStep(0);
    setBankReferenceLetterFile(null);
    setTradeReferenceErrors([]);
    setBankReferenceErrors({});
    setRequestedTermsErrors({});
    setDeclarationsErrors({});
    setFirstStepErrors({});
    setDateOfIncorporationError(undefined);

    const org = organizationProfileRes?.data?.organization;
    if (org) {
      setFirstStepForm({
        ...reset.firstStep,
        ...mapOrganizationProfileToFirstStep(org),
      });
      setReferences(reset.references);
      setBankReferenceForm(reset.bankReference);
      setRequestedTermsForm(reset.requestedTerms);
      setDeclarationsForm(reset.declarations);
      const incorporationDate = parseProfileDate(org.date_of_incorporation);
      setDateOfIncorporation(incorporationDate);
    } else {
      setFirstStepForm(reset.firstStep);
      setReferences(reset.references);
      setBankReferenceForm(reset.bankReference);
      setRequestedTermsForm(reset.requestedTerms);
      setDeclarationsForm(reset.declarations);
      setDateOfIncorporation(undefined);
    }
  }, [draftIdFromUrl, organizationProfileRes]);

  /** Draft edit: show company names from profile; fill any company fields missing on the draft */
  React.useEffect(() => {
    if (!draftIdFromUrl) return;
    const org = organizationProfileRes?.data?.organization;
    if (!org) return;

    setFirstStepForm((prev) => {
      const fromProfile = mapOrganizationProfileToFirstStep(org);
      return {
        ...prev,
        companyRegistrationNumber:
          prev.companyRegistrationNumber || fromProfile.companyRegistrationNumber,
        vatRegistrationNumber: prev.vatRegistrationNumber || fromProfile.vatRegistrationNumber,
        industry: prev.industry || fromProfile.industry,
        numberOfEmployees: prev.numberOfEmployees || fromProfile.numberOfEmployees,
      };
    });

    setDateOfIncorporation((prev) => {
      if (prev) return prev;
      return parseProfileDate(org.date_of_incorporation);
    });
  }, [draftIdFromUrl, organizationProfileRes]);

  React.useEffect(() => {
    if (!isDraftLoadError || hasShownDraftLoadErrorRef.current) return;
    hasShownDraftLoadErrorRef.current = true;
    toast.error('Could not load draft. You can continue with a new application.');
  }, [isDraftLoadError]);

  React.useEffect(() => {
    hasShownDraftLoadErrorRef.current = false;
    if (!draftIdFromUrl) {
      hydratedDraftRef.current = null;
    }
  }, [draftIdFromUrl]);

  const updateFirstStepField = <K extends keyof FirstStepForm>(
    key: K,
    value: FirstStepForm[K]
  ): void => {
    setFirstStepForm((prev) => ({ ...prev, [key]: value }));
    setFirstStepErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const updateReferenceField = <K extends keyof TradeReference>(
    index: number,
    key: K,
    value: TradeReference[K]
  ): void => {
    setReferences((prev) =>
      prev.map((ref, idx) => (idx === index ? { ...ref, [key]: value } : ref))
    );
    setTradeReferenceErrors((prev) =>
      prev.map((errors, idx) => (idx === index ? { ...errors, [key]: undefined } : errors))
    );
  };

  const addReference = (): void => {
    if (references.length >= 5) return;
    setReferences((prev) => [...prev, NEW_REFERENCE()]);
    setTradeReferenceErrors((prev) => [...prev, {}]);
  };

  const updateBankReferenceField = <K extends keyof BankReferenceForm>(
    key: K,
    value: BankReferenceForm[K]
  ): void => {
    setBankReferenceForm((prev) => ({ ...prev, [key]: value }));
    setBankReferenceErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const updateDeclarationsField = <K extends keyof DeclarationsConsentForm>(
    key: K,
    value: DeclarationsConsentForm[K]
  ): void => {
    setDeclarationsForm((prev) => ({ ...prev, [key]: value }));
    setDeclarationsErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const updateRequestedTermsField = <K extends keyof RequestedCreditTermsForm>(
    key: K,
    value: RequestedCreditTermsForm[K]
  ): void => {
    setRequestedTermsForm((prev) => ({ ...prev, [key]: value }));
    setRequestedTermsErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const applicationPayload = React.useMemo<CreditApplicationPayload>(() => {
    return {
      company_registration_number: firstStepForm.companyRegistrationNumber.trim() || null,
      vat_registration_number: firstStepForm.vatRegistrationNumber.trim() || null,
      industry: creditApplicationIndustryOrNull(firstStepForm.industry),
      number_of_employees: (firstStepForm.numberOfEmployees as CreditNumberOfEmployees) || null,
      date_of_incorporation: dateOfIncorporation
        ? dateOfIncorporation.toISOString().slice(0, 10)
        : null,
      years_trading:
        firstStepForm.yearsTrading.trim().length > 0
          ? Number.parseInt(firstStepForm.yearsTrading.trim(), 10) || null
          : null,
      annual_turnover: firstStepForm.annualTurnover.trim() || null,
      net_profit: firstStepForm.netProfit.trim() || null,
      trade_references: references.map((ref) => ({
        company_name: ref.companyName.trim() || null,
        contact_person: ref.contactPerson.trim() || null,
        contact_phone: ref.contactPhone.trim() || null,
        contact_email: ref.contactEmail.trim() || null,
        account_number_reference: ref.accountNumber.trim() || null,
        credit_limit_with_reference: ref.creditLimit.trim() || null,
        relationship_duration: ref.relationshipDuration.trim() || null,
      })),
      bank_name: bankReferenceForm.bankName.trim() || null,
      bank_sort_code: bankReferenceForm.sortCode.trim() || null,
      bank_account_number_last4: bankReferenceForm.accountNumberLast4.trim() || null,
      bank_account_type: (bankReferenceForm.accountType as CreditBankAccountType) || null,
      requested_credit_limit: requestedTermsForm.requestedCreditLimit.trim() || null,
      requested_payment_terms_days:
        requestedTermsForm.requestedPaymentTermsDays.trim().length > 0
          ? Number.parseInt(requestedTermsForm.requestedPaymentTermsDays, 10) || null
          : null,
      expected_monthly_spend: requestedTermsForm.expectedMonthlySpend.trim() || null,
      seasonal_peaks:
        requestedTermsForm.seasonalPeaks.length > 0 ? requestedTermsForm.seasonalPeaks : null,
      justification: requestedTermsForm.justification.trim() || null,
      director_signatory_name: declarationsForm.signatoryName.trim() || null,
      director_signatory_position: declarationsForm.positionTitle.trim() || null,
      declaration_date: new Date().toISOString().slice(0, 10),
      consent_credit_check: declarationsForm.consentCreditCheck,
      consent_terms_and_conditions: declarationsForm.consentTerms,
      consent_data_processing: declarationsForm.consentDataProcessing,
    };
  }, [
    bankReferenceForm.accountNumberLast4,
    bankReferenceForm.accountType,
    bankReferenceForm.bankName,
    bankReferenceForm.sortCode,
    dateOfIncorporation,
    declarationsForm.consentCreditCheck,
    declarationsForm.consentDataProcessing,
    declarationsForm.consentTerms,
    declarationsForm.positionTitle,
    declarationsForm.signatoryName,
    firstStepForm.annualTurnover,
    firstStepForm.companyRegistrationNumber,
    firstStepForm.industry,
    firstStepForm.netProfit,
    firstStepForm.numberOfEmployees,
    firstStepForm.vatRegistrationNumber,
    firstStepForm.yearsTrading,
    references,
    requestedTermsForm.expectedMonthlySpend,
    requestedTermsForm.justification,
    requestedTermsForm.requestedCreditLimit,
    requestedTermsForm.requestedPaymentTermsDays,
    requestedTermsForm.seasonalPeaks,
  ]);

  const validateFirstStep = (): boolean => {
    const errors: Partial<Record<keyof FirstStepForm, string>> = {};

    if (!firstStepForm.companyRegistrationNumber.trim()) {
      errors.companyRegistrationNumber = PROFILE_FIELD_MISSING_ERROR;
    }
    if (!firstStepForm.vatRegistrationNumber.trim()) {
      errors.vatRegistrationNumber = PROFILE_FIELD_MISSING_ERROR;
    }
    if (!firstStepForm.industry.trim()) errors.industry = PROFILE_FIELD_MISSING_ERROR;
    if (!firstStepForm.numberOfEmployees.trim()) {
      errors.numberOfEmployees = PROFILE_FIELD_MISSING_ERROR;
    }
    if (!dateOfIncorporation) {
      setDateOfIncorporationError(PROFILE_FIELD_MISSING_ERROR);
    } else {
      setDateOfIncorporationError(undefined);
    }
    if (!firstStepForm.yearsTrading.trim()) {
      errors.yearsTrading = 'Years trading is required';
    } else if (!isNumericInteger(firstStepForm.yearsTrading.trim())) {
      errors.yearsTrading = NUMERIC_ONLY_ERROR;
    }
    if (!firstStepForm.annualTurnover.trim()) {
      errors.annualTurnover = 'Annual turnover is required';
    } else if (!isNumericDecimal(firstStepForm.annualTurnover.trim())) {
      errors.annualTurnover = NUMERIC_ONLY_ERROR;
    }
    const netProfitTrimmed = firstStepForm.netProfit.trim();
    if (netProfitTrimmed && !isNumericDecimal(netProfitTrimmed)) {
      errors.netProfit = NUMERIC_ONLY_ERROR;
    }

    setFirstStepErrors(errors);
    return Object.keys(errors).length === 0 && Boolean(dateOfIncorporation);
  };

  const validateTradeReferencesStep = (): boolean => {
    const errors = references.map((reference) => {
      const rowErrors: Partial<Record<keyof TradeReference, string>> = {};
      if (!reference.companyName.trim()) rowErrors.companyName = 'Company name is required';
      if (!reference.contactPerson.trim()) rowErrors.contactPerson = 'Contact person is required';
      if (!reference.contactPhone.trim()) {
        rowErrors.contactPhone = 'Contact phone is required';
      } else if (!isValidContactPhone(reference.contactPhone, reference.contactPhoneCountry)) {
        rowErrors.contactPhone = PHONE_INVALID_ERROR;
      }
      if (!reference.contactEmail.trim()) {
        rowErrors.contactEmail = 'Contact email is required';
      } else if (!isValidEmail(reference.contactEmail)) {
        rowErrors.contactEmail = EMAIL_INVALID_ERROR;
      }
      const creditLimitTrimmed = reference.creditLimit.trim();
      if (creditLimitTrimmed && !isNumericDecimal(creditLimitTrimmed)) {
        rowErrors.creditLimit = NUMERIC_ONLY_ERROR;
      }
      if (!reference.relationshipDuration.trim()) {
        rowErrors.relationshipDuration = 'Relationship duration is required';
      }
      return rowErrors;
    });

    setTradeReferenceErrors(errors);
    const hasRowErrors = errors.some((row) => Object.keys(row).length > 0);
    if (references.length < 2) {
      toast.error('Provide a minimum of 2 trade references.');
      return false;
    }
    return !hasRowErrors;
  };

  const validateBankReferenceStep = (): boolean => {
    const errors: Partial<Record<keyof BankReferenceForm, string>> = {};
    const sortCodeDigits = bankReferenceForm.sortCode.replace(/\D/g, '');
    const accountLast4Digits = bankReferenceForm.accountNumberLast4.replace(/\D/g, '');

    if (!bankReferenceForm.bankName.trim()) errors.bankName = 'Bank name is required';
    if (!sortCodeDigits) {
      errors.sortCode = 'Sort code is required';
    } else if (sortCodeDigits.length !== 6) {
      errors.sortCode = 'Sort code must be 6 digits';
    }
    if (!accountLast4Digits) {
      errors.accountNumberLast4 = 'Account number (last 4 digits) is required';
    } else if (accountLast4Digits.length !== 4) {
      errors.accountNumberLast4 = 'Enter exactly 4 digits';
    }
    if (!bankReferenceForm.accountType.trim()) errors.accountType = 'Account type is required';

    setBankReferenceErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateDeclarationsStep = (): boolean => {
    const errors: Partial<Record<keyof DeclarationsConsentForm, string>> = {};
    if (!declarationsForm.signatoryName.trim()) errors.signatoryName = 'Signatory name is required';
    if (!declarationsForm.positionTitle.trim())
      errors.positionTitle = 'Position / title is required';
    if (!declarationsForm.consentCreditCheck) {
      errors.consentCreditCheck = 'Credit check consent is required';
    }
    if (!declarationsForm.consentTerms)
      errors.consentTerms = 'Terms & Conditions consent is required';
    if (!declarationsForm.consentDataProcessing) {
      errors.consentDataProcessing = 'Data processing consent is required';
    }

    setDeclarationsErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRequestedTermsStep = (): boolean => {
    const errors: Partial<Record<keyof RequestedCreditTermsForm, string>> = {};
    const creditLimitTrimmed = requestedTermsForm.requestedCreditLimit.trim();
    const monthlySpendTrimmed = requestedTermsForm.expectedMonthlySpend.trim();

    if (!creditLimitTrimmed) {
      errors.requestedCreditLimit = 'Requested credit limit is required';
    } else if (!isNumericDecimal(creditLimitTrimmed)) {
      errors.requestedCreditLimit = NUMERIC_ONLY_ERROR;
    }
    if (!requestedTermsForm.requestedPaymentTermsDays.trim()) {
      errors.requestedPaymentTermsDays = 'Requested payment terms is required';
    }
    if (!monthlySpendTrimmed) {
      errors.expectedMonthlySpend = 'Expected monthly spend is required';
    } else if (!isNumericDecimal(monthlySpendTrimmed)) {
      errors.expectedMonthlySpend = NUMERIC_ONLY_ERROR;
    }
    setRequestedTermsErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAllStepsForSubmit = (): number | null => {
    if (!validateFirstStep()) return 0;
    if (!validateTradeReferencesStep()) return 1;
    if (!validateBankReferenceStep()) return 2;
    if (!validateRequestedTermsStep()) return 3;
    if (!validateDeclarationsStep()) return 4;
    return null;
  };

  const handleSaveDraft = async (): Promise<void> => {
    if (!organizationId) {
      toast.error('Organization id is missing.');
      return;
    }
    try {
      if (draftId) {
        const response = await updateCreditDraft({
          organizationId,
          draftId,
          draftData: applicationPayload,
          bankReferenceLetterFile,
        }).unwrap();
        if (response.failed_documents?.length) {
          toast.error('Draft saved, but bank reference letter upload failed.');
        } else {
          toast.success('Draft updated successfully.');
        }
      } else {
        const response = await createCreditDraft({
          organizationId,
          draftData: applicationPayload,
          bankReferenceLetterFile,
        }).unwrap();
        if (response.data?.id) setDraftId(response.data.id);
        if (response.failed_documents?.length) {
          toast.error('Draft saved, but bank reference letter upload failed.');
        } else {
          toast.success('Draft saved successfully.');
        }
      }
    } catch {
      toast.error('Failed to save draft. Please try again.');
    }
  };

  const handleSubmitApplication = async (): Promise<void> => {
    if (!organizationId) {
      toast.error('Organization id is missing.');
      return;
    }
    if (hasExistingCreditAccount) {
      setCreditAccountExistsDialogOpen(true);
      return;
    }
    const firstInvalidStep = validateAllStepsForSubmit();
    if (firstInvalidStep !== null) {
      setCurrentStep(firstInvalidStep);
      toast.error('Please complete all required fields before submitting.');
      return;
    }

    try {
      if (draftId) {
        const response = await publishCreditDraft({
          organizationId,
          draftId,
          applicationData: applicationPayload,
          bankReferenceLetterFile,
        }).unwrap();
        if (response.failed_documents?.length) {
          toast.error('Application submitted, but bank reference letter upload failed.');
        } else {
          toast.success('Credit application submitted successfully.');
        }
      } else {
        const response = await createCreditApplication({
          organizationId,
          applicationData: applicationPayload,
          bankReferenceLetterFile,
        }).unwrap();
        if (response.failed_documents?.length) {
          toast.error('Application submitted, but bank reference letter upload failed.');
        } else {
          toast.success('Credit application submitted successfully.');
        }
      }
      void navigate('/credit-request');
    } catch {
      toast.error('Failed to submit credit application. Please review fields and try again.');
    }
  };

  const handleSaveAndContinue = (): void => {
    if (currentStep === 0) {
      if (!validateFirstStep()) return;
      setCurrentStep(1);
      return;
    }

    if (currentStep === 1) {
      if (!validateTradeReferencesStep()) return;
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!validateBankReferenceStep()) return;
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      if (!validateRequestedTermsStep()) return;
      setCurrentStep(4);
      return;
    }

    if (currentStep === 4) {
      void handleSubmitApplication();
    }
  };

  const handleBack = (): void => {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1);
    }
  };

  const handleTopBack = (): void => {
    if (returnToFromNavigation) {
      void navigate(returnToFromNavigation);
      return;
    }
    if (draftIdFromUrl || draftId) {
      void navigate('/credit-request/drafts');
      return;
    }
    void navigate('/credit-request');
  };

  const formFooter = (
    <div className={CREDIT_FORM_FOOTER_CLASS}>
      <Button
        type="button"
        variant="outline"
        className={CREDIT_FORM_CANCEL_BTN_CLASS}
        onClick={handleTopBack}
        disabled={isSavingDraft || isSubmitting}
      >
        Cancel
      </Button>
      <div className="flex flex-wrap items-center gap-2">
        {currentStep > 0 ? (
          <Button
            type="button"
            variant="outline"
            className={CREDIT_FORM_BACK_BTN_CLASS}
            onClick={handleBack}
            disabled={isSavingDraft || isSubmitting}
          >
            Back
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          className={CREDIT_FORM_DRAFT_BTN_CLASS}
          onClick={() => void handleSaveDraft()}
          disabled={isSavingDraft || isSubmitting}
        >
          {isSavingDraft ? 'Saving...' : 'Save as Draft'}
        </Button>
        <Button
          type="button"
          className={CREDIT_FORM_PRIMARY_BTN_CLASS}
          onClick={handleSaveAndContinue}
          disabled={isSavingDraft || isSubmitting}
        >
          {currentStep === 4
            ? isSubmitting
              ? 'Submitting...'
              : 'Submit Application'
            : 'Save & Continue'}
          {currentStep === 4 ? null : <ArrowRight className="size-4" />}
        </Button>
      </div>
    </div>
  );

  return (
    <CreditApplicationFormShell
      steps={STEP_ITEMS}
      currentStep={currentStep}
      onBack={handleTopBack}
      footer={formFooter}
    >
      {currentStep === 0 ? (
        <CreditFormStepPanel>
          <CreditFormStepHeader
            title="Company Financial Information"
            description="Provide key financial and company details required for credit assessment."
          />
          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
            <CreditFormField
              label="Company Registration Number"
              required
              error={firstStepErrors.companyRegistrationNumber}
            >
              <Input
                readOnly
                value={isOrganizationProfileLoading ? '' : firstStepForm.companyRegistrationNumber}
                placeholder={isOrganizationProfileLoading ? 'Loading…' : '—'}
                className={CREDIT_FORM_READONLY_INPUT_CLASS}
              />
            </CreditFormField>
            <CreditFormField
              label="VAT Registration Number"
              required
              error={firstStepErrors.vatRegistrationNumber}
            >
              <Input
                readOnly
                value={isOrganizationProfileLoading ? '' : firstStepForm.vatRegistrationNumber}
                placeholder={isOrganizationProfileLoading ? 'Loading…' : '—'}
                className={CREDIT_FORM_READONLY_INPUT_CLASS}
              />
            </CreditFormField>
            <CreditFormField label="Industry" required error={firstStepErrors.industry}>
              <ProfileReadOnlySelect
                loading={isOrganizationProfileLoading}
                displayValue={getIndustryDisplayLabel(firstStepForm.industry)}
                placeholder="—"
              />
            </CreditFormField>
            <CreditFormField
              label="Number of Employees"
              required
              error={firstStepErrors.numberOfEmployees}
            >
              <ProfileReadOnlySelect
                loading={isOrganizationProfileLoading}
                displayValue={getEmployeeDisplayLabel(firstStepForm.numberOfEmployees)}
                placeholder="—"
              />
            </CreditFormField>
            <CreditFormField
              label="Date of Incorporation"
              required
              error={dateOfIncorporationError}
            >
              <ProfileReadOnlyDate
                loading={isOrganizationProfileLoading}
                value={dateOfIncorporation ? format(dateOfIncorporation, 'dd-MM-yyyy') : ''}
              />
            </CreditFormField>
            <CreditFormField label="Years Trading" required error={firstStepErrors.yearsTrading}>
              <Input
                type="text"
                inputMode="numeric"
                value={firstStepForm.yearsTrading}
                onChange={(event) =>
                  updateFirstStepField('yearsTrading', sanitizeIntegerInput(event.target.value))
                }
                placeholder="e.g. 10"
                className={CREDIT_FORM_FIELD_INPUT_CLASS}
              />
            </CreditFormField>
            <CreditFormField
              label="Annual Turnover"
              required
              error={firstStepErrors.annualTurnover}
            >
              <Input
                type="text"
                inputMode="decimal"
                value={firstStepForm.annualTurnover}
                onChange={(event) =>
                  updateFirstStepField('annualTurnover', sanitizeDecimalInput(event.target.value))
                }
                placeholder="e.g. £500,000.00"
                className={CREDIT_FORM_FIELD_INPUT_CLASS}
              />
            </CreditFormField>
            <CreditFormField
              label="Net Profit (Last Financial Year)"
              error={firstStepErrors.netProfit}
            >
              <Input
                type="text"
                inputMode="decimal"
                value={firstStepForm.netProfit}
                onChange={(event) =>
                  updateFirstStepField('netProfit', sanitizeDecimalInput(event.target.value))
                }
                placeholder="e.g. £120,000.00"
                className={CREDIT_FORM_FIELD_INPUT_CLASS}
              />
            </CreditFormField>
          </div>
        </CreditFormStepPanel>
      ) : currentStep === 1 ? (
        <CreditFormStepPanel>
          <CreditFormStepHeader
            title="Trade References"
            description="Provide a minimum of 2 and up to 5 trade references for verification."
            action={
              <Button
                variant="outline"
                onClick={addReference}
                disabled={references.length >= 5}
                className={CREDIT_FORM_OUTLINE_BTN_CLASS}
              >
                <Plus className="size-4" />
                Add Reference
              </Button>
            }
          />
          <div className="space-y-4 p-6">
            {references.map((reference, index) => (
              <div key={`trade-reference-${index}`} className={CREDIT_FORM_NESTED_CARD_CLASS}>
                <Typography variant="h4" className="mb-4 text-base font-semibold text-[#18181B]">
                  Reference # {String(index + 1).padStart(2, '0')}
                </Typography>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <CreditFormField
                    label="Company Name"
                    required
                    error={tradeReferenceErrors[index]?.companyName}
                  >
                    <Input
                      value={reference.companyName}
                      onChange={(event) =>
                        updateReferenceField(index, 'companyName', event.target.value)
                      }
                      placeholder="e.g. ABC Logistics Ltd"
                      className="h-11 border-[#E5E7EB] bg-white"
                    />
                  </CreditFormField>
                  <CreditFormField
                    label="Contact Person"
                    required
                    error={tradeReferenceErrors[index]?.contactPerson}
                  >
                    <Input
                      value={reference.contactPerson}
                      onChange={(event) =>
                        updateReferenceField(index, 'contactPerson', event.target.value)
                      }
                      placeholder="e.g. John Smith"
                      className="h-11 border-[#E5E7EB] bg-white"
                    />
                  </CreditFormField>
                  <CreditFormField
                    label="Contact Phone"
                    required
                    error={tradeReferenceErrors[index]?.contactPhone}
                  >
                    <div className="flex h-11 w-full items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3 py-2 focus-within:border-[#C63131] focus-within:ring-2 focus-within:ring-[#CA0000]/15">
                      <PhoneInput
                        international
                        countryCallingCodeEditable
                        defaultCountry="GB"
                        country={reference.contactPhoneCountry}
                        value={reference.contactPhone || undefined}
                        onChange={(value) =>
                          updateReferenceField(index, 'contactPhone', String(value ?? ''))
                        }
                        onCountryChange={(country) =>
                          updateReferenceField(index, 'contactPhoneCountry', country ?? 'GB')
                        }
                        placeholder="e.g. 07700 900123 or +1 202 555 0123"
                        className="flex min-w-0 flex-1 items-center border-0 bg-transparent p-0"
                        numberInputProps={{
                          className:
                            'flex-1 min-w-0 border-0 bg-transparent p-0 text-sm text-gray-900 placeholder:text-[#A1A1AA] focus:outline-none focus:ring-0',
                        }}
                      />
                    </div>
                  </CreditFormField>
                  <CreditFormField
                    label="Contact Email"
                    required
                    error={tradeReferenceErrors[index]?.contactEmail}
                  >
                    <Input
                      value={reference.contactEmail}
                      onChange={(event) =>
                        updateReferenceField(index, 'contactEmail', event.target.value)
                      }
                      placeholder="e.g. john@company.com"
                      className="h-11 border-[#E5E7EB] bg-white"
                    />
                  </CreditFormField>
                  <CreditFormField label="Account Number / Reference">
                    <Input
                      value={reference.accountNumber}
                      onChange={(event) =>
                        updateReferenceField(index, 'accountNumber', event.target.value)
                      }
                      placeholder="e.g. ACC-10234"
                      className="h-11 border-[#E5E7EB] bg-white"
                    />
                  </CreditFormField>
                  <CreditFormField
                    label="Credit Limit with Reference"
                    error={tradeReferenceErrors[index]?.creditLimit}
                  >
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={reference.creditLimit}
                      onChange={(event) =>
                        updateReferenceField(
                          index,
                          'creditLimit',
                          sanitizeDecimalInput(event.target.value)
                        )
                      }
                      placeholder="e.g. 10000.00"
                      className="h-11 border-[#E5E7EB] bg-white"
                    />
                  </CreditFormField>
                  <CreditFormField
                    label="Relationship Duration"
                    required
                    error={tradeReferenceErrors[index]?.relationshipDuration}
                  >
                    <Select
                      value={reference.relationshipDuration}
                      onValueChange={(value) =>
                        updateReferenceField(index, 'relationshipDuration', value)
                      }
                    >
                      <SelectTrigger className="h-11 border-[#E5E7EB] bg-white text-gray-900">
                        <SelectValue placeholder="Select relationship duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIP_DURATION_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CreditFormField>
                </div>
              </div>
            ))}
          </div>
        </CreditFormStepPanel>
      ) : currentStep === 2 ? (
        <CreditFormStepPanel>
          <CreditFormStepHeader
            title="Bank Reference"
            description="Provide details of the client's primary bank for verification."
          />
          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
            <CreditFormField label="Bank Name" required error={bankReferenceErrors.bankName}>
              <Input
                value={bankReferenceForm.bankName}
                onChange={(event) => updateBankReferenceField('bankName', event.target.value)}
                placeholder="e.g. Barclays Bank"
                className="h-11 border-[#E5E7EB] bg-white"
              />
            </CreditFormField>
            <CreditFormField label="Sort Code" required error={bankReferenceErrors.sortCode}>
              <Input
                type="text"
                inputMode="numeric"
                value={bankReferenceForm.sortCode}
                onChange={(event) =>
                  updateBankReferenceField('sortCode', sanitizeSortCodeInput(event.target.value))
                }
                placeholder="e.g. 123456"
                className="h-11 border-[#E5E7EB] bg-white"
                maxLength={6}
              />
            </CreditFormField>
            <CreditFormField
              label="Account Number (Last 4 digits only)"
              required
              error={bankReferenceErrors.accountNumberLast4}
            >
              <Input
                type="text"
                inputMode="numeric"
                value={bankReferenceForm.accountNumberLast4}
                onChange={(event) =>
                  updateBankReferenceField(
                    'accountNumberLast4',
                    sanitizeAccountLast4Input(event.target.value)
                  )
                }
                placeholder="e.g. 1234"
                className="h-11 border-[#E5E7EB] bg-white"
                maxLength={4}
              />
            </CreditFormField>
            <CreditFormField label="Account Type" required error={bankReferenceErrors.accountType}>
              <Select
                value={bankReferenceForm.accountType}
                onValueChange={(value) => updateBankReferenceField('accountType', value)}
              >
                <SelectTrigger className="h-11 border-[#E5E7EB] bg-white text-gray-900">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUSINESS_CURRENT">Business Current</SelectItem>
                  <SelectItem value="BUSINESS_SAVINGS">Business Savings</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </CreditFormField>

            <div className="md:col-span-2">
              <CreditFormField label="Upload Bank Reference Letter">
                <div className="flex items-center justify-between rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-[#E5F2FF] p-2">
                      <Upload className="size-4 text-[#1D70B8]" />
                    </div>
                    <div>
                      <Typography
                        variant="body"
                        color="text"
                        className="text-sm font-medium text-gray-900"
                      >
                        {bankReferenceForm.referenceLetterName || 'File Upload'}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="muted"
                        className="text-xs text-[#71717A]"
                      >
                        Max 10 MB file size - Accepted formats: PNG, JPG, PDF
                      </Typography>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => bankReferenceFileInputRef.current?.click()}
                  >
                    <Upload className="size-4" />
                    Upload
                  </Button>
                  <input
                    ref={bankReferenceFileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      setBankReferenceLetterFile(file ?? null);
                      updateBankReferenceField('referenceLetterName', file?.name ?? '');
                    }}
                  />
                </div>
              </CreditFormField>
            </div>
          </div>
        </CreditFormStepPanel>
      ) : currentStep === 3 ? (
        <CreditFormStepPanel>
          <CreditFormStepHeader
            title="Requested Credit Terms"
            description="Specify the requested credit limit, payment terms, and expected usage."
          />
          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
            <CreditFormField
              label="Requested Credit Limit"
              required
              error={requestedTermsErrors.requestedCreditLimit}
            >
              <Input
                type="text"
                inputMode="decimal"
                value={requestedTermsForm.requestedCreditLimit}
                onChange={(event) =>
                  updateRequestedTermsField(
                    'requestedCreditLimit',
                    sanitizeDecimalInput(event.target.value)
                  )
                }
                placeholder="e.g. 25000.00"
                className="h-11 border-[#E5E7EB] bg-white"
              />
            </CreditFormField>
            <CreditFormField
              label="Requested Payment Terms"
              required
              error={requestedTermsErrors.requestedPaymentTermsDays}
            >
              <Select
                value={requestedTermsForm.requestedPaymentTermsDays}
                onValueChange={(value) =>
                  updateRequestedTermsField('requestedPaymentTermsDays', value)
                }
              >
                <SelectTrigger className="h-11 border-[#E5E7EB] bg-white text-gray-900">
                  <SelectValue placeholder="Select payment terms" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TERMS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CreditFormField>
            <CreditFormField
              label="Expected Monthly Spend"
              required
              error={requestedTermsErrors.expectedMonthlySpend}
            >
              <Input
                type="text"
                inputMode="decimal"
                value={requestedTermsForm.expectedMonthlySpend}
                onChange={(event) =>
                  updateRequestedTermsField(
                    'expectedMonthlySpend',
                    sanitizeDecimalInput(event.target.value)
                  )
                }
                placeholder="e.g. 5000.00"
                className="h-11 border-[#E5E7EB] bg-white"
              />
            </CreditFormField>
            <CreditFormField label="Seasonal Peaks">
              <Select
                value=""
                onValueChange={(value) => {
                  if (requestedTermsForm.seasonalPeaks.includes(value)) return;
                  if (requestedTermsForm.seasonalPeaks.length >= 12) return;
                  updateRequestedTermsField('seasonalPeaks', [
                    ...requestedTermsForm.seasonalPeaks,
                    value,
                  ]);
                }}
              >
                <SelectTrigger className="h-11 border-[#E5E7EB] bg-white text-gray-900">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {SEASONAL_MONTH_OPTIONS.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {requestedTermsForm.seasonalPeaks.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {requestedTermsForm.seasonalPeaks.map((month) => (
                    <button
                      key={month}
                      type="button"
                      onClick={() =>
                        updateRequestedTermsField(
                          'seasonalPeaks',
                          requestedTermsForm.seasonalPeaks.filter((item) => item !== month)
                        )
                      }
                      className="rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-3 py-1 text-xs text-[#3F3F46]"
                    >
                      {month} ×
                    </button>
                  ))}
                </div>
              ) : null}
            </CreditFormField>
            <div className="md:col-span-2">
              <CreditFormField label="Justification / Notes">
                <textarea
                  value={requestedTermsForm.justification}
                  onChange={(event) =>
                    updateRequestedTermsField('justification', event.target.value.slice(0, 2000))
                  }
                  placeholder="Provide any additional context supporting the credit request..."
                  className="min-h-[120px] w-full rounded-md border border-[#E5E7EB] bg-white p-3 text-sm text-[#18181B] outline-none focus:border-[#C63131]"
                />
                <Typography variant="caption" color="muted" className="text-xs text-[#71717A]">
                  {requestedTermsForm.justification.length} / 2000 Max characters
                </Typography>
              </CreditFormField>
            </div>
          </div>
        </CreditFormStepPanel>
      ) : (
        <CreditFormStepPanel>
          <CreditFormStepHeader
            title="Declarations & Consent"
            description="The application cannot be submitted without accepting all required declarations."
          />
          <div className="space-y-5 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <CreditFormField
                label="Director / Authorised Signatory Name"
                required
                error={declarationsErrors.signatoryName}
              >
                <Input
                  value={declarationsForm.signatoryName}
                  onChange={(event) => updateDeclarationsField('signatoryName', event.target.value)}
                  placeholder="e.g. Michael Brown"
                  className="h-11 border-[#E5E7EB] bg-white"
                />
              </CreditFormField>
              <CreditFormField
                label="Position / Title"
                required
                error={declarationsErrors.positionTitle}
              >
                <Input
                  value={declarationsForm.positionTitle}
                  onChange={(event) => updateDeclarationsField('positionTitle', event.target.value)}
                  placeholder="e.g. Finance Director"
                  className="h-11 border-[#E5E7EB] bg-white"
                />
              </CreditFormField>
            </div>

            <CreditFormField label="Declaration Date">
              <Input
                value={new Date().toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                readOnly
                className="h-11 border-[#E5E7EB] bg-[#FAFAFA] text-[#71717A]"
              />
            </CreditFormField>

            <div className="space-y-6 pt-2">
              <div>
                <div className="flex items-start gap-2">
                  <Checkbox
                    checked={declarationsForm.consentCreditCheck}
                    onChange={(event) =>
                      updateDeclarationsField('consentCreditCheck', event.target.checked)
                    }
                  />
                  <div>
                    <Typography
                      variant="label"
                      color="text"
                      className="text-base font-medium text-[#18181B]"
                    >
                      Consent: Credit Check <span className="text-[#EF4444]">*</span>
                    </Typography>
                    <Typography variant="body" color="muted" className="text-sm text-[#71717A]">
                      I authorise SW Couriers to conduct credit checks and verify the information
                      provided.
                    </Typography>
                  </div>
                </div>
                {declarationsErrors.consentCreditCheck ? (
                  <Typography variant="caption" color="error" className="mt-1 block text-xs">
                    {declarationsErrors.consentCreditCheck}
                  </Typography>
                ) : null}
              </div>

              <div>
                <div className="flex items-start gap-2">
                  <Checkbox
                    checked={declarationsForm.consentTerms}
                    onChange={(event) =>
                      updateDeclarationsField('consentTerms', event.target.checked)
                    }
                  />
                  <div>
                    <Typography
                      variant="label"
                      color="text"
                      className="text-base font-medium text-[#18181B]"
                    >
                      Consent: Terms &amp; Conditions <span className="text-[#EF4444]">*</span>
                    </Typography>
                    <Typography variant="body" color="muted" className="text-sm text-[#71717A]">
                      I have read and agree to the SW Couriers Credit Terms and Conditions.
                    </Typography>
                  </div>
                </div>
                {declarationsErrors.consentTerms ? (
                  <Typography variant="caption" color="error" className="mt-1 block text-xs">
                    {declarationsErrors.consentTerms}
                  </Typography>
                ) : null}
              </div>

              <div>
                <div className="flex items-start gap-2">
                  <Checkbox
                    checked={declarationsForm.consentDataProcessing}
                    onChange={(event) =>
                      updateDeclarationsField('consentDataProcessing', event.target.checked)
                    }
                  />
                  <div>
                    <Typography
                      variant="label"
                      color="text"
                      className="text-base font-medium text-[#18181B]"
                    >
                      Consent: Data Processing <span className="text-[#EF4444]">*</span>
                    </Typography>
                    <Typography variant="body" color="muted" className="text-sm text-[#71717A]">
                      I consent to SW Couriers processing the above data for the purpose of credit
                      assessment.
                    </Typography>
                  </div>
                </div>
                {declarationsErrors.consentDataProcessing ? (
                  <Typography variant="caption" color="error" className="mt-1 block text-xs">
                    {declarationsErrors.consentDataProcessing}
                  </Typography>
                ) : null}
              </div>
            </div>
          </div>
        </CreditFormStepPanel>
      )}

      <Dialog open={creditAccountExistsDialogOpen} onOpenChange={setCreditAccountExistsDialogOpen}>
        <DialogContent className={CREDIT_ACCOUNT_EXISTS_MODAL_WRAPPER} hideCloseButton>
          <div className={CREDIT_ACCOUNT_EXISTS_MODAL_BODY}>
            <DialogTitle className={CREDIT_ACCOUNT_EXISTS_MODAL_TITLE}>
              Credit account already exists
            </DialogTitle>
            <DialogDescription className={CREDIT_ACCOUNT_EXISTS_MODAL_DESCRIPTION}>
              You already have an active credit account/application. New credit applications cannot
              be submitted.
            </DialogDescription>
          </div>

          <div className={CREDIT_ACCOUNT_EXISTS_MODAL_FOOTER}>
            <div className={CREDIT_ACCOUNT_EXISTS_MODAL_FOOTER_ROW}>
              <Button
                type="button"
                variant="outline"
                className={CREDIT_ACCOUNT_EXISTS_MODAL_CLOSE_BTN}
                onClick={() => setCreditAccountExistsDialogOpen(false)}
              >
                Close
              </Button>
              <Button
                type="button"
                className={CREDIT_ACCOUNT_EXISTS_MODAL_PRIMARY_BTN}
                onClick={() => {
                  setCreditAccountExistsDialogOpen(false);
                  void navigate('/credit-request');
                }}
              >
                Go to Credit Overview
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </CreditApplicationFormShell>
  );
}

function parseOrganizationIdFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;
    const normalized = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4);
    const payloadText = decodeURIComponent(
      atob(padded)
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );
    const payload = JSON.parse(payloadText) as
      | { organization_id?: unknown; org_id?: unknown }
      | undefined;
    const raw = payload?.organization_id ?? payload?.org_id;
    return typeof raw === 'string' && raw.length > 0 ? raw : null;
  } catch {
    return null;
  }
}
