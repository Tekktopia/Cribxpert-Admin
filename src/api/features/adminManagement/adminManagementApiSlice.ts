import { apiSlice } from "@/api/apiSlice";

export interface AdminManagementAdmin {
  id: string;
  fullName: string;
  email: string;
  role: "Admin" | "SuperAdmin";
  accountDisabled?: boolean;
  lastActive?: string | null;
}

export interface GetAdminsResponse {
  admins: AdminManagementAdmin[];
}

export interface CreateAdminRequest {
  email: string;
  fullName: string;
}

export interface CreateAdminResponse {
  message: string;
}

export interface DisableAdminResponse {
  message: string;
}

export interface DeleteAdminResponse {
  message: string;
}

export const adminManagementApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdmins: builder.query<GetAdminsResponse, void>({
      query: () => ({
        url: "/admin-management/admins",
        method: "GET",
      }),
      providesTags: (result) =>
        result?.admins
          ? [
              ...result.admins.map((admin) => ({
                type: "User" as const,
                id: admin.id,
              })),
              { type: "User" as const, id: "ADMIN_LIST" },
            ]
          : [{ type: "User" as const, id: "ADMIN_LIST" }],
    }),
    createAdmin: builder.mutation<CreateAdminResponse, CreateAdminRequest>({
      query: (body) => ({
        url: "/admin-management/admins",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "User", id: "ADMIN_LIST" }],
    }),
    disableAdmin: builder.mutation<DisableAdminResponse, string>({
      query: (adminId) => ({
        url: `/admin-management/admins/disable/${adminId}`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "User", id },
        { type: "User", id: "ADMIN_LIST" },
      ],
    }),
    deleteAdmin: builder.mutation<DeleteAdminResponse, string>({
      query: (adminId) => ({
        url: `/admin-management/admins/${adminId}`,
        method: "DELETE",
      }),
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

