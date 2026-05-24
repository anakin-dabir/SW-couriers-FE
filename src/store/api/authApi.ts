import { baseApi } from './baseApi';
import type { ApiResponse } from './types';
import type { AuthUserBrief } from '@/types/auth';

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  success: boolean;
  message: string;
  data?: {
    id: string;
    email: string;
    organization_id?: string;
    organization?: {
      id?: string;
    };
    first_name?: string;
    last_name?: string;
    role?: string;
    created_at?: string;
  };
  tokens?: {
    access_token: string;
    access_token_expires_in: number;
  };
  error?: {
    code: string;
    details?: Array<{
      field: string;
      message: string;
      type?: string;
    }>;
  };
}

export interface RequestPasswordResetRequestDto {
  email: string;
}

export interface RequestPasswordResetResponseDto {
  success: boolean;
  message: string;
  error?: {
    code: string;
    details?: Array<{
      field: string;
      message: string;
      type?: string;
    }>;
  };
}

export interface ConfirmPasswordResetRequestDto {
  password_reset_token: string;
  new_password: string;
}

export interface ConfirmPasswordResetResponseDto {
  success: boolean;
  message: string;
  error?: {
    code: string;
    details?: Array<{
      field: string;
      message: string;
      type?: string;
    }>;
  };
}

export interface VerifyPasswordResetOtpRequestDto {
  email: string;
  otp: string;
}

export interface VerifyPasswordResetOtpResponseDto {
  success: boolean;
  message: string;
  data?: {
    password_reset_token: string;
    expires_in: number;
    expires_at: string;
    message?: string;
  };
  error?: {
    code: string;
    details?: Array<{
      field: string;
      message: string;
      type?: string;
    }>;
  };
}

export interface ValidateInviteTokenResponseDto {
  success: boolean;
  data?: {
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    role: string;
  };
  message?: string;
  error?: {
    code: string;
    details?: Array<{
      field: string;
      message: string;
      type?: string;
    }>;
  };
}

export interface ActivateInviteRequestDto {
  token: string;
  password: string;
}

export interface ActivateInviteResponseDto {
  success: boolean;
  message: string;
  error?: {
    code: string;
    details?: Array<{
      field: string;
      message: string;
      type?: string;
    }>;
  };
}

/** POST body for `/auth/request-invite-link` (expired invite resend). */
export interface RequestInviteResendRequestDto {
  email: string;
}

export type RequestInviteResendResponseDto = RequestPasswordResetResponseDto;

export interface AuthSessionItemDto {
  session_id: string;
  device_label: string;
  browser_family: string;
  os_family: string;
  is_mobile: boolean;
  is_tablet: boolean;
  is_pc: boolean;
  user_agent: string;
  ip_address: string;
  location_label: string | null;
  last_seen_at: string;
  inactivity_expires_at: string;
  current: boolean;
}

export interface AuthSessionsResponseDto {
  items: AuthSessionItemDto[];
}

export interface ChangePasswordRequestDto {
  current_password: string;
  new_password: string;
}

export interface ChangePasswordResponseDto {
  success: boolean;
  message: string;
  error?: {
    code: string;
    details?: Array<{
      field: string;
      message: string;
      type?: string;
    }>;
  };
}

function isApiResponseWithData(value: unknown): value is ApiResponse<AuthUserBrief> {
  return Boolean(value && typeof value === 'object' && 'data' in value);
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponseDto, LoginRequestDto>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),
    getMe: build.query<AuthUserBrief, void>({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
      transformResponse: (response: AuthUserBrief | ApiResponse<AuthUserBrief>) =>
        isApiResponseWithData(response) ? response.data : response,
    }),
    requestPasswordReset: build.mutation<
      RequestPasswordResetResponseDto,
      RequestPasswordResetRequestDto
    >({
      query: (body) => ({
        url: '/auth/request-password-reset',
        method: 'POST',
        body,
      }),
    }),
    confirmPasswordReset: build.mutation<
      ConfirmPasswordResetResponseDto,
      ConfirmPasswordResetRequestDto
    >({
      query: ({ password_reset_token, new_password }) => ({
        url: '/auth/confirm-password-reset',
        method: 'POST',
        headers: {
          'x-password-reset-token': password_reset_token.trim(),
        },
        body: {
          new_password,
        },
      }),
    }),
    verifyPasswordResetOtp: build.mutation<
      VerifyPasswordResetOtpResponseDto,
      VerifyPasswordResetOtpRequestDto
    >({
      query: (body) => ({
        url: '/auth/verify-password-reset-otp',
        method: 'POST',
        body,
      }),
    }),
    validateInviteToken: build.mutation<ValidateInviteTokenResponseDto, { token: string }>({
      query: ({ token }) => ({
        url: '/auth/invites/validate',
        method: 'POST',
        headers: {
          'X-Invite-Token': token,
        },
      }),
    }),
    activateInvite: build.mutation<ActivateInviteResponseDto, ActivateInviteRequestDto>({
      query: ({ token, password }) => ({
        url: '/auth/invites/activate',
        method: 'POST',
        headers: {
          'X-Invite-Token': token,
        },
        body: {
          password,
        },
      }),
    }),
    requestInviteResend: build.mutation<
      RequestInviteResendResponseDto,
      RequestInviteResendRequestDto
    >({
      query: (body) => ({
        url: '/auth/request-invite-link',
        method: 'POST',
        body,
      }),
    }),
    getActiveSessions: build.query<ApiResponse<AuthSessionsResponseDto>, void>({
      query: () => ({
        url: '/auth/session',
        method: 'GET',
      }),
    }),
    logoutCurrentSession: build.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/auth/session/logout',
        method: 'POST',
      }),
    }),
    logoutAllSessions: build.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/auth/session/logout-all',
        method: 'POST',
      }),
    }),
    logoutOtherSessions: build.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/auth/session/logout-other',
        method: 'POST',
      }),
    }),
    changePassword: build.mutation<ChangePasswordResponseDto, ChangePasswordRequestDto>({
      query: (body) => ({
        url: '/auth/change-password',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
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
} = authApi;
