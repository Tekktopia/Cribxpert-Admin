import { apiSlice } from "@/api/apiSlice";

export interface AdminSettingsUser {
  _id: string;
  email: string;
  fullName?: string;
  phoneNo?: string;
  lastLogin?: string;
  twoFactorAuthentication?: boolean;
  bookingsUpdates?: boolean;
  newListingSubmission?: boolean;
  emailAlerts?: boolean;
  // allow extra fields without breaking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface GetAdminProfileResponse {
  user: AdminSettingsUser;
}

export interface UpdateAdminProfileRequest {
  fullName?: string;
  phoneNo?: string;
  email?: string;
  dob?: string | Date;
  twoFactorAuthentication?: boolean;
  bookingsUpdates?: boolean;
  newListingSubmission?: boolean;
  emailAlerts?: boolean;
}

export interface UpdateAdminProfileResponse {
  user: AdminSettingsUser;
}

export interface ChangeAdminPasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeAdminPasswordResponse {
  message: string;
}

export const adminSettingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminProfile: builder.query<GetAdminProfileResponse, void>({
      query: () => ({
        url: "/admin-settings/profile",
        method: "GET",
      }),
    }),
    updateAdminProfile: builder.mutation<
      UpdateAdminProfileResponse,
      UpdateAdminProfileRequest
    >({
      query: (body) => ({
        url: "/admin-settings/profile",
        method: "PATCH",
        body,
      }),
    }),
    changeAdminPassword: builder.mutation<
      ChangeAdminPasswordResponse,
      ChangeAdminPasswordRequest
    >({
      query: (body) => ({
        url: "/admin-settings/change-password",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAdminProfileQuery,
  useUpdateAdminProfileMutation,
  useChangeAdminPasswordMutation,
} = adminSettingsApiSlice;

