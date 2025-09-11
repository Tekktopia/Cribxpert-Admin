/**
 * Security state slice
 * Manages security-related state and monitoring
 *
 * Security note: This file uses controlled object access for rate limit tracking.
 * Endpoint names are validated before use.
 */

/* eslint-disable security/detect-object-injection */

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface SecurityEvent {
  id: string;
  type:
    | "csrf_violation"
    | "rate_limit_exceeded"
    | "csp_violation"
    | "auth_failure"
    | "input_sanitized";
  message: string;
  timestamp: number;
  details?: Record<string, unknown>;
}

interface SecurityState {
  events: SecurityEvent[];
  csrfToken: string | null;
  rateLimitStatus: Record<
    string,
    {
      remaining: number;
      resetTime: number;
    }
  >;
  cspViolations: number;
  isSecurityInitialized: boolean;
  securityLevel: "low" | "medium" | "high";
}

const initialState: SecurityState = {
  events: [],
  csrfToken: null,
  rateLimitStatus: {},
  cspViolations: 0,
  isSecurityInitialized: false,
  securityLevel: "medium",
};

export const securitySlice = createSlice({
  name: "security",
  initialState,
  reducers: {
    // Security initialization
    initializeSecurity: (state) => {
      state.isSecurityInitialized = true;
      state.securityLevel =
        process.env.NODE_ENV === "production" ? "high" : "medium";
    },

    // CSRF token management
    setCsrfToken: (state, action: PayloadAction<string>) => {
      state.csrfToken = action.payload;
    },

    clearCsrfToken: (state) => {
      state.csrfToken = null;
    },

    // Rate limiting status
    updateRateLimitStatus: (
      state,
      action: PayloadAction<{
        endpoint: string;
        remaining: number;
        resetTime: number;
      }>
    ) => {
      const { endpoint, remaining, resetTime } = action.payload;

      // Validate endpoint name for security
      if (
        typeof endpoint === "string" &&
        endpoint.length > 0 &&
        endpoint.length < 200
      ) {
        state.rateLimitStatus[endpoint] = { remaining, resetTime };
      }
    },

    // Security events
    addSecurityEvent: (
      state,
      action: PayloadAction<Omit<SecurityEvent, "id" | "timestamp">>
    ) => {
      const event: SecurityEvent = {
        ...action.payload,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };

      state.events.unshift(event);

      // Keep only last 100 events
      if (state.events.length > 100) {
        state.events = state.events.slice(0, 100);
      }

      // Track CSP violations
      if (event.type === "csp_violation") {
        state.cspViolations++;
      }
    },

    // Clear old security events
    clearSecurityEvents: (state) => {
      state.events = [];
      state.cspViolations = 0;
    },

    // Update security level
    setSecurityLevel: (
      state,
      action: PayloadAction<"low" | "medium" | "high">
    ) => {
      state.securityLevel = action.payload;
    },
  },
});

export const {
  initializeSecurity,
  setCsrfToken,
  clearCsrfToken,
  updateRateLimitStatus,
  addSecurityEvent,
  clearSecurityEvents,
  setSecurityLevel,
} = securitySlice.actions;

// Selectors
export const selectSecurity = (state: { security: SecurityState }) =>
  state.security;
export const selectSecurityEvents = (state: { security: SecurityState }) =>
  state.security.events;
export const selectCsrfToken = (state: { security: SecurityState }) =>
  state.security.csrfToken;
export const selectRateLimitStatus = (state: { security: SecurityState }) =>
  state.security.rateLimitStatus;
export const selectIsSecurityInitialized = (state: {
  security: SecurityState;
}) => state.security.isSecurityInitialized;
export const selectSecurityLevel = (state: { security: SecurityState }) =>
  state.security.securityLevel;
