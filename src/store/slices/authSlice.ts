/**
 * Authentication state slice
 * Manages user authentication state with security integration
 */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import SecureTokenStorage from "@/utils/secureStorage";

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  fullName?: string;
  roles?: Record<string, number>;
  [key: string]: string | Record<string, number> | undefined;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  lastActivity: number;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: false,
  error: null,
  lastActivity: Date.now(),
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Login actions
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    loginSuccess: (
      state,
      action: PayloadAction<{ user: UserData; token: string }>
    ) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoading = false;
      state.error = null;
      state.lastActivity = Date.now();

      // Store token in sessionStorage (as requested)
      if (typeof window !== "undefined") {
        sessionStorage.setItem("accessToken", action.payload.token);
      }
      
      // Also store token securely for consistency
      SecureTokenStorage.setToken(action.payload.token);
      SecureTokenStorage.setUserData(action.payload.user);
    },

    loginFailure: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.isLoading = false;
      state.error = action.payload;

      // Clear any existing tokens
      SecureTokenStorage.clearToken();
    },

    // Logout actions
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      state.lastActivity = Date.now();

      // Clear sessionStorage (as requested)
      if (typeof window !== "undefined") {
        sessionStorage.clear();
      }

      // Clear secure storage
      SecureTokenStorage.clearToken();
    },

    // Clear auth state (for 401 errors)
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = "Session expired";

      // Clear secure storage
      SecureTokenStorage.clearToken();
    },

    // Update last activity (for session management)
    updateActivity: (state) => {
      state.lastActivity = Date.now();
    },

    // Update user data
    updateUser: (
      state,
      action: PayloadAction<{
        id?: string;
        email?: string;
        name?: string;
        role?: string;
      }>
    ) => {
      if (state.user) {
        // Update specific fields
        if (action.payload.id) state.user.id = action.payload.id;
        if (action.payload.email) state.user.email = action.payload.email;
        if (action.payload.name) state.user.name = action.payload.name;
        if (action.payload.role) state.user.role = action.payload.role;

        // Store updated user data
        SecureTokenStorage.setUserData(state.user);
      }
    },

    // Initialize from stored data
    initializeAuth: (state) => {
      const token = SecureTokenStorage.getToken();
      const userData = SecureTokenStorage.getUserData();

      if (token && userData) {
        state.isAuthenticated = true;
        state.user = userData as UserData;
        state.token = token;
        state.lastActivity = Date.now();
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearAuth,
  updateActivity,
  updateUser,
  initializeAuth,
} = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectIsAuthLoading = (state: { auth: AuthState }) =>
  state.auth.isLoading;
