// src/api/features/kyc/kycManagementApiSlice.ts
import { apiSlice } from "@/api/apiSlice";
import { supabase } from "@/lib/supabase";

export interface KYCSubmission {
  id: string;
  userId: string;
  name: string;
  email: string;
  documentType: string;
  documentUrl?: string;
  status: "not_started" | "pending" | "verified" | "failed";
  role: string;
  submissionDate: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface KYCResponse {
  submissions: KYCSubmission[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface KYCStats {
  not_started: number;
  pending: number;
  verified: number;
  failed: number;
  total: number;
}

export interface KYCVerificationParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const kycManagementApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all KYC submissions
    getKYCSubmissions: builder.query<KYCResponse, KYCVerificationParams | void>(
      {
        queryFn: async (params) => {
          try {
            const page = params?.page || 1;
            const limit = params?.limit || 10;
            const offset = (page - 1) * limit;

            // Start building the query
            let query = supabase
              .from("profiles")
              .select(
                "id, full_name, email, role, kyc_status, created_at, updated_at",
                { count: "exact" },
              );

            // Apply search filter
            if (params?.search && params.search.trim() !== "") {
              const searchTerm = params.search.trim();
              query = query.or(
                `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`,
              );
            }

            // Apply status filter
            if (params?.status && params.status !== "All Status") {
              query = query.eq("kyc_status", params.status.toLowerCase());
            }

            // Get total count
            const { count: totalCount, error: countError } = await query;
            if (countError) throw countError;

            // Apply pagination and ordering
            const { data: profiles, error: dataError } = await query
              .order("created_at", { ascending: false })
              .range(offset, offset + limit - 1);

            if (dataError) throw dataError;

            // Transform data to KYC submission format
            const submissions: KYCSubmission[] =
              (profiles as any[])?.map((profile: any) => ({
                id: profile.id,
                userId: profile.id,
                name: profile.full_name || "Unknown",
                email: profile.email || "",
                documentType: "ID Document",
                documentUrl: "",
                status: profile.kyc_status as
                  | "not_started"
                  | "pending"
                  | "verified"
                  | "failed",
                role:
                  profile.role === "host"
                    ? "Host"
                    : profile.role === "guest"
                      ? "Guest"
                      : profile.role || "User",
                submissionDate: profile.created_at,
                createdAt: profile.created_at,
                reviewedAt: profile.updated_at,
              })) || [];

            return {
              data: {
                submissions,
                totalCount: totalCount || 0,
                currentPage: page,
                totalPages: Math.ceil((totalCount || 0) / limit),
              },
            };
          } catch (error) {
            console.error("Error fetching KYC submissions:", error);
            return { error: { status: "FETCH_ERROR", error: String(error) } };
          }
        },
        providesTags: ["KYCSubmissions"],
      },
    ),

    // Get KYC statistics for dashboard
    getKYCStats: builder.query<KYCStats, void>({
      queryFn: async () => {
        try {
          const { data: profiles, error } = await supabase
            .from("profiles")
            .select("kyc_status");

          if (error) throw error;

          const stats: KYCStats = {
            not_started: 0,
            pending: 0,
            verified: 0,
            failed: 0,
            total: profiles?.length || 0,
          };

          profiles?.forEach((profile) => {
            switch (profile.kyc_status) {
              case "not_started":
                stats.not_started++;
                break;
              case "pending":
                stats.pending++;
                break;
              case "verified":
                stats.verified++;
                break;
              case "failed":
                stats.failed++;
                break;
            }
          });

          return { data: stats };
        } catch (error) {
          console.error("Error fetching KYC stats:", error);
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      providesTags: ["KYCStats"],
    }),

    // Approve KYC submission (set to verified)
    approveKYC: builder.mutation<
      { success: boolean },
      { userId: string; remarks?: string }
    >({
      queryFn: async ({ userId, remarks: _remarks }) => {
        try {
          const { error } = await supabase
            .from("profiles")
            .update({
              kyc_status: "verified",
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

          if (error) throw error;

          return { data: { success: true } };
        } catch (error) {
          console.error("Error approving KYC:", error);
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      invalidatesTags: ["KYCSubmissions", "KYCStats"],
    }),

    // Reject KYC submission (set to failed)
    rejectKYC: builder.mutation<
      { success: boolean },
      { userId: string; reason: string }
    >({
      queryFn: async ({ userId, reason: _reason }) => {
        try {
          const { error } = await supabase
            .from("profiles")
            .update({
              kyc_status: "failed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

          if (error) throw error;

          return { data: { success: true } };
        } catch (error) {
          console.error("Error rejecting KYC:", error);
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      invalidatesTags: ["KYCSubmissions", "KYCStats"],
    }),

    // Reset KYC to pending (for resubmission)
    resetKYC: builder.mutation<{ success: boolean }, { userId: string }>({
      queryFn: async ({ userId }) => {
        try {
          const { error } = await supabase
            .from("profiles")
            .update({
              kyc_status: "pending",
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

          if (error) throw error;

          return { data: { success: true } };
        } catch (error) {
          console.error("Error resetting KYC:", error);
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      invalidatesTags: ["KYCSubmissions", "KYCStats"],
    }),

    // Export KYC submissions to CSV
    exportKYCSubmissions: builder.query<string, KYCVerificationParams | void>({
      queryFn: async (params) => {
        try {
          let query = supabase
            .from("profiles")
            .select(
              "id, full_name, email, role, kyc_status, created_at, updated_at",
            );

          if (params?.search && params.search.trim() !== "") {
            const searchTerm = params.search.trim();
            query = query.or(
              `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`,
            );
          }

          if (params?.status && params.status !== "All Status") {
            query = query.eq("kyc_status", params.status.toLowerCase());
          }

          const { data: profiles, error } = await query.order("created_at", {
            ascending: false,
          });

          if (error) throw error;

          const headers = [
            "ID",
            "Name",
            "Email",
            "Role",
            "KYC Status",
            "Submission Date",
            "Last Updated",
          ];

          const getStatusLabel = (status: string) => {
            switch (status) {
              case "not_started":
                return "Not Started";
              case "pending":
                return "Pending";
              case "verified":
                return "Verified";
              case "failed":
                return "Failed";
              default:
                return status;
            }
          };

          const rows =
            (profiles as any[])?.map((profile: any) => [
              profile.id.slice(0, 8),
              profile.full_name || "Unknown",
              profile.email || "",
              profile.role || "User",
              getStatusLabel(profile.kyc_status),
              new Date(profile.created_at).toLocaleDateString(),
              new Date(profile.updated_at).toLocaleDateString(),
            ]) || [];

          const csvContent = [
            headers.join(","),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
          ].join("\n");

          return { data: csvContent };
        } catch (error) {
          console.error("Error exporting KYC:", error);
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
    }),
  }),
  overrideExisting: true,
});

// Export hooks
export const {
  useGetKYCSubmissionsQuery,
  useGetKYCStatsQuery,
  useApproveKYCMutation,
  useRejectKYCMutation,
  useResetKYCMutation,
  useExportKYCSubmissionsQuery,
} = kycManagementApiSlice;
