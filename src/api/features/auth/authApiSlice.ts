import { apiSlice } from "@/api/apiSlice";
import { supabase } from "@/lib/supabase";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<{ message: string }, { email: string; password: string }>({
      queryFn: async ({ email, password }) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return { data: { message: 'Login successful' } };
      },
    }),

    isLoggedIn: builder.query<{ authenticated: boolean }, void>({
      queryFn: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return { data: { authenticated: !!user } };
      },
    }),

    addAdmin: builder.mutation<{ message: string }, { email: string; fullName: string; role?: string }>({
      queryFn: async ({ email, fullName, role = 'admin' }) => {
        const { error: otpError } = await supabase.auth.signInWithOtp({ email });
        if (otpError) return { error: { status: 'CUSTOM_ERROR', error: otpError.message } };
        const { error: profileError } = await (supabase.from('profiles') as any).upsert({ email, full_name: fullName, role }, { onConflict: 'email' });
        if (profileError) return { error: { status: 'CUSTOM_ERROR', error: profileError.message } };
        return { data: { message: `Admin invite sent to ${email}` } };
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useLoginMutation,
  useIsLoggedInQuery,
  useAddAdminMutation,
} = authApiSlice;
