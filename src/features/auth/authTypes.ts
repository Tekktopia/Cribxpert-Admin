// authTypes.ts

// User type definition
export interface User {
  _id: string;
  email: string;
  isVerified: boolean;
  accountDisabled: boolean;
  resetPasswordToken: string | null;
  roles: {
    User: number;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
  fullName?: string;
  profileImage?: string;
}

// Auth state interface
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Email verification types
export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerificationResponse {
  user: User;
  message: string;
}

// Resend verification types
export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  message: string;
  user?: string;
}

// Verify email types
export interface VerifyEmailErrorResponse {
  message: string;
  error?: string;
}

// Complete registration types
export interface CompleteRegistrationRequest {
  fullName: string;
  phoneNo: string;
  dob: string;
  password: string;
  id: string;
}

export interface CompleteRegistrationResponse {
  user: User;
  message: string;
}

// Login types
export interface LoginRequest {
  identifier: string; // Can be email or phone number
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  accessToken: string;
}

// Forgot password types
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message?: string;
  data: { message: string };
  status?: number;
}

// Reset password types
export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

// Error response type
export interface ErrorResponse {
  message: string;
  error?: string;
  status?: number;
}