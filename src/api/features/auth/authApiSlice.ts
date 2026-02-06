import { apiSlice } from "@/api/apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/admin/login",
        method: "POST",
        body: credentials,
      }),
    }),
    isLoggedIn: builder.query({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
    }),
    addAdmin: builder.mutation({
      query: (data) => ({
        url: "/auth/add-admin",
        method: "POST",
        body: data,
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useLoginMutation,
  useIsLoggedInQuery,
  useAddAdminMutation,
} = authApiSlice;
