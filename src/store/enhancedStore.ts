import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { apiSlice } from "@/api/apiSlice";
import { dashboardApi } from "./api/dashboard";

// Register all API endpoints by importing their slices
import "@/api/features/auth/authApiSlice";
import "@/api/features/adminDashboard/adminDashboardApiSlice";
import "@/api/features/adminUserManagement/adminUserManagementApiSlice";
import "@/api/features/adminListingManagement/adminListingManagementApiSlice";
import "@/api/features/adminManagement/adminManagementApiSlice";
import "@/api/features/adminSettings/adminSettingsApiSlice";
import "@/api/features/analytics/analyticsApiSlice";
import "@/api/features/ticket/ticketApiSlice";

import { authSlice } from "./slices/authSlice";
import { securitySlice } from "./slices/securitySlice";
import { uiSlice } from "./slices/uiSlice";
import { listingSlice } from "./slices/listingSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    auth: authSlice.reducer,
    security: securitySlice.reducer,
    ui: uiSlice.reducer,
    listing: listingSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(apiSlice.middleware, dashboardApi.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { useAppDispatch, useAppSelector } from "./hooks";
