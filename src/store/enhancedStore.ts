/**
 * Enhanced Redux store with security state management
 */
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { dashboardApi } from "./api/dashboard";
import { authSlice } from "./slices/authSlice";
import { securitySlice } from "./slices/securitySlice";
import { uiSlice } from "./slices/uiSlice";
import { listingSlice } from "./slices/listingSlice";

export const store = configureStore({
  reducer: {
    // API slices
    [dashboardApi.reducerPath]: dashboardApi.reducer,

    // State slices
    auth: authSlice.reducer,
    security: securitySlice.reducer,
    ui: uiSlice.reducer,
    listing: listingSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          // Ignore RTK Query actions that contain non-serializable values
          "persist/PERSIST",
          "persist/REHYDRATE",
        ],
      },
    }).concat(dashboardApi.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

// Enable listener behavior for the store
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for components
export { useAppDispatch, useAppSelector } from "./hooks";
