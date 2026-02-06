import { apiSlice } from "@/api/apiSlice";

// Types for admin listing management responses
export interface ApiListing {
  _id: string;
  name: string;
  description?: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
  };
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  basePrice: number;
  cleaningFee?: number;
  securityDeposit?: number;
  status: "pending" | "approved" | "rejected" | "flagged";
  createdAt: string;
  latitude?: number;
  longitude?: number;
  guestNo?: number;
  bedroomNo?: number;
  bathroomNo?: number;
  totalBookings?: number;
  averageRating?: number;
  reviewCount?: number;
  approvedBy?: string | null;
  approvedAt?: string | null;
  listingImg?: Array<{
    fileUrl: string;
    fileType: string;
    fileName: string;
    public_id: string;
  }>;
  amenities?: Array<{
    _id: string;
    name: string;
    icon?: {
      fileUrl: string;
    };
  }>;
  houseRules?: Array<{
    _id: string;
    name: string;
    icon?: {
      fileUrl: string;
    };
  }>;
  avaliableFrom?: string;
  avaliableUntil?: string;
  hideStatus?: boolean;
}

export interface GetListingsResponse {
  listings: ApiListing[];
}

export interface GetListingsParams {
  status?: "pending" | "approved" | "rejected" | "flagged";
}

export interface ApproveListingResponse {
  message: string;
  listing: ApiListing;
}

export interface RejectListingRequest {
  rejectionReason?: string;
}

export interface RejectListingResponse {
  message: string;
  listing: ApiListing;
}

export interface FlagListingRequest {
  flagReason?: string;
}

export interface FlagListingResponse {
  message: string;
  listing: ApiListing;
}

export interface HideListingResponse {
  message: string;
  listing: ApiListing;
}

export const adminListingManagementApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getListings: builder.query<GetListingsResponse, GetListingsParams | void>({
      query: (params) => {
        const queryParams: Record<string, string> = {};
        if (params?.status) {
          queryParams.status = params.status;
        }
        return {
          url: "/admin-listing-management/listings",
          method: "GET",
          params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        };
      },
      providesTags: [{ type: "Listing", id: "LIST" }],
    }),
    approveListing: builder.mutation<ApproveListingResponse, string>({
      query: (listingId) => ({
        url: `/admin-listing-management/approve/${listingId}`,
        method: "PATCH",
      }),
      invalidatesTags: [{ type: "Listing", id: "LIST" }],
    }),
    rejectListing: builder.mutation<
      RejectListingResponse,
      { listingId: string; rejectionReason?: string }
    >({
      query: ({ listingId, rejectionReason }) => ({
        url: `/admin-listing-management/reject/${listingId}`,
        method: "PATCH",
        body: rejectionReason ? { rejectionReason } : undefined,
      }),
      invalidatesTags: [{ type: "Listing", id: "LIST" }],
    }),
    flagListing: builder.mutation<
      FlagListingResponse,
      { listingId: string; flagReason?: string }
    >({
      query: ({ listingId, flagReason }) => ({
        url: `/admin-listing-management/flag/${listingId}`,
        method: "PATCH",
        body: flagReason ? { flagReason } : undefined,
      }),
      invalidatesTags: [{ type: "Listing", id: "LIST" }],
    }),
    hideListing: builder.mutation<HideListingResponse, string>({
      query: (listingId) => ({
        url: `/admin-listing-management/hide/${listingId}`,
        method: "PATCH",
      }),
      invalidatesTags: [{ type: "Listing", id: "LIST" }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetListingsQuery,
  useApproveListingMutation,
  useRejectListingMutation,
  useFlagListingMutation,
  useHideListingMutation,
} = adminListingManagementApiSlice;
