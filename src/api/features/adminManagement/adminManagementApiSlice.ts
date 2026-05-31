import { apiSlice } from "@/api/apiSlice";
import { supabase } from "@/lib/supabase";

export type AdminRole =
  | "Admin"
  | "SuperAdmin"
  | "FinanceAdmin"
  | "CSRAdmin"
  | "CSRAgent"
  | "FinanceAgent"
  | "GroupSupervisor"
  | "GroupAgent";

export interface AdminManagementAdmin {
  id: string;
  fullName: string;
  email: string;
  role: AdminRole;
  agentGroup?: string | null;
  accountDisabled?: boolean;
  lastActive?: string | null;
}

export interface GetAdminsResponse { admins: AdminManagementAdmin[] }
export type CreateAdminRole = "Admin" | "FinanceAdmin" | "CSRAdmin" | "CSRAgent" | "FinanceAgent";
export interface CreateAdminRequest {
  email: string;
  fullName: string;
  // Password is set directly — no invite email is sent.
  password: string;
  // Legacy: keep working for code that hasn't migrated yet
  adminType?: CreateAdminRole;
  // New: dynamic group + tier — works for ANY ticket_group
  groupKey?: string;
  tier?: "supervisor" | "agent";
}
export interface CreateAdminResponse { message: string }
export interface DisableAdminResponse { message: string }
export interface DeleteAdminResponse { message: string }
export interface ResetPasswordResponse { message: string }

const ROLE_MAP: Record<string, AdminRole> = {
  admin:            'Admin',
  superadmin:       'SuperAdmin',
  finance_admin:    'FinanceAdmin',
  csr_admin:        'CSRAdmin',
  csr_agent:        'CSRAgent',
  finance_agent:    'FinanceAgent',
  group_supervisor: 'GroupSupervisor',
  group_agent:      'GroupAgent',
};

const ADMIN_DB_ROLES = [
  'admin', 'superadmin', 'finance_admin', 'csr_admin',
  'csr_agent', 'finance_agent', 'group_supervisor', 'group_agent',
];

export const adminManagementApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdmins: builder.query<GetAdminsResponse, void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, agent_group, account_disabled, created_at')
          .in('role', ADMIN_DB_ROLES)
          .order('created_at', { ascending: false }) as { data: any[] | null; error: any };
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return {
          data: {
            admins: (data ?? []).map((p: any) => ({
              id: p.id,
              fullName: p.full_name ?? p.email ?? '',
              email: p.email ?? '',
              role: ROLE_MAP[p.role] ?? 'Admin',
              agentGroup: p.agent_group ?? null,
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
      queryFn: async ({ email, fullName, password, adminType, groupKey, tier }) => {
        // Uses the create-admin edge function which runs with the service role
        // key — required for auth.admin.createUser and correct profile upsert
        // with the real auth user UUID. The password is set directly; no invite
        // email is sent and the account is usable immediately.
        //
        // Prefer the dynamic { groupKey, tier } shape (works for ANY group).
        // Fall back to legacy { adminType } when no group is provided.
        const body =
          groupKey && tier
            ? { email, fullName, password, groupKey, tier }
            : { email, fullName, password, adminType: adminType ?? 'Admin' };
        const { data, error } = await supabase.functions.invoke('create-admin', {
          body,
        });
        if (error) {
          // supabase-js wraps non-2xx as FunctionsHttpError whose .message is the
          // useless "Edge Function returned a non-2xx status code". The function's
          // real { error } body lives on error.context (the raw Response) — read it.
          let msg = error.message;
          const ctx = (error as unknown as { context?: Response }).context;
          if (ctx && typeof ctx.json === 'function') {
            try {
              const b = await ctx.clone().json();
              if (b?.error) msg = b.error;
            } catch { /* keep generic message */ }
          }
          return { error: { status: 'CUSTOM_ERROR', error: msg } };
        }
        if (data?.error) return { error: { status: 'CUSTOM_ERROR', error: data.error } };
        return { data: { message: data?.message ?? `Admin created — they can log in now.` } };
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

    // SuperAdmin-only: set a new password for ANY user. The edge function
    // re-verifies the caller is a superadmin server-side before applying.
    resetUserPassword: builder.mutation<ResetPasswordResponse, { userId: string; password: string }>({
      queryFn: async ({ userId, password }) => {
        const { data, error } = await supabase.functions.invoke('reset-password', {
          body: { userId, password },
        });
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        if (data?.error) return { error: { status: 'CUSTOM_ERROR', error: data.error } };
        return { data: { message: data?.message ?? 'Password reset successfully' } };
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAdminsQuery,
  useCreateAdminMutation,
  useDisableAdminMutation,
  useDeleteAdminMutation,
  useResetUserPasswordMutation,
} = adminManagementApiSlice;
