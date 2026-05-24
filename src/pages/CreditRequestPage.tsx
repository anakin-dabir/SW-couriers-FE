import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  BadgePoundSterling,
  CalendarRange,
  ChevronDown,
  ChevronUp,
  CircleDashed,
  Copy,
  Laptop,
  Monitor,
  RefreshCcw,
  Search,
  Smartphone,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/badge';
import { Card, CardContent } from '@/components/atoms/card';
import Typography from '@/components/atoms/Typography';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/table';
import { Input } from '@/components/atoms/input';
import { Textarea } from '@/components/atoms/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { CreditInsightCard } from '@/components/molecules';
import { ApplicationsHistorySection } from '@/components/pages/CreditApplication/ApplicationsHistorySection';
import { CreditApplicationDetailView } from '@/components/pages/CreditApplication/CreditApplicationDetailView';
import { CreditLimitRequestHistorySection } from '@/components/pages/CreditOverview/CreditLimitRequestHistorySection';
import { CreditOverviewHistoryCard } from '@/components/pages/CreditOverview/CreditOverviewHistoryCard';
import { CreditActivityTable } from '@/components/pages/CreditActivity/CreditActivityTable';
import { Drawer, DrawerContent } from '@/components/molecules/drawer';
import { cn } from '@/lib/utils';
import {
  DeleteDraftApplicationIcon,
  NoCreditAccountIllustration,
  NoDraftApplicationsIcon,
} from '@/assets/svg';
import {
  DELETE_DRAFT_APP_MODAL_BODY,
  DELETE_DRAFT_APP_MODAL_CANCEL_BTN,
  DELETE_DRAFT_APP_MODAL_DELETE_BTN,
  DELETE_DRAFT_APP_MODAL_DESCRIPTION,
  DELETE_DRAFT_APP_MODAL_FOOTER,
  DELETE_DRAFT_APP_MODAL_FOOTER_ROW,
  DELETE_DRAFT_APP_MODAL_ICON,
  DELETE_DRAFT_APP_MODAL_TITLE,
  DELETE_DRAFT_APP_MODAL_WRAPPER,
} from '@/lib/modalStyles';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  useDeleteCreditApplicationDraftMutation,
  useGetCreditApplicationByIdQuery,
  useGetCurrentCreditApplicationQuery,
  useListCreditApplicationDraftsQuery,
  useListCreditApplicationsQuery,
  type CreditApplicationDetail,
} from '@/store/api/creditApplicationsApi';
import {
  useCreateCreditLimitIncreaseRequestMutation,
  useGetCreditActivityQuery,
  useGetCreditLimitTrendQuery,
  useGetCreditOverviewQuery,
  useGetCreditUtilisationTrendQuery,
  useListCreditLimitIncreaseRequestsQuery,
} from '@/store/api/creditOverviewApi';
import type { CreditOverviewData } from '@/store/api/creditOverviewApi';
import {
  coerceNumber,
  formatOverviewMoneyPounds,
  formatTrendTickLabel,
  mapCreditActivityItemToRow,
  mapUiGranularity,
  overviewDateMedium,
  SEVERITY_BADGE_CLASS_EXTENDED,
  capitalizeWords,
  USER_TYPE_BADGE_CLASS_EXTENDED,
  type CreditActivityTableRow,
} from '@/lib/creditPresentation';
import { isFetchBaseQueryError, getErrorMessage } from '@/store/api/utils';

interface OverviewCard {
  id: string;
  title: string;
  value: string;
  metaLabel: string;
  metaValue: string;
  icon: React.ReactNode;
  status?: { label: string; className: string; dotClass?: string };
}

type DraftActor = 'ADMIN' | 'CLIENT';

const DRAFT_ACTOR_BADGE_CLASS: Record<DraftActor, string> = {
  ADMIN: 'bg-[#14B8A6] text-white border-transparent',
  CLIENT: 'bg-[#3B82F6] text-white border-transparent',
};

function creditStatusBadgeClass(normalizedStatus: string): {
  label: string;
  className: string;
  dotClass: string;
} {
  const s = normalizedStatus.toUpperCase();
  if (s === 'ACTIVE') {
    return {
      label: 'Active',
      className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      dotClass: 'bg-green-600',
    };
  }
  if (s === 'SUSPENDED' || s.includes('SUSPENSION')) {
    return {
      label: capitalizeWords(normalizedStatus),
      className: 'bg-red-100 text-red-700 border-red-200',
      dotClass: 'bg-red-600',
    };
  }
  return {
    label: capitalizeWords(normalizedStatus.replaceAll('_', ' ')),
    className: 'bg-slate-100 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-500',
  };
}

const CREDIT_APPLICATION_STATUS_LABELS: Record<string, string> = {
  SUBMITTED: 'Submitted',
  REVIEWER_ASSIGNED: 'Reviewer Assigned',
  REFERENCES_VERIFIED: 'References Verified',
  CREDIT_CHECK_COMPLETED: 'Credit Check Completed',
  CREDIT_CHECK_FAILED: 'Credit Check Failed',
  CREDIT_CHECK_INVESTIGATION_PROGRESS: 'Credit Check Investigation in Progress',
  READY_FOR_DECISION: 'Ready for Decision',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
  CANCELLED: 'Cancelled',
};

function formatEnumLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

function creditApplicationStatusTone(statusRaw: string | null | undefined): string {
  const status = (statusRaw ?? '').toUpperCase();
  if (status === 'APPROVED') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (status === 'REJECTED' || status === 'CANCELLED')
    return 'bg-red-100 text-red-700 border-red-200';
  if (status === 'WITHDRAWN') return 'bg-amber-100 text-amber-800 border-amber-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

function isOverviewNotFoundError(error: unknown): boolean {
  if (!isFetchBaseQueryError(error)) return false;
  if (error.status === 404) return true;
  if (error.status === 'PARSING_ERROR' && error.originalStatus === 404) return true;
  if (typeof error.data === 'object' && error.data !== null) {
    const body = error.data as Record<string, unknown>;
    if (body.statusCode === 404 || body.status === 404) return true;
    if (
      typeof body.error === 'object' &&
      body.error !== null &&
      ((body.error as Record<string, unknown>).statusCode === 404 ||
        (body.error as Record<string, unknown>).status === 404)
    ) {
      return true;
    }
  }
  return false;
}

function hasNoCreditAccountInOverview(overview: CreditOverviewData | undefined): boolean {
  if (!overview) return false;
  if (overview.account == null) return true;
  if (Array.isArray(overview.risk_flags)) {
    return overview.risk_flags.some(
      (flag) => typeof flag === 'string' && flag.toUpperCase() === 'NO_CREDIT_ACCOUNT'
    );
  }
  return false;
}

function coerceOverviewRecordNumber(
  source: Record<string, unknown> | null | undefined,
  ...keys: string[]
): number | null {
  if (!source) return null;
  for (const key of keys) {
    const raw = source[key];
    if (typeof raw === 'number' || typeof raw === 'string') {
      const parsed = coerceNumber(raw);
      if (parsed != null) return parsed;
    }
  }
  return null;
}

function buildOverviewCards(o: CreditOverviewData | undefined): OverviewCard[] {
  if (!o) {
    return [];
  }

  const account = o.account;
  const combinedStatusRaw = o.credit_status?.status?.trim() || account?.status?.trim() || 'Unknown';
  const combinedStatusTone = creditStatusBadgeClass(combinedStatusRaw.replaceAll(/\s+/g, '_'));

  const lastStatusChangeIso = o.credit_status?.last_changed_at ?? account?.last_status_change_at;
  const lastStatusChangeMeta = overviewDateMedium(lastStatusChangeIso) ?? '—';

  const creditLimitAmt = coerceNumber(o.credit_limit?.amount ?? account?.credit_limit);
  const creditLimitFmt =
    creditLimitAmt != null ? (formatOverviewMoneyPounds(creditLimitAmt) ?? '—') : '—';
  const lastLimitAdjIso = o.credit_limit?.last_adjusted_at ?? account?.credit_limit_updated_at;
  const lastLimitAdjMeta = overviewDateMedium(lastLimitAdjIso) ?? '—';

  const termsLabel =
    o.credit_terms?.terms_label?.trim() ||
    (typeof o.credit_terms?.payment_terms_days === 'number'
      ? `Net ${o.credit_terms.payment_terms_days}`
      : 'Terms');

  let nextInvoiceMeta = '—';
  const niRecord = o.next_invoice && typeof o.next_invoice === 'object' ? o.next_invoice : null;
  const niFlat = niRecord ? { ...niRecord } : {};
  const daysCandidates = [
    typeof niFlat.days_until_due === 'number' ? niFlat.days_until_due : null,
    typeof niFlat.days_remaining === 'number' ? niFlat.days_remaining : null,
    typeof niFlat.days === 'number' ? niFlat.days : null,
  ].filter((v): v is number => typeof v === 'number');
  const firstDays = daysCandidates[0];
  if (firstDays !== undefined && firstDays !== null) {
    nextInvoiceMeta = `Next invoice due in ${firstDays} days`;
  }

  return [
    {
      id: 'credit-status',
      title: 'Credit Status',
      value: capitalizeWords(combinedStatusRaw.replaceAll('_', ' ')),
      metaLabel: 'Last Status Change',
      metaValue: lastStatusChangeMeta,
      icon: <CircleDashed className="size-4 text-muted-foreground" />,
      status: combinedStatusTone,
    },
    {
      id: 'approved-limit',
      title: 'Credit Limit',
      value: creditLimitFmt,
      metaLabel: 'Last Adjusted',
      metaValue: lastLimitAdjMeta,
      icon: <BadgePoundSterling className="size-4 text-muted-foreground" />,
    },
    {
      id: 'credit-terms',
      title: 'Credit Terms',
      value: termsLabel,
      metaLabel: '',
      metaValue: Object.keys(niFlat).length > 0 && nextInvoiceMeta !== '—' ? nextInvoiceMeta : '—',
      icon: <CalendarRange className="size-4 text-muted-foreground" />,
    },
  ];
}

function OverviewMetricCard({
  title,
  value,
  metaLabel,
  metaValue,
  icon,
  status,
}: OverviewCard): React.JSX.Element {
  return (
    <Card className="rounded-[10px] border border-[#EFEFEF] shadow-none bg-[#F8F9FB] p-2">
      <CardContent className=" flex flex-col gap-2 p-0">
        <div className="flex flex-col items-start gap-1">
          <span className="flex items-center justify-center size-9 ">{icon}</span>
          <Typography
            component="div"
            className="text-[15px] font-medium leading-[21px] text-[#23262F]"
          >
            {title}
          </Typography>
        </div>
        <div className="flex flex-col gap-2">
          {status ? (
            <div
              className={cn(
                'inline-flex items-center gap-2 rounded-full  w-max border px-3 py-1 text-[13px] font-semibold',
                status.className
              )}
            >
              <div className={cn('size-2 rounded-full', status.dotClass ?? 'bg-green-600')} />
              {status.label}
            </div>
          ) : (
            <div className="text-[30px] font-bold leading-[36px] text-[#191C27]">{value}</div>
          )}
          <div className="text-[13px] leading-[18px] text-[#86909C]">
            {metaLabel ? (
              <>
                {metaLabel} <span className="font-medium text-[#23262F]">{metaValue}</span>
              </>
            ) : (
              <span className="font-medium text-[#23262F]">{metaValue}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CreditRequestPage(): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
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

  const {
    data: overviewResponse,
    error: overviewQueryError,
    isLoading: overviewLoading,
    refetch: refetchOverview,
  } = useGetCreditOverviewQuery(
    { organizationId: organizationId ?? '' },
    { skip: !organizationId }
  );
  const {
    data: currentCreditApplicationResponse,
    error: currentCreditApplicationError,
    isLoading: currentCreditApplicationLoading,
  } = useGetCurrentCreditApplicationQuery(
    { organizationId: organizationId ?? '' },
    { skip: !organizationId }
  );
  const overview = overviewResponse?.data;
  const currentApplication = currentCreditApplicationResponse?.data;
  const currentApplicationStatus = currentApplication?.status ?? null;
  const queryParams = React.useMemo(() => new URLSearchParams(location.search), [location.search]);
  const selectedApplicationId = queryParams.get('applicationId')?.trim() || null;
  const {
    data: selectedApplicationResponse,
    error: selectedApplicationError,
    isLoading: selectedApplicationLoading,
  } = useGetCreditApplicationByIdQuery(
    { organizationId: organizationId ?? '', applicationId: selectedApplicationId ?? '' },
    { skip: !organizationId || !selectedApplicationId }
  );
  const detailApplication = selectedApplicationId
    ? selectedApplicationResponse?.data
    : currentApplication;

  const creditAccountState = React.useMemo<
    'loading' | 'has-account' | 'no-account' | 'error-loading'
  >(() => {
    const params = new URLSearchParams(location.search);
    const forcedNoAccount = params.get('state') === 'no-account';
    if (forcedNoAccount) return 'no-account';
    if (!organizationId || overviewLoading || currentCreditApplicationLoading) return 'loading';
    if (isOverviewNotFoundError(currentCreditApplicationError)) return 'no-account';
    if (currentCreditApplicationError) return 'error-loading';
    if (currentCreditApplicationResponse?.data?.id) return 'has-account';
    if (isOverviewNotFoundError(overviewQueryError)) {
      return 'no-account';
    }
    if (overviewQueryError) return 'error-loading';
    if (hasNoCreditAccountInOverview(overview)) return 'no-account';
    return 'has-account';
  }, [
    location.search,
    organizationId,
    overviewLoading,
    currentCreditApplicationLoading,
    currentCreditApplicationError,
    currentCreditApplicationResponse,
    overviewQueryError,
    overview,
  ]);

  const showApplicationDetails =
    creditAccountState === 'has-account' &&
    !!currentApplication &&
    currentApplicationStatus?.toUpperCase() !== 'APPROVED';
  const currentApplicationStatusUpper = (currentApplicationStatus ?? '').toUpperCase();
  const hasOnlyHistoricalApplication =
    currentApplicationStatusUpper === 'REJECTED' ||
    currentApplicationStatusUpper === 'CANCELLED' ||
    currentApplicationStatusUpper === 'WITHDRAWN';

  const dashboardEnabled =
    Boolean(organizationId) && creditAccountState === 'has-account' && !showApplicationDetails;

  const overviewCards = React.useMemo(() => buildOverviewCards(overview), [overview]);

  const utilizationPercentRounded = React.useMemo(() => {
    const raw =
      typeof overview?.utilization_percent === 'number' &&
      Number.isFinite(overview.utilization_percent)
        ? overview.utilization_percent
        : null;
    if (raw != null) return Math.max(0, Math.min(raw, 100));
    const limitAmt = coerceNumber(
      overview?.credit_limit?.amount ?? overview?.account?.credit_limit
    );
    const usedAmt = coerceNumber(
      overview?.outstanding_balance?.total ?? overview?.account?.used_credit
    );
    if (limitAmt != null && limitAmt > 0 && usedAmt != null) {
      return Math.min(100, Math.max(0, (usedAmt / limitAmt) * 100));
    }
    return null;
  }, [overview]);

  const [selectedYear, setSelectedYear] = React.useState(String(new Date().getFullYear()));
  const [selectedPeriod, setSelectedPeriod] = React.useState('Monthly');
  const [openMenu, setOpenMenu] = React.useState<'year' | 'period' | null>(null);
  const [activeBarMonth, setActiveBarMonth] = React.useState<string | null>(null);
  const [isEventDrawerOpen, setIsEventDrawerOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<CreditActivityTableRow | null>(null);
  const [limitIncreaseOpen, setLimitIncreaseOpen] = React.useState(false);
  const [limitIncreaseRequested, setLimitIncreaseRequested] = React.useState('');
  const [limitIncreaseReason, setLimitIncreaseReason] = React.useState('');
  const dropdownRef = React.useRef<HTMLDivElement | null>(null);

  const trendYear = Number.parseInt(selectedYear, 10);
  const apiGranularity = mapUiGranularity(selectedPeriod);
  const { data: limitTrendData = [], isFetching: limitTrendFetching } = useGetCreditLimitTrendQuery(
    {
      organizationId: organizationId ?? '',
      year: trendYear,
      granularity: apiGranularity,
    },
    { skip: !dashboardEnabled || !Number.isFinite(trendYear) }
  );
  const { data: utilizationTrendData = [], isFetching: utilTrendFetching } =
    useGetCreditUtilisationTrendQuery(
      {
        organizationId: organizationId ?? '',
        year: trendYear,
        granularity: apiGranularity,
      },
      { skip: !dashboardEnabled || !Number.isFinite(trendYear) }
    );

  const limitTrendChartData = React.useMemo(
    () =>
      limitTrendData.map((pt) => ({
        tick: formatTrendTickLabel(pt.period, apiGranularity),
        limitValue: pt.value,
        rawPeriod: pt.period,
      })),
    [limitTrendData, apiGranularity]
  );

  const utilisationChartRows = React.useMemo(
    () =>
      utilizationTrendData.map((pt, index) => ({
        seq: index + 1,
        tick:
          utilizationTrendData.length <= 48
            ? String(index + 1).padStart(2, '0')
            : formatTrendTickLabel(pt.period, apiGranularity),
        percentage: Math.max(0, Math.min(Number(pt.value) || 0, 100)),
        rawPeriod: pt.period,
      })),
    [utilizationTrendData, apiGranularity]
  );

  const maxTrendLimit = React.useMemo(() => {
    const values = limitTrendChartData.map((d) => d.limitValue);
    if (values.length === 0) return 100_000;
    return Math.max(...values, 1000);
  }, [limitTrendChartData]);

  const { data: recentActivityResponse, isFetching: recentActivityFetching } =
    useGetCreditActivityQuery(
      { organizationId: organizationId ?? '', page: 1, size: 10 },
      { skip: !dashboardEnabled }
    );
  const recentActivityRows =
    recentActivityResponse?.data?.items?.map(mapCreditActivityItemToRow) ?? [];

  const { data: limitRequestsResponse, isFetching: limitRequestsFetching } =
    useListCreditLimitIncreaseRequestsQuery(
      { organizationId: organizationId ?? '', page: 1, size: 20 },
      { skip: !dashboardEnabled }
    );

  const [createLimitIncreaseReq, { isLoading: limitIncreaseSaving }] =
    useCreateCreditLimitIncreaseRequestMutation();

  const usageInsightRows = React.useMemo(() => {
    const ob =
      overview?.outstanding_balance && typeof overview.outstanding_balance === 'object'
        ? (overview.outstanding_balance as Record<string, unknown>)
        : null;
    const current = coerceOverviewRecordNumber(ob, 'current', 'current_balance', 'current_amount');
    const unpaidRaw =
      ob?.unpaid_invoices ??
      ob?.unpaid_invoice_count ??
      ob?.unpaid_invoices_count ??
      ob?.invoice_count;
    const unpaidDisplay =
      typeof unpaidRaw === 'number'
        ? String(unpaidRaw)
        : typeof unpaidRaw === 'string' && unpaidRaw.length > 0
          ? unpaidRaw
          : '—';
    const overdueFromOb = coerceOverviewRecordNumber(ob, 'overdue', 'overdue_amount');
    const overdueRecord =
      overview?.overdue && typeof overview.overdue === 'object' ? overview.overdue : null;
    const overdueFromRoot = coerceOverviewRecordNumber(
      overdueRecord,
      'total',
      'amount',
      'overdue_total'
    );
    const overdueAmt = overdueFromOb ?? overdueFromRoot;
    return [
      {
        label: 'Current',
        value: current != null ? (formatOverviewMoneyPounds(current) ?? '—') : '—',
        color: '#9ca3af',
      },
      {
        label: 'Unpaid Invoices',
        value: unpaidDisplay,
        color: '#f97316',
      },
      {
        label: 'Overdue',
        value: overdueAmt != null ? (formatOverviewMoneyPounds(overdueAmt) ?? '—') : '—',
        color: '#ef4444',
      },
    ];
  }, [overview]);

  const overdueAmountRows = React.useMemo(() => {
    const raw = overview?.overdue;
    if (!raw || typeof raw !== 'object') {
      return [
        { label: 'Overdue Invoices', value: '—', color: '#ef4444' },
        { label: 'Oldest Overdue', value: '—', color: '#9ca3af' },
      ];
    }
    const o = raw;
    const invoiceCount =
      o.overdue_invoices ?? o.invoice_count ?? o.invoices_count ?? o.overdue_invoice_count;
    const oldestDays = o.oldest_overdue_days ?? o.oldest_days ?? o.max_days_overdue;
    return [
      {
        label: 'Overdue Invoices',
        value:
          typeof invoiceCount === 'number'
            ? String(invoiceCount)
            : typeof invoiceCount === 'string' && invoiceCount.length > 0
              ? invoiceCount
              : '—',
        color: '#ef4444',
      },
      {
        label: 'Oldest Overdue',
        value:
          typeof oldestDays === 'number'
            ? `${oldestDays} days`
            : typeof oldestDays === 'string' && oldestDays.length > 0
              ? oldestDays.includes('day')
                ? oldestDays
                : `${oldestDays} days`
              : '—',
        color: '#9ca3af',
      },
    ];
  }, [overview]);

  const overdueMainAmount = React.useMemo(() => {
    const fromOverdue = overview?.overdue as Record<string, unknown> | undefined;
    const candidate =
      fromOverdue && typeof fromOverdue === 'object'
        ? (fromOverdue.total ?? fromOverdue.amount ?? fromOverdue.overdue_total)
        : undefined;
    const n = coerceNumber(
      typeof candidate === 'number'
        ? String(candidate)
        : typeof candidate === 'string'
          ? candidate
          : null
    );
    return n != null ? (formatOverviewMoneyPounds(n) ?? '—') : '—';
  }, [overview?.overdue]);

  const {
    data: applicationsListResponse,
    isFetching: applicationsListFetching,
    isError: applicationsListError,
  } = useListCreditApplicationsQuery(
    { organizationId: organizationId ?? '', page: 1, size: 50 },
    { skip: !dashboardEnabled }
  );

  const applicationHistoryRows = React.useMemo((): CreditApplicationDetail[] => {
    const fromList = applicationsListResponse?.data?.items ?? [];
    if (fromList.length > 0) return fromList;
    if (!applicationsListError && currentApplication?.id) return [currentApplication];
    return [];
  }, [applicationsListResponse, applicationsListError, currentApplication]);

  const currentLimitForModal = React.useMemo(() => {
    return coerceNumber(overview?.credit_limit?.amount ?? overview?.account?.credit_limit) ?? 0;
  }, [overview?.credit_limit?.amount, overview?.account?.credit_limit]);

  const trendYearChoices = React.useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => String(2020 + i)).filter(
        (y) => Number(y) <= 2030 && Number(y) >= 2020
      ),
    []
  );

  const handleSubmitLimitIncrease = React.useCallback(async (): Promise<void> => {
    if (!organizationId) return;
    const cleaned = limitIncreaseRequested.replace(/[£,\s]/g, '');
    const amount = Number.parseFloat(cleaned);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Enter a valid requested limit.');
      return;
    }
    const reason = limitIncreaseReason.trim();
    if (reason.length < 5) {
      toast.error('Please provide a reason (at least 5 characters).');
      return;
    }
    if (reason.length > 500) {
      toast.error('Reason must be 500 characters or fewer.');
      return;
    }
    try {
      await createLimitIncreaseReq({
        organizationId,
        requested_credit_limit: amount,
        reason,
      }).unwrap();
      toast.success('Credit limit increase request submitted.');
      setLimitIncreaseOpen(false);
      setLimitIncreaseRequested('');
      setLimitIncreaseReason('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }, [
    organizationId,
    limitIncreaseRequested,
    limitIncreaseReason,
    createLimitIncreaseReq,
    setLimitIncreaseOpen,
    setLimitIncreaseRequested,
    setLimitIncreaseReason,
  ]);

  const isDraftApplicationsRoute = location.pathname === '/credit-request/drafts';
  const [draftSearchInput, setDraftSearchInput] = React.useState('');
  const [draftDateLabel, setDraftDateLabel] = React.useState('19 Feb 2026 - 25 Feb 2026');
  const [draftSortBy, setDraftSortBy] = React.useState<'newest' | 'oldest'>('newest');
  const [draftPage, setDraftPage] = React.useState(1);
  const draftPageSize = 10;
  const [pendingDeleteDraft, setPendingDeleteDraft] = React.useState<{
    draftId: string;
    draftNumber: string;
  } | null>(null);
  const [deleteDraftMutation, { isLoading: deletingDraft }] =
    useDeleteCreditApplicationDraftMutation();

  const draftsQueryArg = React.useMemo(
    () =>
      organizationId
        ? {
            organizationId,
            page: draftPage,
            size: draftPageSize,
          }
        : undefined,
    [organizationId, draftPage]
  );
  const {
    data: draftsRes,
    isLoading: draftsLoading,
    isFetching: draftsFetching,
    refetch: refetchDrafts,
  } = useListCreditApplicationDraftsQuery(
    draftsQueryArg ?? { organizationId: '', page: 1, size: 10 },
    {
      skip: !isDraftApplicationsRoute || !draftsQueryArg,
    }
  );

  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent): void => {
      const targetNode = event.target as Node;
      const outsideLimitDropdown = dropdownRef.current && !dropdownRef.current.contains(targetNode);
      if (outsideLimitDropdown) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const filteredDraftRows = React.useMemo(() => {
    const items = draftsRes?.data?.items ?? [];
    const query = draftSearchInput.trim().toLowerCase();

    const normalizedRows = items.map((item, index) => {
      const raw = item as Partial<{
        draft_id: string;
        id: string;
        draft_number: string;
        created_at: string;
        actor: string;
        created_by: { email?: string };
      }>;
      const draftId =
        typeof raw.draft_id === 'string' && raw.draft_id.length > 0
          ? raw.draft_id
          : typeof raw.id === 'string'
            ? raw.id
            : '';
      const draftNumberFromApi =
        typeof raw.draft_number === 'string' && raw.draft_number.trim().length > 0
          ? raw.draft_number.trim()
          : null;
      const draftNumber =
        draftNumberFromApi ??
        (draftId ? `APP-${draftId.slice(0, 8).toUpperCase()}` : `APP-DRAFT-${index + 1}`);
      const email = typeof raw.created_by?.email === 'string' ? raw.created_by.email : '-';
      const createdAt = typeof raw.created_at === 'string' ? raw.created_at : '';
      const createdAtMs = Number.parseInt(String(new Date(createdAt).getTime()), 10);
      const createdAtDisplay = Number.isNaN(createdAtMs)
        ? '-'
        : format(new Date(createdAtMs), 'dd MMM yyyy, hh:mm a');
      const actor: DraftActor = raw.actor === 'ADMIN' ? 'ADMIN' : 'CLIENT';

      return {
        ...item,
        draftId,
        draftNumber,
        email,
        actor,
        createdAtMs,
        createdAtDisplay,
      };
    });

    const searched = normalizedRows.filter((item) => {
      if (!query) return true;
      const draftIdText = item.draftId.toLowerCase();
      const draftNumber = item.draftNumber.toLowerCase();
      const email = item.email.toLowerCase();
      return draftIdText.includes(query) || draftNumber.includes(query) || email.includes(query);
    });

    const sorted = [...searched].sort((a, b) => {
      const first = a.createdAtMs;
      const second = b.createdAtMs;
      return draftSortBy === 'newest' ? second - first : first - second;
    });

    return sorted;
  }, [draftsRes?.data?.items, draftSearchInput, draftSortBy]);

  const hasDraftRows = filteredDraftRows.length > 0;

  const handleDeleteDraft = React.useCallback(async (): Promise<void> => {
    if (!organizationId || !pendingDeleteDraft) return;
    try {
      await deleteDraftMutation({
        organizationId,
        draftId: pendingDeleteDraft.draftId,
      }).unwrap();
      setPendingDeleteDraft(null);
    } catch {
      // keep modal open for user retry
    }
  }, [organizationId, pendingDeleteDraft, deleteDraftMutation]);

  if (isDraftApplicationsRoute) {
    return (
      <div className="space-y-4 rounded-[12px] border border-[#E5E5EC] bg-white p-4">
        <div className="space-y-1">
          <Typography className="text-[34px] font-semibold leading-tight text-[#18181B]">
            Draft Credit Applications
          </Typography>
          <Typography className="text-sm text-[#71717A]">
            View, filter, and manage all draft credit applications.
          </Typography>
        </div>

        <div className="rounded-[10px] border border-[#E5E7EB] bg-white p-3">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              variant="outline"
              className="h-8 border-[#D4D4D8] bg-white px-3 text-xs font-medium text-[#18181B] hover:bg-[#FAFAFA]"
              onClick={() => void refetchDrafts()}
            >
              <RefreshCcw className="size-3.5" />
              Refresh
            </Button>
            <Button
              variant="outline"
              className="h-8 border-[#D4D4D8] bg-white px-3 text-xs font-medium text-[#18181B] hover:bg-[#FAFAFA]"
              onClick={() => void navigate('/credit-request/new')}
            >
              Start a New Application
            </Button>
          </div>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <div className="min-w-0 flex-[1_1_58%] sm:min-w-[280px]">
              <Input
                value={draftSearchInput}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setDraftSearchInput(event.target.value);
                  setDraftPage(1);
                }}
                placeholder="Search by draft ID"
                leftIcon={Search}
                wrapperClassName="[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:text-[#9CA3AF]"
                className="h-9 w-full border-[#E4E4E7] bg-[#FCFCFD]"
              />
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
              <select
                value={draftSortBy}
                onChange={(event) => {
                  setDraftSortBy(event.target.value as 'newest' | 'oldest');
                  setDraftPage(1);
                }}
                className="h-9 min-w-[132px] shrink-0 rounded-md border border-[#D4D4D8] bg-white px-2.5 text-xs font-medium text-[#18181B]"
                aria-label="Sort drafts"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
              <Button
                type="button"
                variant="outline"
                className="h-9 shrink-0 gap-2 border-[#D4D4D8] bg-white px-3 text-xs font-medium text-[#18181B] hover:bg-[#FAFAFA]"
                onClick={() => setDraftDateLabel('19 Feb 2026 - 25 Feb 2026')}
              >
                <CalendarRange className="size-3.5 shrink-0" />
                <span className="max-w-[min(100%,220px)] truncate">{draftDateLabel}</span>
                <ChevronDown className="size-3.5 shrink-0 text-[#A1A1AA]" />
              </Button>
            </div>
          </div>

          {draftsLoading || draftsFetching ? (
            <div className="mt-3 flex min-h-[360px] items-center justify-center rounded-[10px] border border-dashed border-[#E4E4E7] bg-[#FAFAFA]">
              <Typography className="text-sm text-[#71717A]">Loading drafts...</Typography>
            </div>
          ) : hasDraftRows ? (
            <div className="mt-3 rounded-[10px] border border-[#E5E7EB]">
              <div className="border-b border-[#E5E7EB] px-3 py-2">
                <Typography className="text-xs font-semibold uppercase tracking-wide text-[#52525B]">
                  Applications History
                </Typography>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8F8FA]">
                    <TableHead className="text-[11px] uppercase tracking-wide text-[#71717A]">
                      Draft Application ID
                    </TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wide text-[#71717A]">
                      Draft Created date
                    </TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wide text-[#71717A]">
                      Actor
                    </TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wide text-[#71717A]">
                      Created by
                    </TableHead>
                    <TableHead className="text-right text-[11px] uppercase tracking-wide text-[#71717A]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDraftRows.map((row) => (
                    <TableRow key={row.draftId || row.draftNumber} className="h-11">
                      <TableCell className="font-medium text-[#52525B] underline underline-offset-2">
                        {row.draftNumber}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-[#3F3F46]">
                        {row.createdAtDisplay}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            'border px-2 py-0.5 text-[10px] font-semibold',
                            DRAFT_ACTOR_BADGE_CLASS[row.actor]
                          )}
                        >
                          {row.actor === 'ADMIN' ? 'Admin' : 'Client'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-[#18181B] underline underline-offset-2">
                        {row.email}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            className="h-7 border-[#D4D4D8] bg-white px-2.5 text-[11px] text-gray-900 hover:bg-[#FAFAFA]"
                            disabled={!row.draftId}
                            onClick={() =>
                              void navigate(
                                `/credit-request/new?draftId=${encodeURIComponent(row.draftId)}`
                              )
                            }
                          >
                            Continue Editing
                          </Button>
                          <Button
                            variant="outline"
                            className="h-7 border-[#F3CACA] bg-[#FFF7F7] px-2.5 text-[11px] text-[#DC2626] hover:bg-[#FEECEC]"
                            disabled={!row.draftId}
                            onClick={() =>
                              setPendingDeleteDraft({
                                draftId: row.draftId,
                                draftNumber: row.draftNumber,
                              })
                            }
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="mt-3 flex min-h-[420px] items-center justify-center rounded-[10px] border border-dashed border-[#E4E4E7] bg-[#FAFAFA] px-4">
              <div className="flex max-w-[420px] flex-col items-center text-center">
                <img
                  src={NoDraftApplicationsIcon}
                  alt=""
                  className="mb-4 h-[126px] w-[115px] object-contain"
                  width={115}
                  height={126}
                />
                <Typography className="text-2xl font-semibold text-[#18181B]">
                  You have no draft applications yet
                </Typography>
                <Typography className="mt-2 text-sm text-[#71717A]">
                  No draft credit applications have been created yet.
                </Typography>
                <Button
                  variant="outline"
                  className="mt-5 h-9 border-[#D4D4D8]"
                  onClick={() => void navigate('/credit-request/new')}
                >
                  Start a New Application
                </Button>
              </div>
            </div>
          )}
        </div>

        <Dialog
          open={pendingDeleteDraft != null}
          onOpenChange={(open) => {
            if (!open) setPendingDeleteDraft(null);
          }}
        >
          <DialogContent className={DELETE_DRAFT_APP_MODAL_WRAPPER} hideCloseButton>
            <div className={DELETE_DRAFT_APP_MODAL_BODY}>
              <div className="flex flex-col items-center">
                <img
                  src={DeleteDraftApplicationIcon}
                  alt=""
                  className={DELETE_DRAFT_APP_MODAL_ICON}
                  width={109}
                  height={100}
                />
              </div>
              <DialogTitle className={DELETE_DRAFT_APP_MODAL_TITLE}>
                Delete Draft Application?
              </DialogTitle>
              <DialogDescription className={DELETE_DRAFT_APP_MODAL_DESCRIPTION}>
                This draft credit application will be permanently removed and cannot be recovered.
                Are you sure you want to continue?
              </DialogDescription>
            </div>

            <div className={DELETE_DRAFT_APP_MODAL_FOOTER}>
              <div className={DELETE_DRAFT_APP_MODAL_FOOTER_ROW}>
                <Button
                  type="button"
                  variant="outline"
                  className={DELETE_DRAFT_APP_MODAL_CANCEL_BTN}
                  onClick={() => setPendingDeleteDraft(null)}
                  disabled={deletingDraft}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className={DELETE_DRAFT_APP_MODAL_DELETE_BTN}
                  onClick={() => void handleDeleteDraft()}
                  disabled={deletingDraft}
                >
                  {deletingDraft ? 'Deleting…' : 'Delete Draft'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (creditAccountState === 'loading') {
    return (
      <div className="flex flex-col gap-6 rounded-[12px] border border-[#E5E5EC] bg-white p-4">
        <PageHeader title="Credit Management" subtitle="" />
        <div className="rounded-[10px] border border-[#E5E5EC] p-4">
          <div className="flex min-h-[540px] items-center justify-center rounded-[10px] border border-dashed border-[#D4D4D8] bg-[#FAFAFA] px-4">
            <Typography className="text-sm text-[#71717A]">Loading credit account...</Typography>
          </div>
        </div>
      </div>
    );
  }

  if (creditAccountState === 'error-loading') {
    return (
      <div className="flex flex-col gap-6 rounded-[12px] border border-[#E5E5EC] bg-white p-4">
        <PageHeader title="Credit Management" subtitle="" />
        <div className="rounded-[10px] border border-[#E5E5EC] p-4">
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-[10px] border border-dashed border-[#D4D4D8] bg-[#FAFAFA] px-4 text-center">
            <Typography className="text-sm font-medium text-[#18181B]">
              We couldn&apos;t load your credit overview.
            </Typography>
            <Typography className="text-sm text-[#71717A]">
              {overviewQueryError ? getErrorMessage(overviewQueryError) : 'Please try again.'}
            </Typography>
            <Button variant="outline" className="h-9" onClick={() => void refetchOverview()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (creditAccountState === 'no-account') {
    return (
      <div className="flex flex-col gap-6 rounded-[12px] border border-[#E5E5EC] bg-white p-4">
        <PageHeader title="Credit Management" subtitle="" />
        <div className="rounded-[10px] border border-[#E5E5EC] p-4">
          <div className="flex min-h-[540px] items-center justify-center rounded-[10px] border border-dashed border-[#D4D4D8] bg-[#FAFAFA] px-4">
            <div className="flex max-w-[420px] flex-col items-center text-center">
              <img
                src={NoCreditAccountIllustration}
                alt=""
                className="mb-4 h-[131px] w-[239px] max-w-full object-contain"
                width={239}
                height={131}
              />
              <Typography className="text-[30px] font-semibold leading-tight text-[#18181B]">
                No Credit Account
              </Typography>
              <Typography className="mt-2 text-sm text-[#71717A]">
                Don&apos;t have a credit account yet? Submit a request to get started and access
                credit-based payments.
              </Typography>
              <Button
                variant="outline"
                className="mt-6 h-10 border-[#D4D4D8] bg-white"
                onClick={() => void navigate('/credit-request/new')}
              >
                Create Credit Application
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedApplicationId) {
    if (selectedApplicationLoading) {
      return (
        <div className="flex flex-col gap-6 rounded-[12px] border border-[#E5E5EC] bg-white p-4">
          <PageHeader title="Credit Application Details" subtitle="" />
          <div className="rounded-[10px] border border-[#E5E5EC] p-4">
            <div className="flex min-h-[320px] items-center justify-center rounded-[10px] border border-dashed border-[#D4D4D8] bg-[#FAFAFA] px-4">
              <Typography className="text-sm text-[#71717A]">
                Loading application details...
              </Typography>
            </div>
          </div>
        </div>
      );
    }
    if (selectedApplicationError || !detailApplication) {
      return (
        <div className="flex flex-col gap-6 rounded-[12px] border border-[#E5E5EC] bg-white p-4">
          <PageHeader title="Credit Application Details" subtitle="" />
          <div className="rounded-[10px] border border-[#E5E5EC] p-4">
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-[10px] border border-dashed border-[#D4D4D8] bg-[#FAFAFA] px-4 text-center">
              <Typography className="text-sm font-medium text-[#18181B]">
                We couldn&apos;t load this application.
              </Typography>
              <Typography className="text-sm text-[#71717A]">
                {selectedApplicationError
                  ? getErrorMessage(selectedApplicationError)
                  : 'Please try again.'}
              </Typography>
              <Button
                variant="outline"
                className="h-9"
                onClick={() => void navigate('/credit-request')}
              >
                Back to Overview
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }

  if (showApplicationDetails && !selectedApplicationId) {
    const requestedLimit = formatOverviewMoneyPounds(
      coerceNumber(currentApplication?.requested_credit_limit)
    );
    const reviewerName = currentApplication?.assigned_reviewer
      ? `${currentApplication.assigned_reviewer.first_name ?? ''} ${currentApplication.assigned_reviewer.last_name ?? ''}`.trim()
      : '';
    const statusKey = (currentApplicationStatus ?? '').toUpperCase();
    const statusLabel = CREDIT_APPLICATION_STATUS_LABELS[statusKey] ?? formatEnumLabel(statusKey);

    return (
      <div className="flex flex-col gap-6 rounded-[12px] border border-[#E5E5EC] bg-white p-4">
        <PageHeader title="Credit Overview" subtitle="" />

        <div className="rounded-[10px] border border-[#E5E5EC] bg-white p-4">
          <div className="mb-4 flex min-h-[220px] items-center justify-center rounded-[10px] border border-dashed border-[#D4D4D8] bg-[#FAFAFA] px-4">
            <div className="flex max-w-[520px] flex-col items-center text-center">
              <img
                src={NoCreditAccountIllustration}
                alt=""
                className="mb-4 h-[131px] w-[239px] max-w-full object-contain"
                width={239}
                height={131}
              />
              <Typography className="text-[30px] font-semibold leading-tight text-[#18181B]">
                No Credit Account
              </Typography>
              <Typography className="mt-2 text-sm text-[#71717A]">
                You have an active application.
              </Typography>
              <div className="mt-4 flex items-center gap-2">
                {hasOnlyHistoricalApplication ? (
                  <Button
                    variant="outline"
                    className="h-9 border-[#D4D4D8]"
                    onClick={() => void navigate('/credit-request/new')}
                  >
                    Start a New Application
                  </Button>
                ) : null}
                <Button
                  variant="outline"
                  className="h-9 border-[#D4D4D8]"
                  onClick={() =>
                    void navigate(
                      `/credit-request?applicationId=${encodeURIComponent(currentApplication?.id ?? '')}`
                    )
                  }
                >
                  View Application
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-[10px] border border-[#E5E5EC] overflow-hidden">
            <div className="border-b border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3">
              <Typography className="text-xs font-semibold uppercase tracking-wide text-[#52525B]">
                Applications History
              </Typography>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#F1F1F4] bg-white">
                    <th className="px-4 py-2 text-xs font-medium text-[#71717A]">Application ID</th>
                    <th className="px-4 py-2 text-xs font-medium text-[#71717A]">
                      Submission Date
                    </th>
                    <th className="px-4 py-2 text-xs font-medium text-[#71717A]">
                      Requested Limit
                    </th>
                    <th className="px-4 py-2 text-xs font-medium text-[#71717A]">Reviewer</th>
                    <th className="px-4 py-2 text-xs font-medium text-[#71717A]">Status</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-[#71717A]">
                      View
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#F5F5F6]">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                      {currentApplication?.application_number ?? '—'}
                    </td>
                    <td className="px-4 py-2 text-sm text-[#3F3F46]">
                      {overviewDateMedium(currentApplication?.submitted_at ?? null) ?? '—'}
                    </td>
                    <td className="px-4 py-2 text-sm text-[#3F3F46]">{requestedLimit ?? '—'}</td>
                    <td className="px-4 py-2 text-sm text-[#3F3F46]">{reviewerName || '—'}</td>
                    <td className="px-4 py-2">
                      <Badge
                        className={cn(
                          'border px-2.5 py-0.5 text-[11px] font-semibold',
                          creditApplicationStatusTone(statusKey)
                        )}
                      >
                        {statusLabel}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() =>
                          void navigate(
                            `/credit-request?applicationId=${encodeURIComponent(currentApplication?.id ?? '')}`
                          )
                        }
                      >
                        <ArrowUpRight className="size-4" />
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="flex items-center justify-end p-3">
                <Typography className="text-xs text-[#71717A]">1 / 1</Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedApplicationId && detailApplication) {
    return (
      <div className="flex flex-col gap-6 rounded-[12px] border border-[#E5E5EC] bg-white p-6">
        <CreditApplicationDetailView application={detailApplication} />
      </div>
    );
  }

  const selectedEventRef =
    selectedEvent?.auditRefDisplay && selectedEvent.auditRefDisplay !== '—'
      ? selectedEvent.auditRefDisplay
      : '-';

  const renderDeviceIcon = (device: CreditActivityTableRow['device']): React.JSX.Element => {
    if (device === 'Desktop') return <Monitor className="size-4 text-muted-foreground" />;
    if (device === 'Laptop') return <Laptop className="size-4 text-muted-foreground" />;
    return <Smartphone className="size-4 text-muted-foreground" />;
  };

  const lastLimitAdjustedSubtitle = overviewDateMedium(
    overview?.credit_limit?.last_adjusted_at ?? overview?.account?.credit_limit_updated_at ?? null
  );

  const displayCreditLimitHeader =
    formatOverviewMoneyPounds(
      coerceNumber(overview?.credit_limit?.amount ?? overview?.account?.credit_limit)
    ) ?? '—';

  const utilizationSegmentsFilled =
    utilizationPercentRounded != null
      ? Math.min(48, Math.max(0, Math.round((utilizationPercentRounded / 100) * 48)))
      : 24;

  return (
    <div className="flex flex-col  gap-6 rounded-[12px] border border-[#E5E5EC] bg-white p-4">
      <PageHeader
        title="Credit Account Overview"
        subtitle="Quick snapshot of your credit health and exposure."
        actions={
          <Button
            size="sm"
            className="rounded-md bg-primary-500 hover:bg-primary-600"
            onClick={() => setLimitIncreaseOpen(true)}
          >
            Request Credit Limit Increase
            <ArrowUpRight className="size-4" />
          </Button>
        }
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {overviewCards.map((card) => (
          <OverviewMetricCard key={card.id} {...card} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CreditInsightCard title="Outstanding Balance">
          <div className="my-2 flex flex-col items-start gap-1">
            <Typography className="text-[34px] font-bold text-gray-900 leading-tight">
              {usageInsightRows[0]?.value ?? '—'}
            </Typography>
          </div>
          <div className="flex flex-col gap-5">
            {usageInsightRows.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-[#6B7280]">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </CreditInsightCard>

        <CreditInsightCard title="Overdue Amount">
          <div className="my-2 flex flex-col items-start gap-1">
            <Typography className="text-[34px] font-bold text-gray-900 leading-tight">
              {overdueMainAmount}
            </Typography>
          </div>
          <div className="flex flex-col gap-5">
            {overdueAmountRows.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-[#6B7280]">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </CreditInsightCard>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <CreditInsightCard
          title="Credit Limit Trend"
          className="xl:col-span-12"
          contentClassName="relative h-[465px]"
        >
          <div className="flex items-start justify-between p-5">
            <div>
              <Typography component="div" className="text-[20px] font-semibold text-gray-900">
                Credit Limit
              </Typography>
              <div className="mt-1 flex items-center gap-3 ">
                <Typography
                  component="div"
                  className="text-[42px] font-bold leading-none text-gray-900"
                >
                  {displayCreditLimitHeader}
                </Typography>
                <Typography component="div" className="text-sm text-[#9CA3AF]">
                  Last Adjusted{' '}
                  <span className="font-medium text-[#23262F]">
                    {lastLimitAdjustedSubtitle ?? '—'}
                  </span>
                </Typography>
                {limitTrendFetching ? (
                  <Typography component="div" className="text-[11px] text-[#9CA3AF]">
                    Refreshing chart…
                  </Typography>
                ) : null}
              </div>
            </div>

            <div ref={dropdownRef} className="relative flex items-start gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-md px-3 text-xs"
                onClick={() => setOpenMenu((prev) => (prev === 'year' ? null : 'year'))}
              >
                {selectedYear}{' '}
                {openMenu === 'year' ? (
                  <ChevronUp className="size-3.5" />
                ) : (
                  <ChevronDown className="size-3.5" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-md px-3 text-xs"
                onClick={() => setOpenMenu((prev) => (prev === 'period' ? null : 'period'))}
              >
                {selectedPeriod}{' '}
                {openMenu === 'period' ? (
                  <ChevronUp className="size-3.5" />
                ) : (
                  <ChevronDown className="size-3.5" />
                )}
              </Button>
              {openMenu === 'year' && (
                <div className="absolute left-0 top-9 z-10 w-[90px] rounded-md border border-[#E5E7EB] bg-white p-1 shadow-md">
                  {trendYearChoices.map((year) => (
                    <button
                      key={year}
                      type="button"
                      className={cn(
                        'w-full rounded px-2 py-1.5 text-left text-sm hover:bg-[#F4F5F7]',
                        selectedYear === year ? 'font-medium text-gray-900' : 'text-[#6B7280]'
                      )}
                      onClick={() => {
                        setSelectedYear(year);
                        setOpenMenu(null);
                      }}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
              {openMenu === 'period' && (
                <div className="absolute right-0 top-9 z-10 w-[104px] rounded-md border border-[#E5E7EB] bg-white p-1 shadow-md">
                  {['Weekly', 'Monthly', 'Yearly'].map((period) => (
                    <button
                      key={period}
                      type="button"
                      className={cn(
                        'w-full rounded px-2 py-1.5 text-left text-sm hover:bg-[#F4F5F7]',
                        selectedPeriod === period ? 'font-medium text-gray-900' : 'text-[#6B7280]'
                      )}
                      onClick={() => {
                        setSelectedPeriod(period);
                        setOpenMenu(null);
                      }}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="relative h-[310px] pt-3">
            {limitTrendChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-md border border-dashed border-[#E4E4E7] text-sm text-[#71717A]">
                {limitTrendFetching ? 'Loading trend…' : 'No trend data for this filter.'}
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={limitTrendChartData}
                    barGap={10}
                    onMouseMove={(state: { activeLabel?: string | number }) => {
                      const nextMonth = state.activeLabel;
                      setActiveBarMonth(typeof nextMonth === 'string' ? nextMonth : null);
                    }}
                    onMouseLeave={() => setActiveBarMonth(null)}
                  >
                    <CartesianGrid stroke="#E5E7EB" strokeDasharray="0" vertical={true} />
                    <XAxis
                      dataKey="tick"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      tickFormatter={(value) =>
                        typeof value === 'number'
                          ? `£${(value / 1000).toFixed(0)}K`
                          : String(value ?? '')
                      }
                      domain={[0, Math.ceil(maxTrendLimit * 1.08)]}
                    />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      wrapperStyle={{ outline: 'none' }}
                      isAnimationActive={false}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const valueRaw = payload[0]?.payload as {
                          rawPeriod?: string;
                          limitValue?: number;
                        };
                        const amt = coerceNumber(
                          typeof valueRaw?.limitValue === 'number'
                            ? String(valueRaw.limitValue)
                            : null
                        );
                        return (
                          <div className="rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-xs shadow-sm">
                            <span className="inline-flex items-center gap-1 text-[#6B7280]">
                              <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                              Credit Limit{' '}
                              <span className="font-semibold text-gray-900">
                                {amt != null ? (formatOverviewMoneyPounds(amt) ?? '—') : '—'}
                              </span>
                              {valueRaw?.rawPeriod ? (
                                <span className="text-[#9CA3AF]">({valueRaw.rawPeriod})</span>
                              ) : null}
                            </span>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="limitValue" radius={[3, 3, 0, 0]} maxBarSize={22}>
                      {limitTrendChartData.map((entry) => (
                        <Cell
                          key={entry.rawPeriod ?? entry.tick}
                          fill="#10B981"
                          fillOpacity={
                            activeBarMonth ? (activeBarMonth === entry.tick ? 1 : 0.45) : 0.65
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
        </CreditInsightCard>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <CreditInsightCard
          title="Current Utilisation"
          className="xl:col-span-5"
          titleClassName="text-base tracking-[0.16px] uppercase text-form-title font-medium"
          contentClassName="gap-6"
        >
          <>
            <Typography
              component="div"
              className="text-[52px] font-semibold leading-none tracking-[-0.36px] text-form-title"
            >
              {utilizationPercentRounded != null ? `${utilizationPercentRounded.toFixed(1)}%` : '—'}
            </Typography>

            <div className="flex items-center justify-between gap-[3px]">
              {Array.from({ length: 48 }).map((_, index) => (
                <span
                  key={`utilisation-segment-${index}`}
                  className={cn(
                    'h-7 w-[5px] rounded-[22px]',
                    index < utilizationSegmentsFilled ? 'bg-emerald-500' : 'bg-[#D9D9D9]'
                  )}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card className="rounded-lg border border-[#E2E8F0] bg-[#FBFBFC] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] px-4 py-6">
                <CardContent className="flex flex-col gap-1 ">
                  <BadgePoundSterling className="size-4 text-[#F97316]" />
                  <Typography
                    component="div"
                    className="mt-1 text-sm font-medium leading-5 tracking-[-0.42px] text-[#020617]"
                  >
                    Outstanding Balance d;laskd;
                  </Typography>
                  <Typography
                    component="div"
                    className="text-4xl font-semibold leading-6 tracking-[-0.36px] text-form-title"
                  >
                    {usageInsightRows[0]?.value ?? '—'}
                  </Typography>
                </CardContent>
              </Card>
              <Card className="rounded-lg border border-[#E2E8F0] bg-[#FBFBFC] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] px-4 py-6">
                <CardContent className="flex flex-col gap-1 ">
                  <BadgePoundSterling className="size-4 text-emerald-500" />
                  <Typography
                    component="div"
                    className="mt-1 text-sm font-medium leading-5 tracking-[-0.42px] text-[#020617]"
                  >
                    Available Credit
                  </Typography>
                  <Typography
                    component="div"
                    className="text-4xl font-semibold leading-6 tracking-[-0.36px] text-form-title"
                  >
                    {usageInsightRows[2]?.value ?? '—'}
                  </Typography>
                </CardContent>
              </Card>
            </div>
          </>
        </CreditInsightCard>

        <CreditInsightCard
          title="Credit Utilisation Trend"
          className="xl:col-span-7"
          titleClassName="text-base tracking-[0.16px] uppercase text-form-title font-medium"
          headerActions={
            <Typography className="rounded-md border border-[#E4E4E7] bg-[#F6F7F9] px-2 py-1 text-xs font-medium text-[#52525B]">
              Same window as Credit Limit Trend · {selectedPeriod} · {selectedYear}
              {utilTrendFetching ? ' · loading' : ''}
            </Typography>
          }
          contentClassName="h-[365px]"
        >
          <div className="h-full">
            {utilisationChartRows.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-md border border-dashed border-[#E4E4E7] text-sm text-[#71717A]">
                {utilTrendFetching ? 'Loading trend…' : 'No utilisation points for this filter.'}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={utilisationChartRows}
                  margin={{ top: 10, right: 0, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="#E5E7EB"
                    strokeDasharray="0"
                    vertical={true}
                    horizontal={false}
                  />
                  <XAxis
                    dataKey="tick"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    ticks={[0, 20, 40, 60, 80, 100]}
                    domain={[0, 100]}
                    tick={{ fill: '#B3B3C2', fontSize: 12, fontWeight: 500 }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    formatter={(value) => [`${String(value)}%`, 'Utilisation']}
                    contentStyle={{ borderRadius: 8, borderColor: '#E4E4E7', fontSize: 12 }}
                  />
                  <Area
                    type="linear"
                    dataKey="percentage"
                    stroke="none"
                    fill="#8B5CF6"
                    fillOpacity={0.08}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#8B5CF6"
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 1, stroke: '#FFFFFF', fill: '#8B5CF6' }}
                    activeDot={{ r: 5, strokeWidth: 1, stroke: '#FFFFFF', fill: '#8B5CF6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CreditInsightCard>
      </section>

      <div className="flex flex-col gap-4">
        <ApplicationsHistorySection
          rows={applicationHistoryRows}
          isLoading={applicationsListFetching && applicationHistoryRows.length === 0}
          onView={(applicationId) => {
            void navigate(`/credit-request?applicationId=${encodeURIComponent(applicationId)}`);
          }}
        />

        <CreditLimitRequestHistorySection
          rows={limitRequestsResponse?.data?.items ?? []}
          isLoading={limitRequestsFetching}
        />

        <CreditOverviewHistoryCard
          title="Recent Credit Activity"
          headerEnd={
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-md border-[#C9CDD7] bg-[#F6F7F9] px-2 text-xs font-medium text-gray-900"
              onClick={() => {
                void navigate('/credit-request/full-log');
              }}
            >
              View Full History <ArrowUpRight className="size-3.5" />
            </Button>
          }
        >
          <div className="w-full overflow-x-auto">
            <CreditActivityTable
              rows={recentActivityRows}
              isLoading={recentActivityFetching}
              emptyMessage="No credit activity to show."
              showStatusColumn
              statusColumnLabel="Severity"
              variant="history"
              onRowClick={(row) => {
                setSelectedEvent(row);
                setIsEventDrawerOpen(true);
              }}
            />
          </div>
        </CreditOverviewHistoryCard>
      </div>

      <Dialog
        open={limitIncreaseOpen}
        onOpenChange={(open) => {
          setLimitIncreaseOpen(open);
          if (!open) {
            setLimitIncreaseRequested('');
            setLimitIncreaseReason('');
          }
        }}
      >
        <DialogContent className="h-auto max-h-[calc(100vh-2rem)] max-w-[500px] gap-3 overflow-y-auto rounded-xl border border-[#E4E4E7] p-5 sm:h-auto">
          <DialogHeader>
            <DialogTitle>Request Credit Limit Increase</DialogTitle>
            <DialogDescription>
              Snapshot your current operational limit as the baseline. Submit one pending request
              per organisation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-0.5">
            <div className="space-y-1.5">
              <Typography
                variant="label"
                color="muted"
                component="label"
                htmlFor="current-limit-ro"
              >
                Current credit limit
              </Typography>
              <Input
                id="current-limit-ro"
                readOnly
                value={
                  formatOverviewMoneyPounds(currentLimitForModal) ?? String(currentLimitForModal)
                }
                className="bg-[#FAFAFA]"
              />
            </div>
            <div className="space-y-1.5">
              <Typography variant="label" color="text" component="label" htmlFor="requested-limit">
                Requested limit <span className="text-destructive">*</span>
              </Typography>
              <Input
                id="requested-limit"
                placeholder="Enter amount (GBP)"
                value={limitIncreaseRequested}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setLimitIncreaseRequested(event.target.value)
                }
              />
              {(() => {
                const cleaned = limitIncreaseRequested.replace(/[£,\s]/g, '');
                const next = Number.parseFloat(cleaned);
                if (!Number.isFinite(next) || currentLimitForModal <= 0) return null;
                const delta = next - currentLimitForModal;
                const pct =
                  Number.isFinite(delta) && currentLimitForModal !== 0
                    ? ((delta / currentLimitForModal) * 100).toFixed(1)
                    : null;
                return (
                  <Typography
                    component="div"
                    variant="caption"
                    color="muted"
                    className="text-[12px]"
                  >
                    Adjustment{' '}
                    <span className="font-semibold text-[#18181B]">
                      {delta >= 0 ? 'Increase' : 'Decrease'}
                    </span>
                    {' · '}Change{' '}
                    <span className="font-semibold text-[#18181B]">
                      {delta >= 0 ? '+' : ''}
                      {formatOverviewMoneyPounds(delta) ?? '—'}
                      {pct != null ? ` (${pct}%)` : ''}
                    </span>
                  </Typography>
                );
              })()}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Typography variant="label" color="text" component="label" htmlFor="limit-reason">
                  Reason <span className="text-destructive">*</span>
                </Typography>
                <span className="text-[11px] text-[#9CA3AF]">
                  {limitIncreaseReason.length} / 500
                </span>
              </div>
              <Textarea
                id="limit-reason"
                placeholder="Explain why your organisation requires a higher facility…"
                value={limitIncreaseReason}
                maxLength={500}
                className="min-h-[124px]"
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setLimitIncreaseReason(event.target.value)
                }
              />
            </div>
          </div>
          <div className="mt-2 flex justify-end gap-2 border-t border-[#E4E4E7] pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => setLimitIncreaseOpen(false)}
              disabled={limitIncreaseSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleSubmitLimitIncrease()}
              disabled={limitIncreaseSaving}
            >
              {limitIncreaseSaving ? 'Sending…' : 'Send Request'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Drawer open={isEventDrawerOpen} onOpenChange={setIsEventDrawerOpen} direction="right">
        <DrawerContent
          maxWidthClass="sm:max-w-3xl"
          showClose={false}
          className="h-full w-full overflow-x-hidden overflow-y-auto rounded-l-2xl border-l border-[#CBCBD8] bg-[#FBFBFC] p-0 shadow-[-9px_0px_20px_rgba(0,0,0,0.02)]"
        >
          {selectedEvent && (
            <div className="flex h-full flex-col overflow-x-hidden">
              <div className="sticky top-0 z-20 border-b border-[#E2E8F0] bg-white px-5 py-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => setIsEventDrawerOpen(false)}
                  >
                    <ArrowLeft className="size-4" />
                  </Button>
                  <div className="flex flex-col">
                    <Typography component="div" className="text-xl font-semibold text-form-title">
                      Event Details
                    </Typography>
                    <div className="flex items-center gap-1">
                      <Typography component="div" className="text-xs font-medium text-[#71717A]">
                        Audit Ref: {selectedEventRef}
                      </Typography>
                      <Copy className="size-3 text-[#A1A1AA]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-5 px-5 py-5">
                <div className="border-b border-[#E2E8F0] pb-5">
                  <Typography
                    component="div"
                    className="mb-4 text-base font-semibold uppercase text-[#71717A]"
                  >
                    Meta Data
                  </Typography>
                  <div className="space-y-2.5 pl-3">
                    <div className="grid grid-cols-[120px_1fr] items-center gap-6 text-sm">
                      <span className="text-right text-[#18181B]">Audit Ref</span>
                      <span className="text-form-title">{selectedEventRef}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-6 text-sm">
                      <span className="text-right text-[#18181B]">Timestamp</span>
                      <span className="text-form-title">{selectedEvent.timestampDisplay}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-6 text-sm">
                      <span className="text-right text-[#18181B]">User Type</span>
                      <Badge
                        className={cn(
                          'w-fit border',
                          USER_TYPE_BADGE_CLASS_EXTENDED[selectedEvent.userType]
                        )}
                      >
                        {selectedEvent.userType}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-6 text-sm">
                      <span className="text-right text-[#18181B]">Severity</span>
                      <Badge
                        className={cn(
                          'w-fit border',
                          SEVERITY_BADGE_CLASS_EXTENDED[selectedEvent.severity]
                        )}
                      >
                        {selectedEvent.severity}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-start gap-6 text-sm">
                      <span className="text-right text-[#18181B]">Event Type</span>
                      <span className="uppercase text-[#18181B]">
                        {selectedEvent.rawEventType.replaceAll(' ', '_')}
                      </span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-start gap-6 text-sm">
                      <span className="text-right text-[#18181B]">Summary</span>
                      <span className="text-[#18181B]">{selectedEvent.description}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-start gap-6 text-sm">
                      <span className="text-right text-[#18181B]">Actor</span>
                      <span className="underline text-[#18181B]">{selectedEvent.actedBy}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-6 text-sm">
                      <span className="text-right text-[#18181B]">Session ID</span>
                      <span className="text-[#18181B]">sess-u6jnn7q7</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-6 text-sm">
                      <span className="text-right text-[#18181B]">IP Address</span>
                      <span className="text-[#18181B]">{selectedEvent.ipAddress}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-6 text-sm">
                      <span className="text-right text-[#18181B]">User Agent</span>
                      <span className="inline-flex items-center gap-2 text-[#18181B]">
                        {renderDeviceIcon(selectedEvent.device)}
                        {selectedEvent.browser} on {selectedEvent.os} ({selectedEvent.device})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-b border-[#E2E8F0] pb-5">
                  <Typography
                    component="div"
                    className="mb-4 text-base font-semibold uppercase text-[#71717A]"
                  >
                    Entity Information
                  </Typography>
                  <div className="space-y-2.5 pl-3 text-sm">
                    <div className="grid grid-cols-[120px_1fr] gap-6">
                      <span className="text-right text-[#18181B]">Entity Type</span>
                      <span className="text-[#18181B]">Credit</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-6">
                      <span className="text-right text-[#18181B]">Entity Ref</span>
                      <span className="underline text-[#18181B]">{selectedEvent.id}</span>
                    </div>
                  </div>
                </div>

                <div className="border-b border-[#E2E8F0] pb-5">
                  <Typography
                    component="div"
                    className="mb-4 text-base font-semibold uppercase text-[#71717A]"
                  >
                    Action Details
                  </Typography>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-[120px_1fr] gap-6 pl-3">
                      <span className="text-right text-[#18181B]">Action</span>
                      <span className="text-[#18181B]">Create</span>
                    </div>
                    <div>
                      <Typography
                        component="div"
                        className="mb-1 text-xs font-medium text-[#71717A]"
                      >
                        Before:
                      </Typography>
                      <div className="rounded-[3px] border border-[rgba(239,68,68,0.13)] bg-[rgba(239,68,68,0.05)] px-3 py-2 text-xs text-form-body">
                        {`{}`}
                      </div>
                    </div>
                    <div>
                      <Typography
                        component="div"
                        className="mb-1 text-xs font-medium text-[#71717A]"
                      >
                        After:
                      </Typography>
                      <div className="rounded-[3px] border border-[rgba(59,130,246,0.13)] bg-[rgba(59,130,246,0.05)] px-3 py-2 text-xs text-form-body whitespace-pre-wrap">
                        Preview payload unavailable for this audit entry type.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-b border-[#E2E8F0] pb-5">
                  <Typography
                    component="div"
                    className="mb-4 text-base font-semibold uppercase text-[#71717A]"
                  >
                    Related Events
                  </Typography>
                  <div className="space-y-2 text-sm">
                    <div className="underline text-[#18181B]">AUD-2026-00018235</div>
                    <div className="underline text-[#18181B]">AUD-2026-00018236</div>
                  </div>
                </div>

                <div className="border-b border-[#E2E8F0] pb-5">
                  <Typography
                    component="div"
                    className="mb-4 text-base font-semibold uppercase text-[#71717A]"
                  >
                    Integrity Verification
                  </Typography>
                  <div className="break-all rounded-[3px] border border-[#CBCBD8] bg-[rgba(203,203,216,0.44)] px-3 py-2 text-xs font-medium text-[#71717A]">
                    SHA-256: A0fa57601b35ee160d2158a589f3b10e1c42485ddd03f5307932f13c9257500e
                  </div>
                </div>

                <div className="pb-3">
                  <Typography
                    component="div"
                    className="mb-4 text-base font-semibold uppercase text-[#71717A]"
                  >
                    Context Timeline
                  </Typography>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between rounded-[3px] border border-[rgba(59,130,246,0.52)] bg-[rgba(59,130,246,0.05)] px-3 py-2">
                      <div className="text-[#18181B]">
                        <div>23/10/26</div>
                        <div>08:12:34.000</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-[rgba(113,113,122,0.15)] text-[#71717A]">Info</Badge>
                        <span className="min-w-0 wrap-break-word uppercase text-[#18181B]">
                          CREDIT_APLICATION_SUBMITTED
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-[3px] px-3 py-2">
                      <div className="text-[#18181B]">
                        <div>23/10/26</div>
                        <div>08:12:34.000</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-[rgba(113,113,122,0.15)] text-[#71717A]">Info</Badge>
                        <span className="min-w-0 wrap-break-word uppercase text-[#18181B]">
                          LOGIN_SUCCESS
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
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
