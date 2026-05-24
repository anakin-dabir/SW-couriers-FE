import { baseApi } from './baseApi';
import type { ApiResponse } from './types';

export type CreditIndustry =
  | 'AGRICULTURE_AND_FARMING'
  | 'AUTOMOTIVE'
  | 'CONSTRUCTION_AND_BUILDING'
  | 'EDUCATION'
  | 'ENERGY_AND_UTILITIES'
  | 'FINANCIAL_SERVICES'
  | 'FOOD_AND_BEVERAGE'
  | 'HEALTHCARE_AND_PHARMACEUTICALS'
  | 'HOME_AND_LIFESTYLE'
  | 'HOSPITALITY_AND_TOURISM'
  | 'IT_AND_TECHNOLOGY'
  | 'LOGISTICS_AND_TRANSPORT'
  | 'MANUFACTURING'
  | 'MEDIA_AND_ENTERTAINMENT'
  | 'PROFESSIONAL_SERVICES'
  | 'REAL_ESTATE'
  | 'RETAIL'
  | 'TELECOMMUNICATIONS'
  | 'WHOLESALE_AND_DISTRIBUTION'
  | 'OTHER'
  // Support alternate server enum variant (`IndustryType`) for backward/forward compatibility.
  | 'ECOMMERCE'
  | 'HOME_LIFESTYLE'
  | 'WHOLESALE_DISTRIBUTION'
  | 'HEALTHCARE_PHARMA'
  | 'TECHNOLOGY_SOFTWARE'
  | 'LOGISTICS_TRANSPORT'
  | 'CONSTRUCTION'
  | 'FOOD_BEVERAGE'
  | 'FINANCE_INSURANCE'
  | 'MEDIA_ENTERTAINMENT';

export type CreditNumberOfEmployees =
  | '1-10 employees'
  | '11-50 employees'
  | '51-200 employees'
  | '201-500 employees'
  | '501-1000 employees'
  | '1000+ employees';

export type CreditBankAccountType = 'BUSINESS_CURRENT' | 'BUSINESS_SAVINGS' | 'OTHER';

export interface CreditTradeReferenceInput {
  company_name?: string | null;
  contact_person?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  account_number_reference?: string | null;
  credit_limit_with_reference?: number | string | null;
  relationship_duration?: string | null;
}

export interface CreditApplicationPayload {
  company_registration_number?: string | null;
  vat_registration_number?: string | null;
  industry?: CreditIndustry | null;
  number_of_employees?: CreditNumberOfEmployees | null;
  date_of_incorporation?: string | null;
  years_trading?: number | null;
  annual_turnover?: number | string | null;
  net_profit?: number | string | null;
  trade_references?: CreditTradeReferenceInput[] | null;
  bank_name?: string | null;
  bank_sort_code?: string | null;
  bank_account_number_last4?: string | null;
  bank_account_type?: CreditBankAccountType | null;
  requested_credit_limit?: number | string | null;
  requested_payment_terms_days?: number | null;
  expected_monthly_spend?: number | string | null;
  seasonal_peaks?: string[] | null;
  justification?: string | null;
  director_signatory_name?: string | null;
  director_signatory_position?: string | null;
  declaration_date?: string | null;
  consent_credit_check?: boolean | null;
  consent_terms_and_conditions?: boolean | null;
  consent_data_processing?: boolean | null;
}

export interface CreditApplicationReferenceLetter {
  id: string;
  url: string;
  filename: string;
}

export interface CreditApplicationBankReference {
  bank_name: string | null;
  bank_sort_code: string | null;
  bank_account_number_last4: string | null;
  bank_account_type: CreditBankAccountType | null;
  reference_letter?: CreditApplicationReferenceLetter | null;
}

export interface CreditTradeReferenceDetail {
  id: string;
  ref_index: number;
  company_name: string | null;
  contact_person: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  account_number_reference?: string | null;
  credit_limit_with_reference?: string | null;
  relationship_duration: string | null;
  verification_status?: string | null;
  verified_at?: string | null;
  verified_by_user_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreditUserRef {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

export interface CreditApplicationDetail {
  id: string;
  organization_id?: string;
  application_number: string;
  state: string;
  status: string;
  company_registration_number: string | null;
  vat_registration_number: string | null;
  industry: string | null;
  number_of_employees: string | null;
  date_of_incorporation: string | null;
  years_trading: number | null;
  annual_turnover: string | null;
  net_profit: string | null;
  trade_references: CreditTradeReferenceDetail[];
  bank_reference: CreditApplicationBankReference | null;
  requested_credit_limit: string | null;
  requested_payment_terms_days: number | null;
  expected_monthly_spend: string | null;
  seasonal_peaks: string[] | null;
  justification: string | null;
  director_signatory_name: string | null;
  director_signatory_position: string | null;
  declaration_date: string | null;
  consent_credit_check: boolean;
  consent_terms_and_conditions: boolean;
  consent_data_processing: boolean;
  submitted_by?: CreditUserRef | null;
  assigned_reviewer?: CreditUserRef | null;
  submitted_at?: string | null;
  reviewer_assigned_at?: string | null;
  references_verified_at?: string | null;
  decided_at?: string | null;
  approved_at?: string | null;
  approved_by?: CreditUserRef | null;
  rejected_at?: string | null;
  rejected_by?: CreditUserRef | null;
  cancelled_at?: string | null;
  cancelled_by?: CreditUserRef | null;
  withdrawn_at?: string | null;
  withdrawn_by?: CreditUserRef | null;
  approved_credit_limit?: string | null;
  approved_payment_terms_days?: number | null;
  review_frequency?: string | null;
  approval_notes?: string | null;
  rejection_category?: string | null;
  rejection_reason?: string | null;
  cancellation_reason?: string | null;
  internal_notes?: string | null;
  created_at: string;
  updated_at: string;
  cooldown?: {
    active?: boolean;
    summary?: string | null;
  } | null;
  pending_credit_limit_increase_request?: Record<string, unknown> | null;
}

export interface CreditDraftDetailResponse {
  id: string;
  draft_number: string;
  created_at: string;
  application: CreditApplicationPayload & {
    trade_references?: CreditTradeReferenceDetail[] | null;
    bank_reference?: CreditApplicationBankReference | null;
  };
}

export interface CreditDraftListItem {
  draft_id: string;
  created_at: string;
  actor: 'ADMIN' | 'CLIENT';
  created_by: {
    id: string;
    email: string;
  };
}

export interface CreditDraftListData {
  items: CreditDraftListItem[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface CreditApplicationListData {
  items: CreditApplicationDetail[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface CreditFailedDocumentItem {
  field?: string;
  filename?: string;
  reason?: string;
}

export interface CreditCommandResult {
  id: string;
  application_number?: string;
  draft_number?: string;
  created_at?: string;
}

export interface CreateCreditApplicationArgs {
  organizationId: string;
  applicationData: CreditApplicationPayload;
  bankReferenceLetterFile?: File | null;
}

export interface CreateCreditDraftArgs {
  organizationId: string;
  draftData: CreditApplicationPayload;
  bankReferenceLetterFile?: File | null;
}

export interface UpdateCreditDraftArgs {
  organizationId: string;
  draftId: string;
  draftData: CreditApplicationPayload;
  deletedBankReferenceLetterId?: string | null;
  bankReferenceLetterFile?: File | null;
}

export interface PublishCreditDraftArgs {
  organizationId: string;
  draftId: string;
  applicationData: CreditApplicationPayload;
  deletedBankReferenceLetterId?: string | null;
  bankReferenceLetterFile?: File | null;
}

export interface CreditDraftDetailArgs {
  organizationId: string;
  draftId: string;
}

export interface CreditApplicationDetailArgs {
  organizationId: string;
  applicationId: string;
}

function buildCreditMultipartBody(params: {
  dataFieldName: 'application_data' | 'draft_data';
  data: CreditApplicationPayload;
  deletedBankReferenceLetterId?: string | null;
  bankReferenceLetterFile?: File | null;
}): FormData {
  const formData = new FormData();
  formData.append(params.dataFieldName, JSON.stringify(params.data));
  if (params.deletedBankReferenceLetterId) {
    formData.append('deleted_bank_reference_letter_id', params.deletedBankReferenceLetterId);
  }
  if (params.bankReferenceLetterFile != null && params.bankReferenceLetterFile.size > 0) {
    formData.append('bank_reference_letter_file', params.bankReferenceLetterFile);
  }
  return formData;
}

export const creditApplicationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createCreditApplication: build.mutation<
      ApiResponse<CreditCommandResult> & { failed_documents?: CreditFailedDocumentItem[] },
      CreateCreditApplicationArgs
    >({
      query: ({ organizationId, applicationData, bankReferenceLetterFile }) => ({
        url: `/organizations/${encodeURIComponent(organizationId)}/credit/applications`,
        method: 'POST',
        body: buildCreditMultipartBody({
          dataFieldName: 'application_data',
          data: applicationData,
          bankReferenceLetterFile,
        }),
      }),
      invalidatesTags: (_result, _error, { organizationId }) => [
        { type: 'CreditCurrentApplication', id: organizationId },
        { type: 'CreditApplication', id: organizationId },
      ],
    }),
    createCreditApplicationDraft: build.mutation<
      ApiResponse<CreditCommandResult> & { failed_documents?: CreditFailedDocumentItem[] },
      CreateCreditDraftArgs
    >({
      query: ({ organizationId, draftData, bankReferenceLetterFile }) => ({
        url: `/organizations/${encodeURIComponent(organizationId)}/credit/applications/drafts`,
        method: 'POST',
        body: buildCreditMultipartBody({
          dataFieldName: 'draft_data',
          data: draftData,
          bankReferenceLetterFile,
        }),
      }),
      invalidatesTags: (_result, _error, { organizationId }) => [
        { type: 'CreditDrafts', id: organizationId },
      ],
    }),
    updateCreditApplicationDraft: build.mutation<
      ApiResponse<CreditCommandResult> & { failed_documents?: CreditFailedDocumentItem[] },
      UpdateCreditDraftArgs
    >({
      query: ({
        organizationId,
        draftId,
        draftData,
        deletedBankReferenceLetterId,
        bankReferenceLetterFile,
      }) => ({
        url: `/organizations/${encodeURIComponent(organizationId)}/credit/applications/drafts/${encodeURIComponent(draftId)}`,
        method: 'PATCH',
        body: buildCreditMultipartBody({
          dataFieldName: 'draft_data',
          data: draftData,
          deletedBankReferenceLetterId,
          bankReferenceLetterFile,
        }),
      }),
      invalidatesTags: (_result, _error, { organizationId, draftId }) => [
        { type: 'CreditDrafts', id: organizationId },
        { type: 'CreditDraftDetail', id: draftId },
      ],
    }),
    getCreditApplicationDraft: build.query<
      ApiResponse<CreditDraftDetailResponse>,
      CreditDraftDetailArgs
    >({
      query: ({ organizationId, draftId }) => ({
        url: `/organizations/${encodeURIComponent(organizationId)}/credit/applications/drafts/${encodeURIComponent(draftId)}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, { draftId }) => [{ type: 'CreditDraftDetail', id: draftId }],
    }),
    listCreditApplicationDrafts: build.query<
      ApiResponse<CreditDraftListData>,
      {
        organizationId: string;
        page?: number;
        size?: number;
      }
    >({
      query: ({ organizationId, page = 1, size = 20 }) => ({
        url: `/organizations/${encodeURIComponent(organizationId)}/credit/applications/drafts`,
        method: 'GET',
        params: { page, size },
      }),
      providesTags: (_result, _error, { organizationId }) => [
        { type: 'CreditDrafts', id: organizationId },
      ],
    }),
    deleteCreditApplicationDraft: build.mutation<
      ApiResponse<{ success?: boolean }>,
      CreditDraftDetailArgs
    >({
      query: ({ organizationId, draftId }) => ({
        url: `/organizations/${encodeURIComponent(organizationId)}/credit/applications/drafts/${encodeURIComponent(draftId)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { organizationId, draftId }) => [
        { type: 'CreditDrafts', id: organizationId },
        { type: 'CreditDraftDetail', id: draftId },
      ],
    }),
    publishCreditApplicationDraft: build.mutation<
      ApiResponse<CreditCommandResult> & { failed_documents?: CreditFailedDocumentItem[] },
      PublishCreditDraftArgs
    >({
      query: ({
        organizationId,
        draftId,
        applicationData,
        deletedBankReferenceLetterId,
        bankReferenceLetterFile,
      }) => ({
        url: `/organizations/${encodeURIComponent(organizationId)}/credit/applications/drafts/${encodeURIComponent(draftId)}/publish`,
        method: 'POST',
        body: buildCreditMultipartBody({
          dataFieldName: 'application_data',
          data: applicationData,
          deletedBankReferenceLetterId,
          bankReferenceLetterFile,
        }),
      }),
      invalidatesTags: (_result, _error, { organizationId, draftId }) => [
        { type: 'CreditCurrentApplication', id: organizationId },
        { type: 'CreditApplication', id: organizationId },
        { type: 'CreditDrafts', id: organizationId },
        { type: 'CreditDraftDetail', id: draftId },
      ],
    }),
    listCreditApplications: build.query<
      ApiResponse<CreditApplicationListData>,
      {
        organizationId: string;
        page?: number;
        size?: number;
      }
    >({
      query: ({ organizationId, page = 1, size = 20 }) => ({
        url: `/organizations/${encodeURIComponent(organizationId)}/credit/applications`,
        method: 'GET',
        params: { page, size },
      }),
      transformResponse(raw: unknown) {
        const obj = raw as { success?: boolean; data?: unknown };
        if (!obj?.success || !obj.data || typeof obj.data !== 'object') {
          return { success: true, data: { items: [], total: 0, page: 1, size: 20, pages: 0 } };
        }
        const wrap = obj.data as Record<string, unknown>;
        const itemsRaw = Array.isArray(wrap.items) ? wrap.items : [];
        const items = itemsRaw as CreditApplicationDetail[];
        const total =
          typeof wrap.total === 'number'
            ? wrap.total
            : Number(wrap.total) > 0
              ? Number(wrap.total)
              : items.length;
        const pageNum =
          typeof wrap.page === 'number' ? wrap.page : Number(wrap.page) > 0 ? Number(wrap.page) : 1;
        const sizeNum =
          typeof wrap.size === 'number'
            ? wrap.size
            : Number(wrap.size) > 0
              ? Number(wrap.size)
              : 20;
        const pages =
          typeof wrap.pages === 'number'
            ? wrap.pages
            : Number(wrap.pages) >= 0
              ? Number(wrap.pages)
              : Math.max(1, Math.ceil(total / sizeNum));
        return {
          success: true,
          data: { items, total, page: pageNum, size: sizeNum, pages },
        };
      },
      providesTags: (_result, _error, { organizationId }) => [
        { type: 'CreditApplication', id: `list-${organizationId}` },
      ],
    }),
    getCurrentCreditApplication: build.query<
      ApiResponse<CreditApplicationDetail>,
      { organizationId: string }
    >({
      query: ({ organizationId }) => ({
        url: `/organizations/${encodeURIComponent(organizationId)}/credit/applications/current-application`,
        method: 'GET',
      }),
      providesTags: (_result, _error, { organizationId }) => [
        { type: 'CreditCurrentApplication', id: organizationId },
      ],
    }),
    getCreditApplicationById: build.query<
      ApiResponse<CreditApplicationDetail>,
      CreditApplicationDetailArgs
    >({
      query: ({ organizationId, applicationId }) => ({
        url: `/organizations/${encodeURIComponent(organizationId)}/credit/applications/${encodeURIComponent(applicationId)}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, { applicationId }) => [
        { type: 'CreditApplication', id: applicationId },
      ],
    }),
    deleteCreditApplication: build.mutation<
      ApiResponse<{ success?: boolean }>,
      CreditApplicationDetailArgs
    >({
      query: ({ organizationId, applicationId }) => ({
        url: `/organizations/${encodeURIComponent(organizationId)}/credit/applications/${encodeURIComponent(applicationId)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { organizationId, applicationId }) => [
        { type: 'CreditCurrentApplication', id: organizationId },
        { type: 'CreditApplication', id: applicationId },
      ],
    }),
  }),
});

export const {
  useCreateCreditApplicationMutation,
  useCreateCreditApplicationDraftMutation,
  useUpdateCreditApplicationDraftMutation,
  useGetCreditApplicationDraftQuery,
  useListCreditApplicationDraftsQuery,
  useDeleteCreditApplicationDraftMutation,
  usePublishCreditApplicationDraftMutation,
  useListCreditApplicationsQuery,
  useGetCurrentCreditApplicationQuery,
  useGetCreditApplicationByIdQuery,
  useDeleteCreditApplicationMutation,
} = creditApplicationsApi;
