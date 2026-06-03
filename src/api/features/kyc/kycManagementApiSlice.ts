import { apiSlice } from "../../apiSlice";
import { supabase } from "../../../lib/supabase";

const KYC_BUCKET = "kyc";
const ESCROW_FN = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/escrow`;

// After approving KYC, ask the escrow function to provision the user's SZND
// wallet (idempotent). Best-effort: a failure here doesn't undo the approval —
// the route can be retried and is safe to call repeatedly.
async function provisionWallet(userId: string): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return;
    const res = await fetch(`${ESCROW_FN}/admin/provision-wallet`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      console.error("[kyc] wallet provisioning failed:", j?.error ?? res.status);
    }
  } catch (e) {
    console.error("[kyc] wallet provisioning error:", e);
  }
}

export type KycStatus = "pending" | "approved" | "rejected";

export interface KycSubmissionView {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  documentType: string;
  documentNumber: string | null;
  documentFrontPath: string;
  documentBackPath: string | null;
  selfiePath: string;
  status: KycStatus;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KycSignedUrls {
  front: string | null;
  back: string | null;
  selfie: string | null;
}

interface ReviewArgs {
  id: string;
  status: Extract<KycStatus, "approved" | "rejected">;
  rejectionReason?: string;
}

const DOC_LABELS: Record<string, string> = {
  nin: "National ID (NIN)",
  passport: "International Passport",
  bvn: "Bank Verification Number (BVN)",
  drivers_license: "Driver's License",
};

export const kycDocumentLabel = (type: string): string =>
  DOC_LABELS[type] ?? type;

function mapRow(r: Record<string, unknown>): KycSubmissionView {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    userName: (r.user_full_name as string) ?? "—",
    userEmail: (r.user_email as string) ?? "—",
    documentType: (r.document_type as string) ?? "",
    documentNumber: (r.document_number as string) ?? null,
    documentFrontPath: (r.document_front_path as string) ?? "",
    documentBackPath: (r.document_back_path as string) ?? null,
    selfiePath: (r.selfie_path as string) ?? "",
    status: ((r.status as string) ?? "pending") as KycStatus,
    rejectionReason: (r.rejection_reason as string) ?? null,
    reviewedBy: (r.reviewed_by as string) ?? null,
    reviewedAt: (r.reviewed_at as string) ?? null,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

export const kycManagementApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getKycSubmissions: builder.query<KycSubmissionView[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from("kyc_submissions")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) return { error: error.message };
        return { data: (data ?? []).map(mapRow) };
      },
      providesTags: ["KYCSubmissions"],
    }),

    // Batch-signs the document/selfie object paths for a single submission.
    // Admin read is permitted by the kyc_storage_read_admin RLS policy.
    getKycSignedUrls: builder.query<
      KycSignedUrls,
      { front: string; back: string | null; selfie: string }
    >({
      queryFn: async ({ front, back, selfie }) => {
        const paths = [front, selfie, ...(back ? [back] : [])].filter(Boolean);
        if (paths.length === 0)
          return { data: { front: null, back: null, selfie: null } };

        const { data, error } = await supabase.storage
          .from(KYC_BUCKET)
          .createSignedUrls(paths, 60 * 10);

        if (error) return { error: error.message };

        const byPath: Record<string, string> = {};
        (data ?? []).forEach((d) => {
          if (d.path && d.signedUrl) byPath[d.path] = d.signedUrl;
        });

        return {
          data: {
            front: byPath[front] ?? null,
            back: back ? byPath[back] ?? null : null,
            selfie: byPath[selfie] ?? null,
          },
        };
      },
    }),

    reviewKycSubmission: builder.mutation<void, ReviewArgs & { userId?: string }>({
      queryFn: async ({ id, status, rejectionReason, userId }) => {
        const { data: auth } = await supabase.auth.getUser();

        // kyc_submissions isn't in the generated DB types yet — cast past it.
        const { error } = await (supabase as any)
          .from("kyc_submissions")
          .update({
            status,
            rejection_reason:
              status === "rejected" ? rejectionReason ?? null : null,
            reviewed_by: auth.user?.id ?? null,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) return { error: error.message };

        // Resolve user_id for wallet provisioning + notification
        let uid = userId;
        if (!uid) {
          const { data: row } = await (supabase as any)
            .from("kyc_submissions").select("user_id").eq("id", id).single();
          uid = row?.user_id;
        }

        // On approval, provision the user's SZND escrow wallet so it "activates" immediately.
        if (status === "approved" && uid) {
          await provisionWallet(uid);
        }

        // Notify the user of the KYC outcome (triggers push via DB webhook too)
        if (uid) {
          await (supabase as any).from("notifications").insert({
            user_id: uid,
            title: status === "approved" ? "KYC Approved ✅" : "KYC Rejected ❌",
            description:
              status === "approved"
                ? "Your identity verification has been approved. You can now access all platform features including payouts."
                : `Your identity verification was not approved.${rejectionReason ? ` Reason: ${rejectionReason}` : ""} Please re-submit with the correct documents.`,
            category: "kyc",
            is_read: false,
            status: "unread",
          });
        }

        return { data: undefined };
      },
      invalidatesTags: ["KYCSubmissions"],
    }),
  }),
});

export const {
  useGetKycSubmissionsQuery,
  useGetKycSignedUrlsQuery,
  useReviewKycSubmissionMutation,
} = kycManagementApiSlice;
