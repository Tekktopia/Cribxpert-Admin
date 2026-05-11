/**
 * Main store export - uses enhanced store configuration
 * This is the main entry point for the Redux store
 */

// Export everything from the enhanced store
export { store, type RootState, type AppDispatch } from "./enhancedStore";

// Export typed hooks for components
export { useAppDispatch, useAppSelector } from "./hooks";

// Export auth slice and actions
export { authSlice, setSession, setProfile, clearSession, setAuthLoading, setAuthError } from "./slices/authSlice";
export { securitySlice } from "./slices/securitySlice";
export { uiSlice } from "./slices/uiSlice";
export { listingSlice } from "./slices/listingSlice";

// Export security-integrated hooks
export {
  useSecureAuth,
  useSecureApi,
  useSecurityStatus,
  useSecureFormSubmission,
} from "./securityHooks";

// Export API endpoints
export {
  useGetDashboardMetricsQuery,
  useGetUsersQuery,
  useGetListingsQuery,
  useGetBookingsQuery,
  useGetRecentActivitiesQuery,
  useGetNotificationsQuery,
  useUpdateUserStatusMutation,
} from "./api/dashboard";
