import { Suspense, useMemo, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Check, Save, X } from 'lucide-react';
import { skipToken } from '@reduxjs/toolkit/query';
import { PageHeader, Typography } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';
import { Tabs, TabsList, TabsTrigger } from '@/components/molecules/tabs';
import { LoadingScreen } from '@/components/organisms';
import { cn } from '@/lib/utils';
import { SETTINGS_CONTENT_PANEL_CLASS } from '@/lib/settingsUi';
import { useAppSelector } from '@/store/hooks';
import { useGetOrganizationProfileCompletionQuery } from '@/store/api/organizationProfileApi';
import type { RootState } from '@/store/store';
import type {
  SettingsOutletContext,
  SettingsSubheaderActions,
} from '@/components/templates/settingsOutletTypes';

const SETTINGS_TABS = [
  { value: 'company-details', label: 'General Settings', path: '/settings/company-details' },
  { value: 'user-contacts', label: 'User & Contacts', path: '/settings/user-contacts' },
  { value: 'accounts-details', label: 'Payment Settings', path: '/settings/accounts-details' },
  { value: 'security', label: 'Security', path: '/settings/security' },
] as const;

function getActiveTabValue(pathname: string): string {
  const segment = pathname.replace(/^\/settings\/?/, '') || 'company-details';
  const valid = SETTINGS_TABS.some((t) => t.value === segment);
  return valid ? segment : 'company-details';
}

function CircularProgress({ percent }: { percent: number }): React.JSX.Element {
  const size = 120;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-white"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-300"
        />
      </svg>
      <span className="absolute text-xl font-bold text-gray-900">{percent}%</span>
    </div>
  );
}

/**
 * Settings layout: page header, tabs (URL-synced), main content (outlet), profile sidebar.
 */
export default function SettingsLayout(): React.JSX.Element {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeValue = getActiveTabValue(pathname);
  const organizationId = useAppSelector(
    (state: RootState) =>
      state.auth.user?.organization_id ??
      state.auth.loginResponse?.data?.organization_id ??
      state.auth.loginResponse?.data?.organization?.id ??
      null
  );
  const accessToken = useAppSelector((state: RootState) => state.auth.accessToken);
  const { data: profileCompletionResponse } = useGetOrganizationProfileCompletionQuery(
    organizationId && accessToken ? { organizationId } : skipToken
  );
  const profileCompletion = profileCompletionResponse?.data;
  const completionPercent = profileCompletion?.percent_complete ?? 0;
  const profileItems = profileCompletion?.items ?? [];

  const [subheaderActions, setSubheaderActions] = useState<SettingsSubheaderActions | null>(null);
  const outletContext = useMemo<SettingsOutletContext>(
    () => ({ setSubheaderActions }),
    [setSubheaderActions]
  );

  const handleTabChange = (value: string): void => {
    void navigate(`/settings/${value}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />

      <Tabs value={activeValue} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full max-w-3xl grid-cols-4">
          {SETTINGS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {(activeValue === 'company-details' || activeValue === 'user-contacts') && (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <Typography variant="h4" weight="semibold" className="text-gray-900">
              {activeValue === 'company-details' ? 'General Settings' : 'User & Contacts Settings'}
            </Typography>
            <Typography variant="caption" color="muted" className="text-sm">
              {activeValue === 'company-details'
                ? 'Update legal, registration, and address details.'
                : 'Manage users from the client company and control their roles and access within the platform.'}
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!subheaderActions || subheaderActions.discardDisabled === true}
              onClick={() => subheaderActions?.onDiscard()}
            >
              Discard
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={!subheaderActions || subheaderActions.saveDisabled === true}
              onClick={() => void subheaderActions?.onSave()}
            >
              <Save className="h-4 w-4" />
              {subheaderActions?.isSaving === true ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <div className={SETTINGS_CONTENT_PANEL_CLASS}>
            <Suspense fallback={<LoadingScreen />}>
              <Outlet context={outletContext} />
            </Suspense>
          </div>
        </div>

        <aside
          className={cn(
            'mt-0 flex w-full shrink-0 flex-col gap-6 rounded-xl border border-gray-200 bg-gray-50 p-5 lg:w-120',
            activeValue !== 'company-details' && activeValue !== 'user-contacts' && 'lg:mt-0'
          )}
        >
          <Typography variant="h5" weight="semibold" align="center" className="text-gray-900">
            Complete Your Profile
          </Typography>

          <div className="flex justify-center">
            <CircularProgress percent={completionPercent} />
          </div>

          <ul className="flex flex-col gap-3">
            {profileItems.map((item) => (
              <li key={item.key} className="flex items-start gap-3 text-sm">
                {item.completed ? (
                  <Check className="h-5 w-5 shrink-0 text-green-600" aria-hidden />
                ) : (
                  <X className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
                )}
                <span className={cn('flex-1', item.completed ? 'text-gray-700' : 'text-gray-400')}>
                  {item.label}
                  <span
                    className={cn(
                      'ml-1',
                      item.completed ? 'text-gray-500' : 'font-medium text-green-600'
                    )}
                  >
                    — {item.completed ? `${item.weight}%` : `+${item.weight}%`}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
