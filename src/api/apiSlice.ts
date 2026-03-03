import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryApi,
  FetchArgs,
} from "@reduxjs/toolkit/query/react";
import config from "./config";

// Helper function to get cookie value
const baseQuery = fetchBaseQuery({
  baseUrl: config.hostedUrl, // your API URL
  credentials: "include", // Still include for cookie fallback
  prepareHeaders: (headers) => {
    const token =
      typeof window !== "undefined"
        ? sessionStorage.getItem("accessToken")
        : null;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (
  args: string | FetchArgs,
  api: BaseQueryApi,
  extraOptions: Record<string, unknown>
) => {
  const result = await baseQuery(args, api, extraOptions);

  // Handle 401 Unauthorized errors
  if (result?.error?.status === 401) {
    // Clear invalid token from localStorage
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("accessToken");
      if (token) {
        sessionStorage.removeItem("accessToken");
      }
    }

    // Return the error result - let the calling component handle it
    // This allows for proper error handling and prevents silent failures
    return result;
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Listing", "User"],
  endpoints: () => ({}),
});

