import * as React from 'react';
import { format } from 'date-fns';
import { Copy, ExternalLink } from 'lucide-react';
import { Typography } from '@/components/atoms';
import { Avatar, AvatarFallback } from '@/components/atoms/avatar';
import { cn } from '@/lib/utils';

const TEAM_AVATAR_VISIBLE = 6;

export interface AccountOverviewTeamMember {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
}

export interface AccountOverviewCardProps {
  tradingName: string;
  legalEntityName: string;
  reference: string | null;
  industry: string | null;
  companySize: string | null;
  companiesHouseNumber: string | null;
  dateOfIncorporation: string | null;
  logoUrl?: string | null;
  teamMembers: AccountOverviewTeamMember[];
  className?: string;
}

function formatIncorporationDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return format(date, 'd MMMM yyyy');
}

function companiesHouseUrl(number: string): string {
  const normalized = number.replace(/\s/g, '');
  return `https://find-and-update.company-information.service.gov.uk/company/${encodeURIComponent(normalized)}`;
}

function AccountOverviewField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-form-subtitle">{label}</span>
      <div className="text-base font-medium text-form-title">{children}</div>
    </div>
  );
}

export function AccountOverviewCard({
  tradingName,
  legalEntityName,
  reference,
  industry,
  companySize,
  companiesHouseNumber,
  dateOfIncorporation,
  logoUrl,
  teamMembers,
  className,
}: AccountOverviewCardProps): React.JSX.Element {
  const handleCopyReference = (): void => {
    if (!reference) return;
    void navigator.clipboard.writeText(reference).catch(() => undefined);
  };

  const visibleMembers = teamMembers.slice(0, TEAM_AVATAR_VISIBLE);
  const overflowCount = Math.max(0, teamMembers.length - TEAM_AVATAR_VISIBLE);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex h-7 items-center justify-between gap-3 my-3">
        <Typography component="div" className="text-xl font-semibold leading-5 text-form-title">
          Account Overview
        </Typography>
        <span className="inline-flex h-[22px] shrink-0 items-center gap-1.5 rounded-full bg-[rgba(16,185,129,0.1)] px-2.5 py-0.5 text-xs font-semibold text-[#10B981]">
          <span className="h-[9px] w-[9px] rounded-full bg-[#10B981]" aria-hidden />
          Active
        </span>
      </div>

      <div className="h-px w-full bg-[#F1F5F9]" />

      <div className="flex items-start gap-4">
        <div className="relative flex h-[58px] w-[58px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#181818]">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg font-semibold text-white">
              {(tradingName.at(0) ?? 'A').toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <Typography
            component="div"
            className="truncate text-xl font-semibold leading-5 text-form-title"
          >
            {tradingName}
          </Typography>
          <Typography component="div" className="mt-2 truncate text-sm leading-5 text-form-body">
            {legalEntityName}
          </Typography>
          {reference ? (
            <div className="mt-2 flex items-center gap-2.5">
              <span className="truncate text-sm font-medium text-form-subtitle">{reference}</span>
              <button
                type="button"
                onClick={handleCopyReference}
                className="shrink-0 text-form-subtitle transition-colors hover:text-form-title"
                aria-label="Copy organization reference"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-[22px]">
        <AccountOverviewField label="Industry">{industry ?? '—'}</AccountOverviewField>
        <AccountOverviewField label="Company Size">{companySize ?? '—'}</AccountOverviewField>
        <AccountOverviewField label="Companies House No.">
          {companiesHouseNumber ? (
            <a
              href={companiesHouseUrl(companiesHouseNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 underline decoration-solid underline-offset-2"
            >
              {companiesHouseNumber}
              <ExternalLink className="h-4 w-4 shrink-0 text-form-subtitle" aria-hidden />
            </a>
          ) : (
            '—'
          )}
        </AccountOverviewField>
        <AccountOverviewField label="Date of Incorporation">
          {formatIncorporationDate(dateOfIncorporation)}
        </AccountOverviewField>
        <AccountOverviewField label="Team Members">
          {teamMembers.length === 0 ? (
            '—'
          ) : (
            <div className="flex items-center pl-0.5">
              {visibleMembers.map((member, index) => {
                const initials = `${member.first_name?.at(0) ?? ''}${member.last_name?.at(0) ?? ''}`;
                return (
                  <Avatar
                    key={member.id}
                    className={cn('h-6 w-6 border-[1.2px] border-white', index > 0 && '-ml-[5px]')}
                  >
                    <AvatarFallback className="rounded-full bg-[#E4E4E7] text-[10px] font-medium text-form-subtitle">
                      {initials.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                );
              })}
              {overflowCount > 0 ? (
                <div
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.2px] border-white bg-[#E3E3E3] text-[10px] font-medium text-form-subtitle',
                    visibleMembers.length > 0 && '-ml-[5px]'
                  )}
                >
                  +{overflowCount}
                </div>
              ) : null}
            </div>
          )}
        </AccountOverviewField>
      </div>
    </div>
  );
}
