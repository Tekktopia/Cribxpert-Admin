import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define base API URL to be used across services
export const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Create a base fetchBaseQuery instance that can be reused
export const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});
