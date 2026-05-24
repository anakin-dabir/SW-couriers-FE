import { baseApi } from './baseApi';
import type { ApiResponse } from './types';

export interface ContactPermissionDto {
  resource: string;
  level: 0 | 1 | 2;
}

export interface AddOrgContactRequestDto {
  organizationId: string;
  contact_number: string;
  contact_role: string;
  email: string;
  first_name: string;
  last_name: string;
  permissions: ContactPermissionDto[];
}

export interface UpdateOrgContactRequestDto {
  organizationId: string;
  contactId: string;
  contact_number: string;
  contact_role: string;
  first_name: string;
  last_name: string;
  permissions: ContactPermissionDto[];
}

export interface RemoveOrgContactRequestDto {
  organizationId: string;
  contactId: string;
  reason: string;
}

export interface SendUserInviteRequestDto {
  userId: string;
}

export interface SendUserInviteResponseDto {
  invite_id: string;
  email: string;
}

export interface OrgContactDto {
  id: string;
  organization_id: string;
  contact_number: string;
  contact_role: string;
  status: string;
  is_primary: boolean;
  user_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  permissions: ContactPermissionDto[];
  created_at: string;
  updated_at: string;
}

export interface ListOrgContactsResponseDto {
  owner: OrgContactDto | null;
  team_members: OrgContactDto[];
}

export const contactsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOrgContacts: build.query<
      ApiResponse<ListOrgContactsResponseDto>,
      { organizationId: string }
    >({
      query: ({ organizationId }) => ({
        url: `/organizations/${organizationId}/contacts`,
        method: 'GET',
      }),
      providesTags: (_result, _error, { organizationId }) => [
        { type: 'OrgContacts', id: organizationId },
      ],
    }),
    addOrgContact: build.mutation<ApiResponse<OrgContactDto>, AddOrgContactRequestDto>({
      query: ({ organizationId, ...body }) => ({
        url: `/organizations/${organizationId}/contacts`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { organizationId }) => [
        { type: 'OrgContacts', id: organizationId },
      ],
    }),
    updateOrgContact: build.mutation<ApiResponse<OrgContactDto>, UpdateOrgContactRequestDto>({
      query: ({ organizationId, contactId, ...body }) => ({
        url: `/organizations/${organizationId}/contacts/${contactId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { organizationId }) => [
        { type: 'OrgContacts', id: organizationId },
      ],
    }),
    getOrgContactById: build.query<
      ApiResponse<OrgContactDto>,
      { organizationId: string; contactId: string }
    >({
      query: ({ organizationId, contactId }) => ({
        url: `/organizations/${organizationId}/contacts/${contactId}`,
        method: 'GET',
      }),
    }),
    removeOrgContact: build.mutation<
      ApiResponse<{ success: boolean; message: string }>,
      RemoveOrgContactRequestDto
    >({
      query: ({ organizationId, contactId, reason }) => ({
        url: `/organizations/${organizationId}/contacts/${contactId}`,
        method: 'DELETE',
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { organizationId }) => [
        { type: 'OrgContacts', id: organizationId },
      ],
    }),
    sendUserInvite: build.mutation<
      ApiResponse<SendUserInviteResponseDto>,
      SendUserInviteRequestDto
    >({
      query: ({ userId }) => ({
        url: `/users/${userId}/invite`,
        method: 'POST',
      }),
      invalidatesTags: () => [{ type: 'OrgContacts' }],
    }),
  }),
});

export const {
  useGetOrgContactsQuery,
  useAddOrgContactMutation,
  useUpdateOrgContactMutation,
  useGetOrgContactByIdQuery,
  useRemoveOrgContactMutation,
  useSendUserInviteMutation,
} = contactsApi;
