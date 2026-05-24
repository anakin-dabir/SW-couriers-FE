/**
 * API exports
 * Central export point for all API-related functionality
 */

export { baseApi } from './baseApi';
export type { ApiError, ApiResponse, PaginatedResponse, QueryParams } from './types';
export {
  getErrorMessage,
  formatApiError,
  isFetchBaseQueryError,
  isErrorWithMessage,
} from './utils';
export {
  extractApiErrorMessageFromBody,
  parseClientValidationFromFetchError,
  parseValidationErrorBody,
  summarizeValidationDetailMessages,
} from './apiErrorBody';
export type { ApiValidationErrorDetail, ParsedApiValidationError } from './apiErrorBody';

// Export auth API
export {
  authApi,
  useLoginMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useRequestPasswordResetMutation,
  useConfirmPasswordResetMutation,
  useVerifyPasswordResetOtpMutation,
  useValidateInviteTokenMutation,
  useActivateInviteMutation,
  useRequestInviteResendMutation,
  useGetActiveSessionsQuery,
  useLogoutCurrentSessionMutation,
  useLogoutAllSessionsMutation,
  useLogoutOtherSessionsMutation,
  useChangePasswordMutation,
} from './authApi';
export type {
  LoginRequestDto,
  LoginResponseDto,
  RequestPasswordResetRequestDto,
  RequestPasswordResetResponseDto,
  ConfirmPasswordResetRequestDto,
  ConfirmPasswordResetResponseDto,
  VerifyPasswordResetOtpRequestDto,
  VerifyPasswordResetOtpResponseDto,
  ValidateInviteTokenResponseDto,
  ActivateInviteRequestDto,
  ActivateInviteResponseDto,
  AuthSessionItemDto,
  AuthSessionsResponseDto,
  ChangePasswordRequestDto,
  ChangePasswordResponseDto,
} from './authApi';

export {
  auditLogsApi,
  useGetAuditLogsSummaryQuery,
  useGetAuditLogsTrendQuery,
  useGetAuditLogsQuery,
  useGetAuditLogDetailQuery,
  useGetDataAccessLogsQuery,
  useGetChangeHistoryLogsQuery,
  useCompareAuditSnapshotsMutation,
  useGetFieldHistoryQuery,
  useGetAuditSavedViewsQuery,
  useCreateAuditSavedViewMutation,
  useDeleteAuditSavedViewMutation,
} from './auditLogsApi';
export type {
  AuditLogsSummaryDto,
  AuditLogItemDto,
  AuditLogDetailDto,
  AuditLogsListDto,
  AuditTrendDto,
  AuditTrendPointDto,
  GetAuditLogsQueryArgs,
  GetDataAccessLogsQueryArgs,
  GetChangeHistoryLogsQueryArgs,
  ChangeHistoryItemDto,
  ChangeHistoryListDto,
  CompareSnapshotsBody,
  AuditCompareRowDto,
  FieldHistoryItemDto,
  FieldHistoryDataDto,
  FieldHistoryPointDto,
  AuditSavedViewDto,
  CreateAuditSavedViewBody,
} from './auditLogsApi';

// Export todos API (JSONPlaceholder)
export {
  todosApi,
  useGetTodosQuery,
  useGetTodoByIdQuery,
  useGetTodosByUserIdQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  usePatchTodoMutation,
  useDeleteTodoMutation,
  useLazyGetTodosQuery,
  useLazyGetTodoByIdQuery,
  useLazyGetTodosByUserIdQuery,
} from './todosApi';
export type { Todo, CreateTodoDto, UpdateTodoDto } from './todosApi';

export {
  creditApplicationsApi,
  useCreateCreditApplicationMutation,
  useCreateCreditApplicationDraftMutation,
  useUpdateCreditApplicationDraftMutation,
  useGetCreditApplicationDraftQuery,
  useListCreditApplicationDraftsQuery,
  useDeleteCreditApplicationDraftMutation,
  usePublishCreditApplicationDraftMutation,
  useGetCurrentCreditApplicationQuery,
  useGetCreditApplicationByIdQuery,
  useDeleteCreditApplicationMutation,
} from './creditApplicationsApi';
export type {
  CreditApplicationPayload,
  CreditApplicationDetail,
  CreditDraftDetailResponse,
  CreditDraftListData,
  CreditTradeReferenceInput,
  CreditBankAccountType,
  CreditIndustry,
  CreditNumberOfEmployees,
} from './creditApplicationsApi';

export {
  creditOverviewApi,
  useGetCreditOverviewQuery,
  useGetCreditAccountOverviewQuery,
  useGetCreditLimitTrendQuery,
  useGetCreditUtilisationTrendQuery,
  useGetCreditActivityQuery,
  useListCreditLimitIncreaseRequestsQuery,
  useGetCreditLimitIncreaseRequestByIdQuery,
  useCreateCreditLimitIncreaseRequestMutation,
} from './creditOverviewApi';
export type {
  CreditOverviewData,
  CreditOverviewAccount,
  CreditAccountOverview,
  CreditTrendPoint,
  CreditTrendGranularity,
  CreditActivityItemDto,
  CreditActivityListData,
  GetCreditTrendArgs,
  GetCreditActivityArgs,
  ListCreditLimitIncreaseRequestsArgs,
  CreateCreditLimitIncreaseRequestBody,
  CreditLimitIncreaseRequestItem,
  CreditLimitIncreaseRequestListData,
  CreditLimitIncreaseUserRef,
  CreditLimitIncreaseRequestDetailDto,
} from './creditOverviewApi';
export { CREDIT_ACTIVITY_FILTER_EVENT_TYPES } from './creditOverviewApi';

export {
  refundsApi,
  useGetBillingRefundsQuery,
  useGetBillingRefundKpisQuery,
  useGetBillingRefundDetailQuery,
} from './refundsApi';
export type {
  BillingRefundStatus,
  BillingRefundType,
  BillingRefundMethod,
  BillingRefundReasonCategory,
  BillingRefundListItem,
  BillingRefundListResponse,
  BillingRefundKpis,
  BillingRefundDetail,
  BillingRefundDetailResponse,
  GetBillingRefundsArgs,
  GetBillingRefundKpisArgs,
} from './refundsApi';
export {
  BILLING_REFUND_FILTER_STATUSES,
  BILLING_REFUND_FILTER_TYPES,
  BILLING_REFUND_FILTER_METHODS,
  BILLING_REFUND_FILTER_REASON_CATEGORIES,
} from './refundsApi';

export {
  creditNotesApi,
  useGetBillingCreditNotesQuery,
  useGetBillingCreditNoteDetailQuery,
  useGetBillingCreditNoteInvoiceCandidatesQuery,
  useApplyBillingCreditNoteMutation,
  useRequestBillingCreditNotePdfMutation,
  useGetBillingCreditNotePdfStatusQuery,
  useGetBillingCreditNotePdfSignedUrlMutation,
} from './creditNotesApi';
export type {
  BillingCreditNoteStatus,
  BillingCreditNoteReasonCategory,
  BillingCreditNoteSortBy,
  BillingSortOrder,
  BillingCreditNoteListItem,
  BillingCreditNotesListResponse,
  BillingCreditNoteApplication,
  BillingCreditNoteDetail,
  BillingCreditNoteInvoiceCandidate,
  BillingCreditNoteInvoiceCandidatesResponse,
  BillingCreditNotePdfJobResponse,
  BillingCreditNotePdfStatusResponse,
  BillingCreditNotePdfSignedUrlResponse,
  GetBillingCreditNotesArgs,
  GetBillingCreditNoteInvoiceCandidatesArgs,
  ApplyBillingCreditNoteArgs,
  RequestBillingCreditNoteSignedUrlArgs,
} from './creditNotesApi';
export {
  BILLING_CREDIT_NOTE_FILTER_STATUSES,
  BILLING_CREDIT_NOTE_FILTER_REASON_CATEGORIES,
} from './creditNotesApi';

export {
  invoicesApi,
  INVOICE_FILTER_STATUSES,
  INVOICE_FILTER_PAYMENT_STATUSES,
  useGetInvoicesQuery,
  useGetInvoicesSummaryQuery,
  useGetInvoiceByIdQuery,
  useGetInvoicePaymentsQuery,
  useRequestInvoicePdfMutation,
  useGetInvoicePdfStatusQuery,
  useGetInvoicePdfSignedUrlMutation,
} from './invoicesApi';
export type {
  InvoiceLifecycleStatus,
  InvoicePaymentStatus,
  InvoiceSortBy,
  InvoiceSortOrder,
  InvoicePdfStatus,
  InvoiceListItem,
  InvoicesListResponse,
  InvoiceSummaryResponse,
  InvoiceDetail,
  InvoicePaymentHistoryItem,
  InvoicePaymentsResponse,
  InvoicePdfJobResponse,
  InvoicePdfSignedUrlResponse,
  GetInvoicesArgs,
  GetInvoicePaymentsArgs,
  RequestInvoicePdfArgs,
  RequestInvoicePdfSignedUrlArgs,
} from './invoicesApi';

export {
  useGetBillingPaymentsHistoryQuery,
  useGetBillingPaymentKpisQuery,
  useGetBillingPaymentByIdQuery,
  buildBillingPaymentAllocatedToSummary,
  BILLING_PAYMENT_HISTORY_STATUSES,
  BILLING_PAYMENT_ALLOCATION_STATUSES,
  BILLING_PAYMENT_HISTORY_PROVIDERS,
  normalizeBillingPaymentHistoryStatus,
  normalizeBillingPaymentAllocationStatus,
} from './billingPaymentsApi';
export type {
  BillingPaymentListItem,
  BillingPaymentsHistoryResponse,
  BillingPaymentDetail,
  BillingPaymentAllocationLine,
  BillingPaymentKpis,
  BillingPaymentRemittanceAdvice,
  BillingPaymentHistoryStatus,
  BillingPaymentHistoryAllocationStatus,
  BillingPaymentHistoryProvider,
  GetBillingPaymentsHistoryArgs,
  GetBillingPaymentKpisArgs,
  GetBillingPaymentByIdArgs,
} from './billingPaymentsApi';

export {
  useGetAccountStatementsQuery,
  useGetAccountStatementDetailQuery,
  useGetAccountStatementPreviewQuery,
  useGetAccountStatementSummaryQuery,
  useGenerateAccountStatementMutation,
  useRequestAccountStatementPdfMutation,
  useGetAccountStatementPdfStatusQuery,
  useGetAccountStatementPdfSignedUrlMutation,
} from './accountStatementsApi';
export type {
  AccountStatementListItem,
  AccountStatementDetail,
  AccountStatementPreview,
  AccountStatementSummary,
  AccountStatementLedgerRow,
  AccountStatementLedger,
  GetAccountStatementsArgs,
  AccountStatementPeriodQueryArgs,
  GenerateAccountStatementArgs,
} from './accountStatementsApi';

export {
  ordersApi,
  useGetOrdersQuery,
  useGetOrderDetailQuery,
  useGetDeliveryStopDetailQuery,
  useGetStopNotesQuery,
  useCreateStopNoteMutation,
  useUpdateStopNoteMutation,
  useDeleteStopNoteMutation,
  useUpdateStopPreferencesMutation,
  useUpdateStopServiceTierMutation,
  useUpdateStopDetailsMutation,
  useUpdateStopPackagesMutation,
  useCancelOrderMutation,
  useCancelDeliveryStopMutation,
  useGetOrderMasterLabelQuery,
  useCreateOrderMutation,
  useGetOrderPriceBreakdownMutation,
  useGetOrdersSummaryQuery,
  useGetFailedDeliveriesSummaryQuery,
  useGetFailedDeliveriesQuery,
  useGetOrderReturnsQuery,
  useGetOrderReturnsSummaryQuery,
  useGetOrderDraftsQuery,
  useGetOrderDraftByIdQuery,
  useCreateOrderDraftMutation,
  useUpdateOrderDraftMutation,
  useDeleteOrderDraftMutation,
  useSubmitOrderDraftMutation,
} from './ordersApi';
export type {
  OrdersSummaryPeriod,
  OrderStatus,
  DeliveryPackageStatus,
  OrderListItemDto,
  OrdersListDataDto,
  GetOrdersArgs,
  CreateOrderPackageDto,
  CreateOrderDeliveryStopDto,
  CreateOrderRequestDto,
  CreateOrderResponseDto,
  OrderPriceBreakdownRequestDto,
  OrderPriceBreakdownResponseDto,
  OrderPriceBreakdownDetailDto,
  OrderPriceBreakdownStopDto,
  OrderPriceBreakdownPackageDto,
  OrderPriceBreakdownDiscountDto,
  OrderPriceBreakdownPlanSnapshotDto,
  OrderPriceBreakdownWeightChargeDto,
  OrdersSummaryMetricDto,
  OrdersSummaryDataDto,
  GetOrdersSummaryArgs,
  FailedDeliveriesSummaryDataDto,
  GetFailedDeliveriesSummaryArgs,
  DeliveryStatusEventDto,
  FailedDeliveryPackageDto,
  FailedDeliveryItemDto,
  FailedDeliveriesListDataDto,
  GetFailedDeliveriesArgs,
  ReturnPackageDto,
  ReturnsListItemDto,
  ReturnsListDataDto,
  GetReturnsArgs,
  OrderReturnsSummaryDataDto,
  GetOrderReturnsSummaryArgs,
  OrderDraftListItemDto,
  OrderDraftsListDataDto,
  GetOrderDraftsArgs,
  OrderDraftPayloadDto,
  OrderDraftDetailDto,
  GetOrderDraftByIdArgs,
  CreateOrderDraftArgs,
  UpdateOrderDraftArgs,
  DeleteOrderDraftArgs,
  SubmitOrderDraftArgs,
  SubmitOrderDraftResponseDto,
  OrderDetailDto,
  OrderDetailDeliveryStopDto,
  OrderDetailPackageDto,
  OrderDetailPriceBreakdownDto,
  GetOrderDetailArgs,
} from './ordersApi';

export {
  homeDashboardApi,
  useGetOrganizationByIdQuery,
  useGetOrganizationPaymentDetailsQuery,
} from './homeDashboardApi';
export type {
  OrganizationPricingPlanDto,
  OrganizationDetailsDto,
  OrganizationPaymentMethodDto,
  PaymentMethodDistributionDto,
  OrganizationPaymentDetailsDto,
  GetOrganizationByIdArgs,
  GetOrganizationPaymentDetailsArgs,
} from './homeDashboardApi';

export {
  serviceTiersApi,
  useGetEffectiveServiceTiersForOrgQuery,
  useLazyGetEffectiveServiceTiersForOrgQuery,
  useGetServiceTierByIdQuery,
  useLazyGetServiceTierByIdQuery,
} from './serviceTiersApi';
export type {
  ServiceTier,
  GetServiceTiersResponse,
  GetServiceTierByIdResponse,
  GetServiceTierByIdArg,
} from './serviceTiersApi';
