/**
 * Simple Security Hooks for Redux Integration
 * These hooks provide easy ways to use security utilities with your existing Redux store
 */

import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  initializeAuth,
} from "./slices/authSlice";
import SecurityManager from "../utils/securityManager";

/**
 * Simple hook for secure authentication
 */
export function useSecureAuth() {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);

  // Simple login function
  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      try {
        dispatch(loginStart());

        // Use secure fetch for login
        const response = await SecurityManager.secureFetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        if (!response.ok) {
          throw new Error("Login failed");
        }

        const { user, token } = await response.json();

        // Update Redux state (token is already stored by the action)
        dispatch(loginSuccess({ user, token }));

        return { success: true, user };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Login failed";
        dispatch(loginFailure(errorMessage));
        return { success: false, error: errorMessage };
      }
    },
    [dispatch]
  );

  // Simple logout function
  const logoutUser = useCallback(async () => {
    try {
      // Call logout endpoint if needed
      await SecurityManager.secureFetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.warn("Logout endpoint failed:", error);
    } finally {
      // Clear everything regardless of API call success
      dispatch(logout());
    }
  }, [dispatch]);

  // Check auth status on mount
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return {
    // State
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,

    // Actions
    login,
    logout: logoutUser,
  };
}

/**
 * Simple hook for secure API calls
 */
export function useSecureApi() {
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const secureApiCall = useCallback(
    async <T>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<{ data: T | null; error: string | null; loading: boolean }> => {
      setLoading(true);
      try {
        const response = await SecurityManager.secureFetch(endpoint, options);

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired, clear auth
            dispatch(logout());
            throw new Error("Authentication expired. Please login again.");
          }

          if (response.status === 403) {
            throw new Error("Access denied. Insufficient permissions.");
          }

          if (response.status === 429) {
            throw new Error("Too many requests. Please try again later.");
          }

          throw new Error(`API call failed: ${response.statusText}`);
        }

        const data = await response.json();
        return { data, error: null, loading: false };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "API call failed";
        return { data: null, error: errorMessage, loading: false };
      } finally {
        setLoading(false);
      }
    },
    [dispatch]
  );

  return { secureApiCall, loading };
}

/**
 * Simple hook for secure form submissions
 */
export function useSecureFormSubmission() {
  const { secureApiCall } = useSecureApi();

  const submitForm = useCallback(
    async <T>(
      endpoint: string,
      formData: Record<string, unknown>,
      options: RequestInit = {}
    ): Promise<{ data: T | null; error: string | null }> => {
      try {
        // Validate and sanitize form data
        const sanitizedData = SecurityManager.validateFormData(formData);

        // Submit using secure API call
        const result = await secureApiCall<T>(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sanitizedData),
          ...options,
        });

        return { data: result.data, error: result.error };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Form submission failed";
        return { data: null, error: errorMessage };
      }
    },
    [secureApiCall]
  );

  return { submitForm };
}

/**
 * Simple hook for security monitoring
 */
export function useSecurityStatus() {
  const [securityStatus, setSecurityStatus] = useState(() =>
    SecurityManager.getSecurityStatus()
  );

  const refreshSecurityStatus = useCallback(() => {
    const status = SecurityManager.getSecurityStatus();
    setSecurityStatus(status);
  }, []);

  // Refresh security status periodically
  useEffect(() => {
    const interval = setInterval(refreshSecurityStatus, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [refreshSecurityStatus]);

  return {
    securityStatus,
    refreshSecurityStatus,
  };
}

/**
 * Simple hook that combines secure authentication with your existing auth state
 */
export function useAuth() {
  const authState = useAppSelector((state) => state.auth);
  const { login, logout: logoutUser } = useSecureAuth();

  return {
    ...authState,
    login,
    logout: logoutUser,
    isLoggedIn: authState.isAuthenticated,
  };
}

/**
 * Hook for getting secure fetch function
 */
export function useSecureFetch() {
  return useCallback((url: string, options?: RequestInit) => {
    return SecurityManager.secureFetch(url, options);
  }, []);
}

/**
 * Hook for form validation
 */
export function useFormValidation() {
  return useCallback((formData: Record<string, unknown>) => {
    return SecurityManager.validateFormData(formData);
  }, []);
}
