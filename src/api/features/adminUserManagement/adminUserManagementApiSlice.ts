import { apiSlice } from "@/api/apiSlice";

// Types for admin user management responses
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

export interface GetAllUsersResponse {
  users: ApiUser[];
}

export interface BlockUserRequest {
  reason: string;
}

export interface BlockUserResponse {
  message: string;
  user: {
    userId: string;
    email: string;
    accountDisabled: boolean;
    blockReason: string;
  };
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
  deletedUser: {
    userId: string;
    email: string;
  };
  deletedData: {
    bookings: number;
    reviews: number;
    favourites: number;
    listings: number;
    images: number;
  };
}

export const adminUserManagementApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query<GetAllUsersResponse, void>({
      query: () => ({
        url: "/admin-user-management/users",
        method: "GET",
      }),
      providesTags: [{ type: "User", id: "LIST" }],
    }),
    getUserById: builder.query<UserDetailsResponse, string>({
      query: (userId) => ({
        url: `/admin-user-management/user/${userId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, userId) => [{ type: "User", id: userId }],
    }),
    blockUser: builder.mutation<BlockUserResponse, { userId: string; reason: string }>({
      query: ({ userId, reason }) => ({
        url: `/admin-user-management/block/${userId}`,
        method: "PATCH",
        body: { reason },
      }),
      // Invalidate users list and user details after blocking
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "User", id: "LIST" },
        { type: "User", id: userId },
      ],
    }),
    deleteUser: builder.mutation<DeleteUserResponse, string>({
      query: (userId) => ({
        url: `/admin-user-management/user/${userId}`,
        method: "DELETE",
      }),
      // Invalidate users list after deletion
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
