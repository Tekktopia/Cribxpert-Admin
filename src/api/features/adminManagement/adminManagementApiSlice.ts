import { apiSlice } from "@/api/apiSlice";
import { supabase } from "@/lib/supabase";

export type AdminRole = "Admin" | "SuperAdmin" | "FinanceAdmin" | "CSRAdmin";

export interface AdminManagementAdmin {
  id: string;
  fullName: string;
  email: string;
  role: AdminRole;
  accountDisabled?: boolean;
  lastActive?: string | null;
}

export interface GetAdminsResponse { admins: AdminManagementAdmin[] }
export type CreateAdminRole = "Admin" | "FinanceAdmin" | "CSRAdmin";
export interface CreateAdminRequest { email: string; fullName: string; adminType?: CreateAdminRole }
export interface CreateAdminResponse { message: string }
export interface DisableAdminResponse { message: string }
export interface DeleteAdminResponse { message: string }

const ROLE_MAP: Record<string, AdminRole> = {
  admin: 'Admin',
  superadmin: 'SuperAdmin',
  finance_admin: 'FinanceAdmin',
  csr_admin: 'CSRAdmin',
};

const ROLE_TO_DB: Record<string, string> = {
  Admin: 'admin',
  FinanceAdmin: 'finance_admin',
  CSRAdmin: 'csr_admin',
};

export const adminManagementApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdmins: builder.query<GetAdminsResponse, void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, account_disabled, created_at')
          .in('role', ['admin', 'superadmin', 'finance_admin', 'csr_admin'])
          .order('created_at', { ascending: false }) as { data: any[] | null; error: any };
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return {
          data: {
            admins: (data ?? []).map((p: any) => ({
              id: p.id,
              fullName: p.full_name ?? p.email ?? '',
              email: p.email ?? '',
              role: ROLE_MAP[p.role] ?? 'Admin',
              accountDisabled: p.account_disabled ?? false,
              lastActive: null,
            })),
          },
        };
      },
      providesTags: (result) =>
        result?.admins
          ? [
              ...result.admins.map(a => ({ type: "User" as const, id: a.id })),
              { type: "User" as const, id: "ADMIN_LIST" },
            ]
          : [{ type: "User" as const, id: "ADMIN_LIST" }],
    }),

    createAdmin: builder.mutation<CreateAdminResponse, CreateAdminRequest>({
      queryFn: async ({ email, fullName, adminType = 'Admin' }) => {
        // Uses the create-admin edge function which runs with the service role
        // key — required for auth.admin.inviteUserByEmail and correct profile
        // upsert with the real auth user UUID.
        const { data, error } = await supabase.functions.invoke('create-admin', {
          body: { email, fullName, adminType },
        });
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        if (data?.error) return { error: { status: 'CUSTOM_ERROR', error: data.error } };
        return { data: { message: data?.message ?? `Admin invite sent to ${email}` } };
      },
      invalidatesTags: [{ type: "User", id: "ADMIN_LIST" }],
    }),

    disableAdmin: builder.mutation<DisableAdminResponse, string>({
      queryFn: async (adminId) => {
        // Uses edge function — needs service role to ban/unban in auth.users
        const { data, error } = await supabase.functions.invoke('toggle-admin', {
          body: { userId: adminId },
        });
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        if (data?.error) return { error: { status: 'CUSTOM_ERROR', error: data.error } };
        return { data: { message: data?.message ?? 'Admin status updated' } };
      },
      invalidatesTags: (_result, _error, id) => [
        { type: "User", id },
        { type: "User", id: "ADMIN_LIST" },
      ],
    }),

    deleteAdmin: builder.mutation<DeleteAdminResponse, string>({
      queryFn: async (adminId) => {
        // Uses edge function — needs service role to delete from auth.users
        const { data, error } = await supabase.functions.invoke('delete-admin', {
          body: { userId: adminId },
        });
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        if (data?.error) return { error: { status: 'CUSTOM_ERROR', error: data.error } };
        return { data: { message: data?.message ?? 'Admin deleted successfully' } };
      },
      invalidatesTags: [{ type: "User", id: "ADMIN_LIST" }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAdminsQuery,
  useCreateAdminMutation,
  useDisableAdminMutation,
  useDeleteAdminMutation,
} = adminManagementApiSlice;
