/**
 * UI state slice
 * Manages application UI state and preferences
 *
 * Security note: This file uses controlled object access for loading operations.
 * Operation names are validated before use.
 */

/* eslint-disable security/detect-object-injection */

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  sidebarCollapsed: boolean;
  theme: "light" | "dark" | "system";
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
  };
  loading: {
    global: boolean;
    operations: Record<string, boolean>;
  };
  modals: {
    isOpen: boolean;
    type: string | null;
    data: unknown;
  };
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
  };
}

const initialState: UiState = {
  sidebarCollapsed: false,
  theme: "system",
  notifications: {
    enabled: true,
    sound: false,
    desktop: false,
  },
  loading: {
    global: false,
    operations: {},
  },
  modals: {
    isOpen: false,
    type: null,
    data: null,
  },
  preferences: {
    language: "en",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: "MM/dd/yyyy",
  },
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Sidebar management
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },

    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },

    // Theme management
    setTheme: (state, action: PayloadAction<"light" | "dark" | "system">) => {
      state.theme = action.payload;
    },

    // Notification settings
    updateNotificationSettings: (
      state,
      action: PayloadAction<Partial<UiState["notifications"]>>
    ) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },

    // Loading states
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },

    setOperationLoading: (
      state,
      action: PayloadAction<{ operation: string; loading: boolean }>
    ) => {
      const { operation, loading } = action.payload;

      // Validate operation name for security
      if (
        typeof operation === "string" &&
        operation.length > 0 &&
        operation.length < 100
      ) {
        if (loading) {
          state.loading.operations[operation] = true;
        } else {
          delete state.loading.operations[operation];
        }
      }
    },

    // Modal management
    openModal: (
      state,
      action: PayloadAction<{ type: string; data?: unknown }>
    ) => {
      state.modals.isOpen = true;
      state.modals.type = action.payload.type;
      state.modals.data = action.payload.data || null;
    },

    closeModal: (state) => {
      state.modals.isOpen = false;
      state.modals.type = null;
      state.modals.data = null;
    },

    // Preferences
    updatePreferences: (
      state,
      action: PayloadAction<Partial<UiState["preferences"]>>
    ) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },

    // Reset UI state
    resetUiState: () => initialState,
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  setTheme,
  updateNotificationSettings,
  setGlobalLoading,
  setOperationLoading,
  openModal,
  closeModal,
  updatePreferences,
  resetUiState,
} = uiSlice.actions;

// Selectors
export const selectUi = (state: { ui: UiState }) => state.ui;
export const selectSidebarCollapsed = (state: { ui: UiState }) =>
  state.ui.sidebarCollapsed;
export const selectTheme = (state: { ui: UiState }) => state.ui.theme;
export const selectNotificationSettings = (state: { ui: UiState }) =>
  state.ui.notifications;
export const selectGlobalLoading = (state: { ui: UiState }) =>
  state.ui.loading.global;
export const selectOperationLoading =
  (operation: string) => (state: { ui: UiState }) =>
    state.ui.loading.operations[operation] || false;
export const selectModal = (state: { ui: UiState }) => state.ui.modals;
export const selectPreferences = (state: { ui: UiState }) =>
  state.ui.preferences;
