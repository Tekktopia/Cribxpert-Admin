import { apiSlice } from "@/api/apiSlice";
import { supabase } from "@/lib/supabase";

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
  [key: string]: unknown;
}

export interface GetAdminProfileResponse { user: AdminSettingsUser }
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
export interface UpdateAdminProfileResponse { user: AdminSettingsUser }
export interface ChangeAdminPasswordRequest { currentPassword: string; newPassword: string }
export interface ChangeAdminPasswordResponse { message: string }

function mapProfile(p: Record<string, unknown>): AdminSettingsUser {
  return {
    _id: p.id as string,
    email: p.email as string ?? '',
    fullName: p.full_name as string | undefined,
    phoneNo: p.phone_no as string | undefined,
    bookingsUpdates: p.bookings_updates as boolean | undefined,
    newListingSubmission: p.new_listing_submission as boolean | undefined,
    emailAlerts: p.email_alerts as boolean | undefined,
  };
}

export const adminSettingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminProfile: builder.query<GetAdminProfileResponse, void>({
      queryFn: async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return { error: { status: 'CUSTOM_ERROR', error: 'Not authenticated' } };
        const { data, error } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return { data: { user: mapProfile(data as Record<string, unknown>) } };
      },
    }),

    updateAdminProfile: builder.mutation<UpdateAdminProfileResponse, UpdateAdminProfileRequest>({
      queryFn: async (body) => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return { error: { status: 'CUSTOM_ERROR', error: 'Not authenticated' } };

        const patch: Record<string, unknown> = {};
        if (body.fullName !== undefined) patch.full_name = body.fullName;
        if (body.phoneNo !== undefined) patch.phone_no = body.phoneNo;
        if (body.dob !== undefined) patch.dob = body.dob;
        if (body.bookingsUpdates !== undefined) patch.bookings_updates = body.bookingsUpdates;
        if (body.newListingSubmission !== undefined) patch.new_listing_submission = body.newListingSubmission;
        if (body.emailAlerts !== undefined) patch.email_alerts = body.emailAlerts;

        const { data, error } = await supabase.from('profiles').update(patch).eq('id', authUser.id).select('*').single();
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return { data: { user: mapProfile(data as Record<string, unknown>) } };
      },
    }),

    changeAdminPassword: builder.mutation<ChangeAdminPasswordResponse, ChangeAdminPasswordRequest>({
      queryFn: async ({ newPassword }) => {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return { data: { message: 'Password changed successfully' } };
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAdminProfileQuery,
  useUpdateAdminProfileMutation,
  useChangeAdminPasswordMutation,
} = adminSettingsApiSlice;
