import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  getAccessToken,
  getUser,
  setAccessToken,
  setUser,
  removeAccessToken,
  removeUser,
} from '@/lib/cookies';
import type { AuthUser, AuthUserBrief } from '@/types/auth';
import { mapBriefToAuthUser } from '@/types/auth';

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  loginResponse: {
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
  } | null;
  user: AuthUser | null;
}

// Get initial state from cookies
const getInitialState = (): AuthState => {
  const storedToken = getAccessToken();
  const storedUser = getUser();

  return {
    accessToken: storedToken || null,
    isAuthenticated: !!storedToken,
    loginResponse: null,
    user: storedUser,
  };
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        accessToken: string;
        loginResponse: {
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
        };
        user: AuthUser;
      }>
    ) => {
      const { accessToken, loginResponse, user } = action.payload;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.loginResponse = loginResponse;
      state.user = user;

      // Persist to cookies
      setAccessToken(accessToken);
      setUser(user);
    },
    updateAccessToken: (
      state,
      action: PayloadAction<{
        accessToken: string;
        tokens?: {
          access_token: string;
          access_token_expires_in: number;
        };
      }>
    ) => {
      const { accessToken, tokens } = action.payload;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      setAccessToken(accessToken);

      if (tokens) {
        state.loginResponse = state.loginResponse
          ? { ...state.loginResponse, tokens }
          : { success: true, message: 'Session refreshed', tokens };
      }
    },
    clearCredentials: (state) => {
      state.accessToken = null;
      state.isAuthenticated = false;
      state.loginResponse = null;
      state.user = null;

      // Clear cookies
      removeAccessToken();
      removeUser();
    },
    setCurrentUser: (state, action: PayloadAction<AuthUserBrief>) => {
      state.user = mapBriefToAuthUser(action.payload);
      setUser(state.user);
    },
    updateUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
        // Only persist to cookie if all required fields are non-null
        if (state.user.id && state.user.email && state.user.name) {
          setUser({
            id: state.user.id,
            email: state.user.email,
            name: state.user.name,
            first_name: state.user.first_name,
            last_name: state.user.last_name,
            role: state.user.role,
            phone: state.user.phone,
            avatar_url: state.user.avatar_url,
            contact_role: state.user.contact_role,
            region_id: state.user.region_id,
            requires_password_change: state.user.requires_password_change,
            profile_type: state.user.profile_type,
            org_contact: state.user.org_contact,
            created_at: state.user.created_at,
            organization_id: state.user.organization_id,
          });
        }
      }
    },
  },
});

export const { setCredentials, updateAccessToken, clearCredentials, setCurrentUser, updateUser } =
  authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectAccessToken = (state: { auth: AuthState }): string | null =>
  state.auth.accessToken;
export const selectIsAuthenticated = (state: { auth: AuthState }): boolean =>
  state.auth.isAuthenticated;
export const selectUser = (state: { auth: AuthState }): AuthState['user'] => state.auth.user;
