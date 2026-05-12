import { apiSlice } from "@/api/apiSlice";
import { supabase } from "@/lib/supabase";

const EMAIL_FN = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/email`;

async function sendEmail(type: string, to: string, data: Record<string, string>) {
  const { data: { session } } = await supabase.auth.getSession();
  await fetch(EMAIL_FN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token ?? ''}`,
    },
    body: JSON.stringify({ type, to, data }),
  }).catch(() => {});
}

export interface ApiUser {
  userId: string;
  name: string;
  email: string;
  phoneNo?: string;
  role: "HOST" | "GUEST";
  status: "verified" | "pending" | "Blocked";
  lastActive: string | null;
  totalBookings?: number;
  activeBookings?: number;
}

export interface GetAllUsersResponse { users: ApiUser[] }

export interface BlockUserRequest { reason: string }
export interface BlockUserResponse {
  message: string;
  user: { userId: string; email: string; accountDisabled: boolean; blockReason: string };
}

export interface UserDetailsResponse {
  user: {
    userId: string;
    name: string;
    email: string;
    phoneNo: string | null;
    role: "HOST" | "GUEST" | "HOST_AND_GUEST";
    isVerified: boolean;
    accountDisabled: boolean;
    activeBookings: number;
    completedBookings: number;
    cancelledBookings: number;
  };
}

export interface DeleteUserResponse {
  message: string;
  deletedUser: { userId: string; email: string };
  deletedData: { bookings: number; reviews: number; favourites: number; listings: number; images: number };
}

function mapProfileToApiUser(p: Record<string, unknown>): ApiUser {
  const isHost = (p.is_host as boolean) || (p.role as string) === 'host';
  const isBlocked = p.account_disabled as boolean;
  const isVerified = p.kyc_status === 'verified';

  return {
    userId: p.id as string,
    name: (p.full_name as string) ?? (p.email as string) ?? '',
    email: p.email as string ?? '',
    phoneNo: p.phone_no as string | undefined,
    role: isHost ? 'HOST' : 'GUEST',
    status: isBlocked ? 'Blocked' : isVerified ? 'verified' : 'pending',
    lastActive: null,
  };
}

export const adminUserManagementApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query<GetAllUsersResponse, void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .not('role', 'in', '(admin,superadmin,finance_admin,csr_admin)')
          .order('created_at', { ascending: false });
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return { data: { users: (data ?? []).map(mapProfileToApiUser) } };
      },
      providesTags: [{ type: "User", id: "LIST" }],
    }),

    getUserById: builder.query<UserDetailsResponse, string>({
      queryFn: async (userId) => {
        const { data: profile, error } = await (supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single() as any);
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };

        const [{ count: activeBookings }, { count: completedBookings }, { count: cancelledBookings }] = await Promise.all([
          supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('user_id', userId).in('status', ['pending', 'confirmed']),
          supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'completed'),
          supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'cancelled'),
        ]);

        const isHost = profile.is_host || profile.role === 'host';
        const { count: listingCount } = await supabase.from('listings').select('*', { count: 'exact', head: true }).eq('user_id', userId);

        return {
          data: {
            user: {
              userId: profile.id,
              name: profile.full_name ?? profile.email ?? '',
              email: profile.email ?? '',
              phoneNo: profile.phone_no ?? null,
              role: isHost && (completedBookings ?? 0) > 0 ? 'HOST_AND_GUEST' : isHost || (listingCount ?? 0) > 0 ? 'HOST' : 'GUEST',
              isVerified: profile.kyc_status === 'verified',
              accountDisabled: profile.account_disabled ?? false,
              activeBookings: activeBookings ?? 0,
              completedBookings: completedBookings ?? 0,
              cancelledBookings: cancelledBookings ?? 0,
            },
          },
        };
      },
      providesTags: (_result, _error, userId) => [{ type: "User", id: userId }],
    }),

    blockUser: builder.mutation<BlockUserResponse, { userId: string; reason: string }>({
      queryFn: async ({ userId, reason }) => {
        const { data: current } = await ((supabase.from('profiles') as any).select('account_disabled, email, full_name').eq('id', userId).single());
        const newDisabled = !(current?.account_disabled ?? false);
        const { data, error } = await ((supabase.from('profiles') as any)
          .update({ account_disabled: newDisabled, block_reason: newDisabled ? reason : null })
          .eq('id', userId)
          .select('id, email, account_disabled, block_reason')
          .single());
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        await (supabase.from('notifications') as any).insert({
          user_id: userId,
          title: newDisabled ? 'Account Suspended' : 'Account Reinstated',
          description: newDisabled
            ? `Your account has been suspended. Reason: ${reason}`
            : 'Your account has been reinstated. You can now access the platform.',
          category: 'general',
          is_read: false,
        });
        const userName = current?.full_name || current?.email || '';
        const dataTyped = data as any;
        await sendEmail(
          newDisabled ? 'account_blocked' : 'account_reinstated',
          dataTyped.email,
          newDisabled ? { userName, reason } : { userName }
        );
        return {
          data: {
            message: newDisabled ? 'User account blocked successfully' : 'User account unblocked successfully',
            user: { userId: dataTyped.id, email: dataTyped.email, accountDisabled: dataTyped.account_disabled, blockReason: dataTyped.block_reason ?? '' },
          },
        };
      },
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "User", id: "LIST" },
        { type: "User", id: userId },
      ],
    }),

    deleteUser: builder.mutation<DeleteUserResponse, string>({
      queryFn: async (userId) => {
        const { data: profile } = await (supabase.from('profiles').select('email').eq('id', userId).single() as any);
        const { error } = await supabase.from('profiles').delete().eq('id', userId);
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return {
          data: {
            message: 'User deleted successfully',
            deletedUser: { userId, email: profile?.email ?? '' },
            deletedData: { bookings: 0, reviews: 0, favourites: 0, listings: 0, images: 0 },
          },
        };
      },
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useBlockUserMutation,
  useDeleteUserMutation,
} = adminUserManagementApiSlice;
