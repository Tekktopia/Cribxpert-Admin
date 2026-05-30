// src/api/features/kyc/identityVerificationApiSlice.ts
// Calls the admin-only `kyc-verify` Supabase Edge Function to run a live
// NIN / BVN check against the identity provider (Dojah). The provider secret
// never touches the browser — we only send the doc type + number with the
// admin's bearer token; the function authorises the caller server-side.
import { apiSlice } from "@/api/apiSlice";
import { supabase } from "@/lib/supabase";

export interface IdentityResult {
  provider: string;
  type: "nin" | "bvn";
  matched: boolean;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  phoneNumber: string | null;
  photoBase64: string | null;
  raw: Record<string, unknown>;
}

export interface VerifyArgs {
  type: "nin" | "bvn";
  value: string;
}

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kyc-verify`;

export const identityVerificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    verifyIdentity: builder.mutation<IdentityResult, VerifyArgs>({
      queryFn: async ({ type, value }) => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          const token = session?.access_token ?? "";

          const res = await fetch(EDGE_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ type, value }),
          });

          const payload = await res.json().catch(() => ({}));
          if (!res.ok) {
            return {
              error: {
                status: res.status,
                error:
                  payload?.error ??
                  payload?.message ??
                  `Verification failed (${res.status})`,
              },
            };
          }

          return { data: payload as IdentityResult };
        } catch (e) {
          return {
            error: {
              status: "FETCH_ERROR",
              error: e instanceof Error ? e.message : String(e),
            },
          };
        }
      },
    }),
  }),
});

export const { useVerifyIdentityMutation } = identityVerificationApiSlice;
