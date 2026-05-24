import * as React from 'react';
import { Calendar, ChevronDown, Copy, FileText, User } from 'lucide-react';
import { toast } from 'sonner';
import HeaderBreadcrumb from '@/components/atoms/HeaderBreadcrumb';
import { Avatar, AvatarFallback } from '@/components/atoms/avatar';
import { Badge } from '@/components/atoms/badge';
import Typography from '@/components/atoms/Typography';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/atoms/collapsible';
import { CreditApplicationWalletIcon, DeleteDraftApplicationIcon } from '@/assets/svg';
import type {
  CreditApplicationDetail,
  CreditTradeReferenceDetail,
} from '@/store/api/creditApplicationsApi';
import {
  applicationHistoryStatusBadgeClass,
  applicationHistoryStatusDotClass,
  formatApplicationHistoryStatus,
  formatBankAccountType,
  formatCreditDetailDate,
  formatCreditEnumLabel,
  formatMoneyField,
  formatPaymentTermsLabel,
  formatPersonName,
  formatRelationshipDuration,
  formatSeasonalPeaks,
  formatVerificationStatus,
  getApplicationDisplayId,
  getRejectionDisplay,
  overviewDateMedium,
  sortTradeReferences,
} from '@/lib/creditApplicationDetail';
import {
  CREDIT_APP_DETAIL_CARD_CLASS,
  CREDIT_APP_DETAIL_GRID_LABEL_CLASS,
  CREDIT_APP_DETAIL_GRID_VALUE_CLASS,
  CREDIT_APP_DETAIL_LIMIT_HEADER_CLASS,
  CREDIT_APP_DETAIL_PAGE_CLASS,
  CREDIT_APP_DETAIL_REJECT_BOX_CLASS,
  CREDIT_APP_DETAIL_ROW_CLASS,
  CREDIT_APP_DETAIL_ROW_LABEL_CLASS,
  CREDIT_APP_DETAIL_ROW_VALUE_CLASS,
  CREDIT_APP_DETAIL_SECTION_BODY_CLASS,
  CREDIT_APP_DETAIL_SECTION_HEADER_CLASS,
  CREDIT_APP_DETAIL_SECTION_TITLE_CLASS,
} from '@/lib/creditApplicationDetailUi';
import { cn } from '@/lib/utils';

interface CreditApplicationDetailViewProps {
  application: CreditApplicationDetail;
}

function personInitials(
  person: { first_name?: string | null; last_name?: string | null } | null | undefined
): string {
  const first = person?.first_name?.trim()?.[0] ?? '';
  const last = person?.last_name?.trim()?.[0] ?? '';
  return `${first}${last}`.toUpperCase() || '?';
}

function CopyApplicationIdButton({
  applicationNumber,
}: {
  applicationNumber: string;
}): React.JSX.Element {
  const handleCopy = (): void => {
    void navigator.clipboard.writeText(applicationNumber);
    toast.success('Application ID copied');
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center text-[#71717A] hover:text-[#18181B]"
      aria-label="Copy application ID"
    >
      <Copy className="size-3.5" />
    </button>
  );
}

function GridDetailField({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <span className={CREDIT_APP_DETAIL_GRID_LABEL_CLASS}>{label}</span>
      <span className={CREDIT_APP_DETAIL_GRID_VALUE_CLASS}>{value}</span>
    </div>
  );
}

function DetailSplitRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className={CREDIT_APP_DETAIL_ROW_CLASS}>
      <div className={CREDIT_APP_DETAIL_ROW_LABEL_CLASS}>
        <Icon className="size-4 shrink-0 text-[#A1A1AA]" aria-hidden />
        <span>{label}</span>
      </div>
      <div className={CREDIT_APP_DETAIL_ROW_VALUE_CLASS}>{value}</div>
    </div>
  );
}

function DetailSectionCard({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}): React.JSX.Element {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={CREDIT_APP_DETAIL_CARD_CLASS}>
      <CollapsibleTrigger className={CREDIT_APP_DETAIL_SECTION_HEADER_CLASS}>
        <span className={CREDIT_APP_DETAIL_SECTION_TITLE_CLASS}>{title}</span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-[#71717A] transition-transform',
            open && 'rotate-180'
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className={CREDIT_APP_DETAIL_SECTION_BODY_CLASS}>
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function TradeReferencePanel({
  reference,
  index,
  defaultOpen,
}: {
  reference: CreditTradeReferenceDetail;
  index: number;
  defaultOpen: boolean;
}): React.JSX.Element {
  const [open, setOpen] = React.useState(defaultOpen);
  const verification = formatVerificationStatus(reference.verification_status);
  const email = reference.contact_email?.trim();

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="overflow-hidden rounded-[8px] border border-[#E5E7EB] bg-white"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left hover:bg-[#FAFAFA]">
        <Typography className="text-xs font-semibold uppercase tracking-wide text-[#52525B]">
          Reference # {String(index + 1).padStart(2, '0')}
        </Typography>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-[#71717A] transition-transform',
            open && 'rotate-180'
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t border-[#F1F5F9] px-5 py-5">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <GridDetailField label="Company Name" value={reference.company_name ?? '—'} />
          <GridDetailField label="Contact Person" value={reference.contact_person ?? '—'} />
          <GridDetailField label="Contact Phone" value={reference.contact_phone ?? '—'} />
          <GridDetailField
            label="Relationship Duration"
            value={formatRelationshipDuration(reference.relationship_duration)}
          />
          <GridDetailField
            label="Account Number / reference"
            value={reference.account_number_reference ?? '—'}
          />
          <GridDetailField
            label="Credit Limit with Reference"
            value={formatMoneyField(reference.credit_limit_with_reference)}
          />
          <GridDetailField
            label="Status"
            value={
              <Badge
                className={cn(
                  'inline-flex items-center gap-1.5 border font-semibold',
                  verification.className
                )}
              >
                {verification.dotClass ? (
                  <span
                    className={cn('size-1.5 shrink-0 rounded-full', verification.dotClass)}
                    aria-hidden
                  />
                ) : null}
                {verification.label}
              </Badge>
            }
          />
          <GridDetailField
            label="Contact Email"
            value={
              email ? (
                <a href={`mailto:${email}`} className="text-[#2563EB] hover:underline">
                  {email}
                </a>
              ) : (
                '—'
              )
            }
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function CreditApplicationDetailView({
  application,
}: CreditApplicationDetailViewProps): React.JSX.Element {
  const statusKey = (application.status ?? '').toUpperCase();
  const statusLabel = formatApplicationHistoryStatus(statusKey);
  const rejection = getRejectionDisplay(application);
  const requestedLimit = formatMoneyField(application.requested_credit_limit);
  const tradeReferences = sortTradeReferences(application.trade_references);
  const bank = application.bank_reference;
  const letterUrl = bank?.reference_letter?.url;
  const letterName = bank?.reference_letter?.filename ?? 'contract.pdf';
  const applicationNumber = application.application_number ?? '—';

  return (
    <div className={CREDIT_APP_DETAIL_PAGE_CLASS}>
      <HeaderBreadcrumb
        className="mb-4"
        items={[
          { label: 'Credit management', to: '/credit-request' },
          { label: 'Overview', to: '/credit-request' },
        ]}
      />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Typography className="text-2xl font-semibold leading-8 text-[#18181B]">
            Credit Application Details
          </Typography>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-[#71717A]">
            <span>{getApplicationDisplayId(application)}</span>
            {application.application_number ? (
              <CopyApplicationIdButton applicationNumber={application.application_number} />
            ) : null}
          </div>
        </div>
        <Badge
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
            applicationHistoryStatusBadgeClass(statusKey)
          )}
        >
          <span
            className={cn(
              'size-1.5 shrink-0 rounded-full',
              applicationHistoryStatusDotClass(statusKey)
            )}
            aria-hidden
          />
          {statusLabel}
        </Badge>
      </div>

      {rejection ? (
        <div className={cn(CREDIT_APP_DETAIL_REJECT_BOX_CLASS, 'mb-6')}>
          <img
            src={DeleteDraftApplicationIcon}
            alt=""
            className="mx-auto h-[100px] w-[109px] shrink-0 object-contain sm:mx-0"
            width={109}
            height={100}
          />
          <div className="min-w-0 flex-1">
            <Typography className="text-base font-semibold text-[#B91C1C]">
              Credit Application Rejected
            </Typography>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-[#991B1B] marker:text-[#EF4444]">
              <li>{rejection.reason}</li>
              <li>Rejected on: {rejection.rejectedOn}</li>
            </ul>
          </div>
        </div>
      ) : null}

      <div className={cn(CREDIT_APP_DETAIL_CARD_CLASS, 'mb-6')}>
        <div className={CREDIT_APP_DETAIL_SECTION_HEADER_CLASS}>
          <span className={CREDIT_APP_DETAIL_SECTION_TITLE_CLASS}>Credit Application Details</span>
        </div>

        <div className={CREDIT_APP_DETAIL_LIMIT_HEADER_CLASS}>
          <div className="min-w-0">
            <Typography className="text-sm font-medium text-[#52525B]">
              Requested Credit Limit
            </Typography>
            <Typography className="mt-1 text-[40px] font-bold leading-none tracking-tight text-[#18181B]">
              {requestedLimit}
            </Typography>
          </div>
          <img
            src={CreditApplicationWalletIcon}
            alt=""
            className="mx-auto h-[150px] w-auto max-w-[255px] shrink-0 object-contain sm:mx-0 sm:h-[182px]"
            width={255}
            height={182}
          />
        </div>

        <div className="border-t border-[#E5E7EB] bg-white">
          <DetailSplitRow
            icon={FileText}
            label="Application ID"
            value={
              <span className="inline-flex items-center justify-end gap-1.5">
                {applicationNumber}
                {application.application_number ? (
                  <CopyApplicationIdButton applicationNumber={application.application_number} />
                ) : null}
              </span>
            }
          />
          <DetailSplitRow
            icon={User}
            label="Submitted by"
            value={
              <span className="inline-flex items-center justify-end gap-2">
                <Avatar className="size-7 border border-[#E4E4E7]">
                  <AvatarFallback className="bg-[#F4F4F5] text-[10px] font-semibold text-[#52525B]">
                    {personInitials(application.submitted_by)}
                  </AvatarFallback>
                </Avatar>
                {formatPersonName(application.submitted_by)}
              </span>
            }
          />
          <DetailSplitRow
            icon={Calendar}
            label="Application Date"
            value={
              overviewDateMedium(application.submitted_at) ??
              formatCreditDetailDate(application.created_at)
            }
          />
          <DetailSplitRow
            icon={Calendar}
            label="Requested Terms"
            value={formatPaymentTermsLabel(application.requested_payment_terms_days)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <DetailSectionCard title="Company Financial Information">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            <GridDetailField
              label="Company Registration Number"
              value={application.company_registration_number ?? '—'}
            />
            <GridDetailField
              label="VAT Registration Number"
              value={application.vat_registration_number ?? '—'}
            />
            <GridDetailField
              label="Date of Incorporation"
              value={formatCreditDetailDate(application.date_of_incorporation)}
            />
            <GridDetailField
              label="Years Trading"
              value={application.years_trading != null ? String(application.years_trading) : '—'}
            />
            <GridDetailField
              label="Net Profit (Last Financial Year)"
              value={formatMoneyField(application.net_profit)}
            />
            <GridDetailField label="Industry" value={formatCreditEnumLabel(application.industry)} />
            <GridDetailField
              label="Number of Employees"
              value={application.number_of_employees ?? '—'}
            />
            <GridDetailField
              label="Annual Turnover"
              value={formatMoneyField(application.annual_turnover)}
            />
          </div>
        </DetailSectionCard>

        <TradeReferencesSection references={tradeReferences} />

        <DetailSectionCard title="Bank Reference">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <GridDetailField label="Bank Name" value={bank?.bank_name ?? '—'} />
            <GridDetailField label="Sort Code" value={bank?.bank_sort_code ?? '—'} />
            <GridDetailField
              label="Account Type"
              value={formatBankAccountType(bank?.bank_account_type)}
            />
            <GridDetailField
              label="Bank Reference Letter"
              value={
                letterUrl ? (
                  <a
                    href={letterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2563EB] hover:underline"
                  >
                    {letterName}
                  </a>
                ) : (
                  '—'
                )
              }
            />
            <GridDetailField
              label="Account Number (Last 4 digits)"
              value={bank?.bank_account_number_last4 ?? '—'}
            />
          </div>
        </DetailSectionCard>

        <DetailSectionCard title="Requested Credit Terms">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            <GridDetailField
              label="Requested Credit Limit"
              value={formatMoneyField(application.requested_credit_limit)}
            />
            <GridDetailField
              label="Requested Payment Terms"
              value={formatPaymentTermsLabel(application.requested_payment_terms_days)}
            />
            <GridDetailField
              label="Expected Monthly Spend"
              value={formatMoneyField(application.expected_monthly_spend)}
            />
            <GridDetailField
              label="Seasonal Peaks"
              value={formatSeasonalPeaks(application.seasonal_peaks)}
            />
          </div>
          <div className="mt-5 border-t border-[#F1F5F9] pt-5">
            <GridDetailField
              label="Justification / Notes"
              value={
                <span className="block whitespace-pre-wrap text-sm font-normal leading-6 text-[#3F3F46]">
                  {application.justification?.trim() || '—'}
                </span>
              }
            />
          </div>
        </DetailSectionCard>

        <DetailSectionCard title="Declarations & Consent">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <GridDetailField
              label="Authorised Signatory Name"
              value={application.director_signatory_name ?? '—'}
            />
            <GridDetailField
              label="Position / Title"
              value={application.director_signatory_position ?? '—'}
            />
            <GridDetailField
              label="Declaration Date"
              value={formatCreditDetailDate(application.declaration_date)}
            />
          </div>
        </DetailSectionCard>
      </div>
    </div>
  );
}

function TradeReferencesSection({
  references,
}: {
  references: CreditTradeReferenceDetail[];
}): React.JSX.Element {
  const [open, setOpen] = React.useState(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={CREDIT_APP_DETAIL_CARD_CLASS}>
      <CollapsibleTrigger className={CREDIT_APP_DETAIL_SECTION_HEADER_CLASS}>
        <span className={CREDIT_APP_DETAIL_SECTION_TITLE_CLASS}>Trade References</span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-[#71717A] transition-transform',
            open && 'rotate-180'
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 px-5 py-5">
        {references.length === 0 ? (
          <Typography className="text-center text-sm text-[#71717A]">
            No trade references provided.
          </Typography>
        ) : (
          references.map((ref, index) => (
            <TradeReferencePanel
              key={ref.id}
              reference={ref}
              index={ref.ref_index ?? index}
              defaultOpen={index === 0}
            />
          ))
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
