import * as React from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, MapPinned, Plus, ReceiptText, RefreshCcw } from 'lucide-react';
import { PageHeader, Typography } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';
import { Card, CardContent } from '@/components/atoms/card';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { useGetOrgContactsQuery } from '@/store/api/contactsApi';
import { useGetInvoicesQuery } from '@/store/api/invoicesApi';
import { AccountOverviewCard } from '@/components/molecules/AccountOverviewCard';
import { BillingOverviewChart } from '@/components/molecules/BillingOverviewChart';
import { PaymentMethodOverviewCard } from '@/components/molecules/PaymentMethodOverviewCard';
import { PaymentMethodUtilizationPanel } from '@/components/molecules/PaymentMethodUtilizationPanel';
import { RecentOrdersPanel } from '@/components/molecules/RecentOrdersPanel';
import { TeamActivityNotificationsPanel } from '@/components/molecules/TeamActivityNotificationsPanel';
import DashboardMap from '@/components/molecules/DashboardMap';
import { mapMethodDistributionToUtilization } from '@/lib/paymentSettings';
import type { OrganizationPaymentMethodDto } from '@/store/api/homeDashboardApi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { aggregateHomeBillingOverviewRows } from '@/lib/billingOverviewChart';
import { useGetInboxNotificationsQuery } from '@/store/api/notificationsApi';
import {
  type OrdersSummaryPeriod,
  useGetAuditLogsQuery,
  useGetOrdersQuery,
  useGetOrdersSummaryQuery,
  useGetOrganizationByIdQuery,
  useGetOrganizationPaymentDetailsQuery,
} from '@/store/api';
import {
  type BillingOverviewPeriod,
  formatDelta,
  formatWholeNumber,
  getBillingDateRange,
  getBillingPeriodLabel,
  getHomeBillingKpisFromPaymentDetails,
  HOME_BILLING_PERIOD_OPTIONS,
  resolveHomeBillingInvoiceCount,
  HOME_PERIOD_OPTIONS,
  mapActivityFeedItems,
  mapNotifications,
  mapOrdersSummaryToCards,
  mapRecentOrders,
} from '@/lib/homeDashboard';
import { cn } from '@/lib/utils';

type HomeActivityTab = 'activity' | 'notifications';
const HOME_RECENT_ORDERS_LIMIT = 5;
const HOME_BILLING_INVOICES_FETCH_SIZE = 200;
const HOME_ACTIVITY_LIMIT = 6;
const HOME_NOTIFICATIONS_LIMIT = 6;
const SURFACE_CARD_CLASS = 'rounded-[12px] border border-[#E5E7EB] bg-white shadow-none';
const SECTION_TITLE_CLASS =
  'text-xl font-semibold leading-7 text-[#18181B] sm:text-2xl sm:leading-8';
const PAGE_STACK_CLASS = 'flex flex-col gap-8 pb-6';
/** CardContent ships with pt-0 — use explicit sides so headings keep top breathing room. */
const CARD_BODY_CLASS = 'flex flex-col gap-5 px-6 pb-6 pt-6 my-3';
const CARD_HEADER_ROW_CLASS =
  'flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4';
const METRIC_CARD_CLASS =
  'flex min-h-[7.5rem] flex-col justify-between gap-3 rounded-[10px] border border-[#E5E7EB] bg-white p-4 text-left transition hover:border-[#D4D4D8] hover:bg-[#FAFAFA]';
const OUTLINE_ACTION_CLASS =
  'h-9 shrink-0 gap-1.5 border-[#E5E7EB] bg-white px-4 text-xs font-medium';

const ORDER_CARD_ICONS: Record<string, React.ReactNode> = {
  total_orders: <ReceiptText className="h-3.5 w-3.5 text-[#6B7280]" />,
  pickups_on_route: <MapPinned className="h-3.5 w-3.5 text-[#6B7280]" />,
  delivered: <ReceiptText className="h-3.5 w-3.5 text-[#10B981]" />,
  cancelled: <AlertCircle className="h-3.5 w-3.5 text-[#EF4444]" />,
  failed: <AlertCircle className="h-3.5 w-3.5 text-[#EF4444]" />,
  returned: <RefreshCcw className="h-3.5 w-3.5 text-[#6366F1]" />,
};

export default function DashboardPage(): React.JSX.Element {
  const navigate = useNavigate();
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

  const [selectedPeriod, setSelectedPeriod] = React.useState<OrdersSummaryPeriod>('LAST_7_DAYS');
  const [billingPeriod, setBillingPeriod] = React.useState<BillingOverviewPeriod>('ALL_TIME');
  const [homeTab, setHomeTab] = React.useState<HomeActivityTab>('activity');

  const billingDateRange = React.useMemo(() => getBillingDateRange(billingPeriod), [billingPeriod]);

  const paymentDetailsQueryArg = React.useMemo(
    () =>
      organizationId
        ? {
            organizationId,
            start_date: billingDateRange?.startDate,
            end_date: billingDateRange?.endDate,
          }
        : skipToken,
    [organizationId, billingDateRange?.startDate, billingDateRange?.endDate]
  );

  const { data: orderSummaryResponse, isFetching: ordersSummaryFetching } =
    useGetOrdersSummaryQuery(
      {
        period: selectedPeriod,
        organization_id: organizationId ?? undefined,
      },
      { skip: !organizationId }
    );
  const { data: organizationResponse, isFetching: organizationFetching } =
    useGetOrganizationByIdQuery(
      { organizationId: organizationId ?? '' },
      { skip: !organizationId }
    );
  const {
    data: paymentDetailsResponse,
    isFetching: paymentDetailsFetching,
    isError: paymentDetailsError,
  } = useGetOrganizationPaymentDetailsQuery(paymentDetailsQueryArg);
  const {
    data: recentOrdersResponse,
    isFetching: recentOrdersFetching,
    isError: recentOrdersError,
  } = useGetOrdersQuery(
    {
      organization_id: organizationId ?? undefined,
      page: 1,
      size: HOME_RECENT_ORDERS_LIMIT,
    },
    { skip: !organizationId, refetchOnMountOrArgChange: true }
  );
  const {
    data: billingInvoicesResponse,
    isFetching: billingInvoicesFetching,
    isError: billingInvoicesError,
  } = useGetInvoicesQuery(
    {
      page: 1,
      size: HOME_BILLING_INVOICES_FETCH_SIZE,
      invoiced_from: billingDateRange?.startDate,
      invoiced_to: billingDateRange?.endDate,
      sort_by: 'issue_date',
      sort_order: 'desc',
    },
    { refetchOnMountOrArgChange: true }
  );
  const { data: contactsResponse } = useGetOrgContactsQuery(
    { organizationId: organizationId ?? '' },
    { skip: !organizationId }
  );
  const { data: activityResponse, isFetching: activityFetching } = useGetAuditLogsQuery(
    {
      organizationId: organizationId ?? '',
      page: 1,
      size: 5,
    },
    { skip: !organizationId }
  );
  const { data: notificationsResponse, isFetching: notificationsFetching } =
    useGetInboxNotificationsQuery({
      page: 1,
      size: 5,
      unread_only: false,
    });

  const orderCards = React.useMemo(
    () => mapOrdersSummaryToCards(orderSummaryResponse?.data),
    [orderSummaryResponse?.data]
  );
  const recentOrders = React.useMemo(
    () => mapRecentOrders(recentOrdersResponse?.data.items),
    [recentOrdersResponse?.data.items]
  );
  const billingOverviewRows = React.useMemo(
    () => aggregateHomeBillingOverviewRows(billingInvoicesResponse?.items),
    [billingInvoicesResponse?.items]
  );
  const paymentDetails = paymentDetailsResponse?.data;
  const billingKpiItems = React.useMemo(
    () => getHomeBillingKpisFromPaymentDetails(paymentDetails),
    [paymentDetails]
  );
  const billingTotalInvoices = resolveHomeBillingInvoiceCount(
    paymentDetails,
    billingInvoicesResponse?.total
  );
  const billingPeriodLabel = getBillingPeriodLabel(billingPeriod);
  const recentNotifications = React.useMemo(
    () => mapNotifications(notificationsResponse?.data.items, HOME_NOTIFICATIONS_LIMIT),
    [notificationsResponse?.data.items]
  );
  const activityItems = React.useMemo(
    () => mapActivityFeedItems(activityResponse?.data.items, HOME_ACTIVITY_LIMIT),
    [activityResponse?.data.items]
  );

  const organization = organizationResponse?.data;
  const accountOwner = contactsResponse?.data.owner;
  const accountTeamMembersList = contactsResponse?.data.team_members ?? [];
  const accountTeamMembers = [
    ...(accountOwner ? [accountOwner] : []),
    ...accountTeamMembersList,
  ].map((member) => ({
    id: member.id,
    first_name: member.first_name,
    last_name: member.last_name,
  }));

  const organizationName = organization?.trading_name ?? organization?.legal_entity_name ?? 'there';

  const paymentMethodsForOverview = React.useMemo((): OrganizationPaymentMethodDto[] => {
    const methods = paymentDetailsResponse?.data?.payment_methods ?? [];
    return methods.length > 0 ? methods : [];
  }, [paymentDetailsResponse?.data?.payment_methods]);

  const paymentUtilizationItems = React.useMemo(
    () => mapMethodDistributionToUtilization(paymentDetailsResponse?.data?.method_distribution),
    [paymentDetailsResponse?.data?.method_distribution]
  );

  return (
    <div className={PAGE_STACK_CLASS}>
      <PageHeader
        title={`Welcome, ${organizationName}!`}
        subtitle="Here's what's happening with your deliveries today."
        titleClassName="text-3xl leading-9 text-[#18181B]"
        subtitleClassName="text-sm text-[#71717A]"
        actions={
          <Button
            className="h-11 gap-2 rounded-md bg-[#A31D21] px-5 text-sm font-semibold text-white hover:bg-[#8B1919]"
            onClick={() => void navigate('/deliveries/pending')}
          >
            <Plus className="h-4 w-4" />
            Create New Order
          </Button>
        }
      />

      <Card className={SURFACE_CARD_CLASS}>
        <CardContent className={CARD_BODY_CLASS}>
          <div className={CARD_HEADER_ROW_CLASS}>
            <Typography className={SECTION_TITLE_CLASS}>Orders Summary</Typography>
            <select
              className="h-9 rounded-md border border-[#D4D4D8] bg-white px-3 text-sm text-[#18181B]"
              value={selectedPeriod}
              onChange={(event) => setSelectedPeriod(event.target.value as OrdersSummaryPeriod)}
            >
              {HOME_PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {orderCards.map((card) => {
              const delta = formatDelta(card.changePct);
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => void navigate('/orders/list')}
                  className={METRIC_CARD_CLASS}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex min-w-0 items-center gap-1.5 text-xs leading-4 text-[#52525B]">
                      {ORDER_CARD_ICONS[card.id]}
                      <span className="truncate">{card.title}</span>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
                  </div>
                  <div className="text-3xl font-semibold leading-9 tracking-tight text-[#18181B]">
                    {formatWholeNumber(card.current)}
                  </div>
                  <div
                    className={cn(
                      'text-xs leading-4',
                      delta.tone === 'positive'
                        ? 'text-[#22C55E]'
                        : delta.tone === 'negative'
                          ? 'text-[#EF4444]'
                          : 'text-[#6B7280]'
                    )}
                  >
                    {delta.text} vs {card.comparisonLabel}
                  </div>
                </button>
              );
            })}
          </div>
          {ordersSummaryFetching ? (
            <Typography className="text-xs text-[#71717A]">Refreshing order summary…</Typography>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        <Card className={cn(SURFACE_CARD_CLASS, 'flex flex-col border-[#CBCBD8] lg:col-span-4')}>
          <CardContent className="p-4">
            <AccountOverviewCard
              tradingName={organizationName}
              legalEntityName={organization?.legal_entity_name ?? organizationName}
              reference={organization?.reference ?? organization?.id ?? null}
              industry={organization?.industry ?? null}
              companySize={organization?.company_size ?? null}
              companiesHouseNumber={organization?.companies_house_number ?? null}
              dateOfIncorporation={organization?.date_of_incorporation ?? null}
              logoUrl={organization?.logo_url ?? null}
              teamMembers={accountTeamMembers}
            />
            {organizationFetching ? (
              <Typography className="mt-3 text-xs text-[#71717A]">
                Loading organization details…
              </Typography>
            ) : null}
          </CardContent>
        </Card>

        <Card className={cn(SURFACE_CARD_CLASS, 'flex flex-col lg:col-span-8')}>
          <CardContent className={cn(CARD_BODY_CLASS, 'flex-1')}>
            <div className={CARD_HEADER_ROW_CLASS}>
              <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#B91C1C]" />
                  <Typography className={SECTION_TITLE_CLASS}>Live Orders Tracking</Typography>
                </div>
                <Typography className="text-sm text-[#71717A]">
                  Last updated:{' '}
                  {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Typography className="text-sm text-[#71717A]">Auto-refresh in: 59 sec</Typography>
                <Button
                  type="button"
                  variant="outline"
                  className={OUTLINE_ACTION_CLASS}
                  // onClick={() => void navigate('/orders/tracking')}
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Refresh
                </Button>
              </div>
            </div>
            <div className="relative min-h-[17rem] flex-1 overflow-hidden rounded-lg border border-[#E5E7EB] lg:min-h-[18.5rem]">
              <DashboardMap
                locations={[]}
                routePath={[]}
                className="h-full min-h-[17rem] w-full lg:min-h-[18.5rem]"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        <Card className={cn(SURFACE_CARD_CLASS, 'flex flex-col')}>
          <CardContent className={cn(CARD_BODY_CLASS, 'flex-1')}>
            <div className={CARD_HEADER_ROW_CLASS}>
              <Typography className={SECTION_TITLE_CLASS}>Payment Methods</Typography>
              <Button
                variant="outline"
                className={OUTLINE_ACTION_CLASS}
                onClick={() => void navigate('/billing/payment-details')}
              >
                View Details
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            {paymentDetailsFetching && paymentMethodsForOverview.length === 0 ? (
              <Typography className="text-sm text-[#71717A]">Loading payment methods…</Typography>
            ) : paymentDetailsError ? (
              <Typography className="text-sm text-red-600">
                Could not load payment methods.
              </Typography>
            ) : paymentMethodsForOverview.length === 0 ? (
              <Typography className="text-sm text-[#71717A]">
                No payment methods configured. Add them under Settings → Payment Settings.
              </Typography>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {paymentMethodsForOverview.map((method) => (
                  <PaymentMethodOverviewCard
                    key={method.id ?? method.payment_model}
                    method={method}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={cn(SURFACE_CARD_CLASS, 'flex flex-col border-[#CBCBD8]')}>
          <CardContent className="flex flex-1 flex-col gap-4 p-4">
            <div className="flex h-7 items-center justify-between gap-3 mt-3">
              <Typography className="text-xl font-semibold leading-5 text-[#030303]">
                Billing Overview
              </Typography>
              <Button
                variant="outline"
                className="h-9 shrink-0 gap-2 rounded-md border-[#E4E4E7] bg-white px-3 text-sm font-medium text-[#18181B]"
                onClick={() => void navigate('/billing/invoices')}
              >
                View Details
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="h-px w-full bg-[#F1F5F9]" />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-semibold leading-none text-[#030303]">
                  {formatWholeNumber(billingTotalInvoices)}
                </span>
                <span className="text-xs leading-5 text-[#858594]">
                  Total Invoices
                  <span className="mt-0.5 block text-[10px] font-normal normal-case text-[#9CA3AF]">
                    {billingPeriodLabel}
                  </span>
                </span>
              </div>
              <Select
                value={billingPeriod}
                onValueChange={(value) => setBillingPeriod(value as BillingOverviewPeriod)}
              >
                <SelectTrigger className="h-10 w-[155px] rounded-md border-[#E4E4E7] bg-white text-sm font-normal text-[#18181B] shadow-none">
                  <SelectValue placeholder={billingPeriodLabel} />
                </SelectTrigger>
                <SelectContent>
                  {HOME_BILLING_PERIOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!paymentDetailsFetching && billingKpiItems.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {billingKpiItems.map((item) => (
                  <span
                    key={item.id}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                      item.badgeClassName
                    )}
                  >
                    {item.label}
                    <span className="tabular-nums">{item.displayValue}</span>
                  </span>
                ))}
              </div>
            ) : null}

            {billingInvoicesFetching || paymentDetailsFetching ? (
              <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] text-sm text-[#71717A]">
                Loading billing overview…
              </div>
            ) : billingInvoicesError ? (
              <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-[#FECACA] p-10 text-center text-sm text-[#B91C1C]">
                Could not load billing overview. Open Billing for full details.
              </div>
            ) : (
              <BillingOverviewChart rows={billingOverviewRows} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        <Card className={cn(SURFACE_CARD_CLASS, 'flex flex-col border-[#CBCBD8]')}>
          <CardContent className="flex flex-col gap-8 px-6 py-5">
            <div className="flex flex-col gap-4 my-3">
              <Typography className="text-xl font-semibold leading-5 text-[#030303]">
                Payment Method Utilization
              </Typography>
              <div className="h-px w-full bg-[#F1F5F9]" />
            </div>
            {paymentDetailsFetching && paymentUtilizationItems.length === 0 ? (
              <Typography className="text-sm text-[#71717A]">Loading utilization…</Typography>
            ) : paymentUtilizationItems.length === 0 ? (
              <Typography className="text-sm text-[#71717A]">
                No payment utilization data for this period.
              </Typography>
            ) : (
              <PaymentMethodUtilizationPanel items={paymentUtilizationItems} />
            )}
          </CardContent>
        </Card>

        <Card className={cn(SURFACE_CARD_CLASS, 'flex flex-col border-[#CBCBD8]')}>
          <CardContent className="p-4">
            <TeamActivityNotificationsPanel
              activeTab={homeTab}
              onTabChange={setHomeTab}
              activityItems={activityItems}
              notificationItems={recentNotifications}
              activityLoading={activityFetching}
              notificationsLoading={notificationsFetching}
              onViewAll={() =>
                void navigate(homeTab === 'activity' ? '/audit-logs' : '/notifications')
              }
            />
          </CardContent>
        </Card>
      </div>

      <Card className={cn(SURFACE_CARD_CLASS, 'border-[#CBCBD8]')}>
        <CardContent className="p-4">
          <RecentOrdersPanel
            orders={recentOrders}
            isLoading={recentOrdersFetching}
            isError={recentOrdersError}
            onViewDetails={() => void navigate('/orders/list')}
            onCreateOrder={() => void navigate('/deliveries/pending')}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function parseOrganizationIdFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length < 2) return null;
    const base64Url = tokenParts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payloadJson = window.atob(paddedBase64);
    const payload = JSON.parse(payloadJson) as
      | { org_id?: unknown; organization_id?: unknown }
      | undefined;
    const raw = payload?.organization_id ?? payload?.org_id;
    return typeof raw === 'string' && raw.length > 0 ? raw : null;
  } catch {
    return null;
  }
}
