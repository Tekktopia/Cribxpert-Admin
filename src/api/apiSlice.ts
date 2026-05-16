import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Listing", "User", "Ticket", "BookingMetrics", "Bookings", "KYCSubmissions", "KYCStats", "CannedResponse"],
  endpoints: () => ({}),
});

