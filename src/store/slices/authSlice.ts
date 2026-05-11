import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User, Session } from '@supabase/supabase-js';

interface ProfileData {
  id: string;
  email: string;
  full_name: string | null;
  phone_no: string | null;
  dob: string | null;
  role: string;
  account_disabled: boolean;
  kyc_status: string;
  wallet_status: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  profile: ProfileData | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  session: null,
  isAuthenticated: false,
  isLoading: true, // true on boot so ProtectedRoute waits for session check
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<{ user: User; session: Session }>) => {
      state.user = action.payload.user;
      state.session = action.payload.session;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      sessionStorage.setItem('sb_access_token', action.payload.session.access_token);
    },

    setProfile: (state, action: PayloadAction<ProfileData>) => {
      state.profile = action.payload;
    },

    clearSession: (state) => {
      state.user = null;
      state.profile = null;
      state.session = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      sessionStorage.removeItem('sb_access_token');
    },

    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setSession,
  setProfile,
  clearSession,
  setAuthLoading,
  setAuthError,
} = authSlice.actions;

export const selectCurrentUser    = (state: { auth: AuthState }) => state.auth.user;
export const selectProfile        = (state: { auth: AuthState }) => state.auth.profile;
export const selectSession        = (state: { auth: AuthState }) => state.auth.session;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsAuthLoading  = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError      = (state: { auth: AuthState }) => state.auth.error;

// Compatibility aliases used by PublicRoute / RoleGuard
export const selectIsAuthenticated_ = selectIsAuthenticated;

export default authSlice.reducer;
