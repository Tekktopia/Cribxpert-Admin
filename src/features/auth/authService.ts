import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/features/api';
import type {
  EmailVerificationRequest,
  EmailVerificationResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  VerifyEmailErrorResponse,
  CompleteRegistrationRequest,
  CompleteRegistrationResponse,
  LoginRequest,
  LoginResponse,
  User,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from './authTypes';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  keepUnusedDataFor: 600, // Cache auth data for 10 minutes
  refetchOnMountOrArgChange: 300, // Only refetch if data is older than 5 minutes
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    getCurrentUser: builder.query<{ message: string; user: User }, void>({
      query: () => '/auth/me',
    }),
    // Google OAuth
    googleAuth: builder.query({
      query: () => '/auth/google',
    }),
    // Email verification
    initiateEmailVerification: builder.mutation<
      EmailVerificationResponse,
      EmailVerificationRequest
    >({
      query: (data) => ({
        url: '/auth/initiate-email-verification',
        method: 'POST',
        body: data,
        // Disable auto redirect following
        responseHandler: (response) => response.json(),
        validateStatus: (response) => response.status === 200,
      }),
    }),
    resendVerification: builder.mutation<
      ResendVerificationResponse,
      ResendVerificationRequest
    >({
      query: (data) => ({
        url: '/auth/resend-verification',
        method: 'POST',
        body: data,
      }),
    }),
    verifyEmail: builder.query<void, string>({
      query: (token) => `/auth/verify-email/${token}`,
      // The API returns a 302 redirect on success
      // RTK Query will follow this redirect, so we handle as void
      transformResponse: () => undefined,
      // Add custom error handling for 404 and 500 responses
      transformErrorResponse: (response: {
        status: number;
        data: VerifyEmailErrorResponse;
      }) => {
        if (response.status === 404) {
          return { message: response.data.message || 'User not found' };
        }
        return {
          message: response.data.message || 'Server error',
          error: response.data.error,
        };
      },
    }),
    // Complete registration
    completeRegistration: builder.mutation<
      CompleteRegistrationResponse,
      CompleteRegistrationRequest
    >({
      query: (data) => ({
        url: '/auth/complete-registration',
        method: 'POST',
        body: data,
      }),
    }),
    // Forgot password
    forgotPassword: builder.mutation<
      ForgotPasswordResponse,
      ForgotPasswordRequest
    >({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),
    // Reset password
    resetPassword: builder.mutation<
      ResetPasswordResponse,
      ResetPasswordRequest
    >({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    // Add OTP verification endpoint
    verifyOtp: builder.mutation({
      query: (data) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useGoogleAuthQuery,
  useInitiateEmailVerificationMutation,
  useResendVerificationMutation,
  useVerifyEmailQuery,
  useCompleteRegistrationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyOtpMutation, // Export the new hook
} = authApi;