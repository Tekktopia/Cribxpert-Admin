import authReducer, {
  setUser,
  setToken,
  setLoading,
  setError,
  clearUser,
} from './authSlice';

import {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
} from './authService';

export {
  setUser,
  setToken,
  setLoading,
  setError,
  clearUser,
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
};

export default authReducer;