// Export all auth-related functionality from a single file

import authReducer, {
  setUser,
  clearUser,
  updateUserProfile,
  clearError,
  setIsAuthenticated,
} from './authSlice';

import {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
} from './authService';

import type { User } from './authTypes';

// Re-export everything
export {
  setUser,
  setIsAuthenticated,
  clearUser,
  updateUserProfile,
  clearError,
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
};

// Re-export types
export type {
  User,
};

// Export the reducer as the default export
export default authReducer;
