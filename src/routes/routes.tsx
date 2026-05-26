import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import PrivateRoute from '@/components/routes/PrivateRoute';
import PublicRoute from '@/components/routes/PublicRoute';
import { LoadingScreen } from '@/components/organisms';
import RouteErrorElement from '@/components/ErrorBoundary/RouteErrorElement';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DashboardLayout, HeaderOnlyLayout } from '@/components/templates';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const NewLoginPage = lazy(() => import('@/pages/NewLoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const OTPPage = lazy(() => import('@/pages/OTPPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const DeliveriesPage = lazy(() => import('@/pages/DeliveriesPage'));
const DeliveriesListPage = lazy(() => import('@/pages/DeliveriesListPage'));
const TrackingDeliveriesPage = lazy(() => import('@/pages/TrackingDeliveriesPage'));
const DraftsDeliveriesPage = lazy(() => import('@/pages/DraftsDeliveriesPage'));
const OrdersDraftsPage = lazy(() => import('@/pages/OrdersDraftsPage'));
const OrdersListPage = lazy(() => import('@/pages/OrdersListPage'));
const OrdersFailedDeliveriesPage = lazy(() => import('@/pages/OrdersFailedDeliveriesPage'));
const OrdersReturnedDeliveriesPage = lazy(() => import('@/pages/OrdersReturnedDeliveriesPage'));
const BillingPage = lazy(() => import('../pages/BillingPage'));
const InvoiceDetailPage = lazy(() => import('@/pages/InvoiceDetailPage'));
const CreditRequestPage = lazy(() => import('@/pages/CreditRequestPage'));
const CreditLimitIncreaseFormPage = lazy(() => import('@/pages/CreditLimitIncreaseFormPage'));
const CreditActivityLogPage = lazy(() => import('@/pages/CreditActivityLogPage'));
const InviteTeamPage = lazy(() => import('@/pages/InviteTeamPage'));
const InviteMemberPage = lazy(() => import('@/pages/InviteMemberPage'));
const InviteTeamDetailPage = lazy(() => import('@/pages/InviteTeamDetailPage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const NotificationPreferencesPage = lazy(() => import('@/pages/NotificationPreferencesPage'));
const AuditLogsPage = lazy(() => import('@/pages/AuditLogsPage'));
const SettingsLayout = lazy(() => import('@/components/templates/SettingsLayout'));
const SettingsCompanyDetailsPage = lazy(
  () => import('@/pages/Settings/CompanyDetailsSettingsPage')
);
const SettingsPickupAddressPage = lazy(() => import('@/pages/Settings/PickupAddressPage'));
const SettingsAccountsDetailsPage = lazy(() => import('@/pages/Settings/AccountsDetailsPage'));
const SettingsSecurityPage = lazy(() => import('@/pages/Settings/SecurityPage'));
const ReportsPage = lazy(() => import('@/pages/ReportsPage'));
const SupportPage = lazy(() => import('@/pages/SupportPage'));
const PendingPickupPage = lazy(() => import('@/pages/PendingPickupPage'));
const PickupConfirmationPage = lazy(() => import('@/pages/PickupConfirmationPage'));
const OrderLabelsPage = lazy(() => import('@/pages/OrderLabelsPage'));
const DeliveryDetailPage = lazy(() => import('@/pages/DeliveryDetailPage'));
const DeliveryLabelsPage = lazy(() => import('@/pages/DeliveryLabelsPage'));
const DeliveryStopDetailPage = lazy(() => import('@/pages/DeliveryStopDetailPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function ProtectedRoute({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <PrivateRoute>{children}</PrivateRoute>
      </Suspense>
    </ErrorBoundary>
  );
}

function RedirectToAcceptInvite(): React.JSX.Element {
  const { search } = useLocation();
  return <Navigate to={{ pathname: '/accept-invite', search }} replace />;
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/login" replace />,
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/login',
    element: (
      <ErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <PublicRoute restricted>
            <LoginPage />
          </PublicRoute>
        </Suspense>
      </ErrorBoundary>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/new-login',
    element: <RedirectToAcceptInvite />,
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/accept-invite',
    element: (
      <ErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <NewLoginPage />
        </Suspense>
      </ErrorBoundary>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/register',
    element: (
      <ErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <PublicRoute restricted>
            <RegisterPage />
          </PublicRoute>
        </Suspense>
      </ErrorBoundary>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/otp',
    element: (
      <ErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <PublicRoute restricted>
            <OTPPage />
          </PublicRoute>
        </Suspense>
      </ErrorBoundary>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/forgot-password',
    element: (
      <ErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <PublicRoute restricted>
            <ForgotPasswordPage />
          </PublicRoute>
        </Suspense>
      </ErrorBoundary>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/reset-password',
    element: (
      <ErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <PublicRoute restricted>
            <ResetPasswordPage />
          </PublicRoute>
        </Suspense>
      </ErrorBoundary>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <DashboardPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/orders',
    element: <Navigate to="/orders/list" replace />,
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/orders/list',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <OrdersListPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/orders/tracking',
    element: <Navigate to="/deliveries/tracking" replace />,
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/orders/drafts',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <OrdersDraftsPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/orders/failed-deliveries',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <OrdersFailedDeliveriesPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/orders/returned-deliveries',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <OrdersReturnedDeliveriesPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/deliveries',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <DeliveriesPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/deliveries/list',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <DeliveriesListPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/deliveries/tracking',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <TrackingDeliveriesPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/deliveries/drafts',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <DraftsDeliveriesPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/deliveries/pending',
    element: (
      <ProtectedRoute>
        <HeaderOnlyLayout
          showBackButton={false}
          breadcrumbItems={[
            { label: 'Deliveries', to: '/deliveries' },
            { label: 'New Pickup Request' },
          ]}
        >
          <PendingPickupPage />
        </HeaderOnlyLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/deliveries/pending/confirmation',
    element: (
      <ProtectedRoute>
        <HeaderOnlyLayout
          showBackButton={false}
          breadcrumbItems={[{ label: 'Deliveries', to: '/deliveries' }, { label: 'Add Request' }]}
        >
          {/* Centered success hero — orderId arrives via location state from the stepper. */}
          <OrderLabelsPage />
        </HeaderOnlyLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    // Legacy mock confirmation page kept reachable in case anything deep-links to it.
    path: '/deliveries/pending/confirmation-legacy',
    element: (
      <ProtectedRoute>
        <HeaderOnlyLayout
          showBackButton={false}
          breadcrumbItems={[{ label: 'Deliveries', to: '/deliveries' }, { label: 'Add Request' }]}
        >
          <PickupConfirmationPage />
        </HeaderOnlyLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/deliveries/:id/labels',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          {/* Labels viewer driven by the master-label API. */}
          <OrderLabelsPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    // Legacy mock labels reachable on direct visits.
    path: '/deliveries/:id/labels-legacy',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <DeliveryLabelsPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/deliveries/:id/stop/:stopId',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <DeliveryStopDetailPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/deliveries/:id',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <DeliveryDetailPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/invite-team',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <InviteTeamPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/invite-team/create',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <InviteMemberPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/invite-team/:id',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <InviteTeamDetailPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/billing',
    element: <Navigate to="/billing/invoices" replace />,
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/billing/invoices/:invoiceId',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <InvoiceDetailPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/billing/:section',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <BillingPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/credit-request',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <CreditRequestPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/credit-request/drafts',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <CreditRequestPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/credit-request/new',
    element: (
      <ProtectedRoute>
        <DashboardLayout mainVariant="flush">
          <CreditLimitIncreaseFormPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/credit-request/full-log',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <CreditActivityLogPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/notifications',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <NotificationsPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/notifications/preferences',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <NotificationPreferencesPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/audit-logs',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <AuditLogsPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <SettingsLayout />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
    children: [
      { index: true, element: <Navigate to="company-details" replace /> },
      { path: 'company-details', element: <SettingsCompanyDetailsPage /> },
      { path: 'user-contacts', element: <SettingsPickupAddressPage /> },
      { path: 'pickup-address', element: <Navigate to="../user-contacts" replace /> },
      { path: 'accounts-details', element: <SettingsAccountsDetailsPage /> },
      { path: 'security', element: <SettingsSecurityPage /> },
    ],
  },
  {
    path: '/reports',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <ReportsPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/support',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <SupportPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorElement />,
  },
  {
    path: '*',
    element: (
      <ErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <NotFoundPage />
        </Suspense>
      </ErrorBoundary>
    ),
    errorElement: <RouteErrorElement />,
  },
];

export const router = createBrowserRouter(routes);
