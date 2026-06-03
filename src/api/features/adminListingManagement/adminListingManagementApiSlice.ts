// src/api/features/listings/listingsManagementApiSlice.ts
import { apiSlice } from "@/api/apiSlice";
import { supabase } from "@/lib/supabase";

const EMAIL_FN = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/email`;

async function sendEmail(type: string, to: string, data: Record<string, string>) {
  const { data: { session } } = await supabase.auth.getSession();
  await fetch(EMAIL_FN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token ?? ''}`,
    },
    body: JSON.stringify({ type, to, data }),
  }).catch(() => {}); // fire-and-forget — don't block the mutation if email fails
}

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
  status: "pending" | "approved" | "rejected" | "flagged" | "hidden";
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
  editSnapshot?: Record<string, unknown> | null;
  listingImg?: Array<{
    fileUrl: string;
    fileType: string;
    fileName: string;
    public_id: string;
  }>;
  amenities?: Array<{ _id: string; name: string; icon?: { fileUrl: string } }>;
  houseRules?: Array<{ _id: string; name: string }>;
  avaliableFrom?: string;
  avaliableUntil?: string;
  hideStatus?: boolean;
}

export interface GetListingsResponse { 
  listings: ApiListing[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface GetListingsParams {
  status?: "pending" | "approved" | "rejected" | "flagged" | "hidden" | (string & {});
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListingStats {
  all: number;
  approved: number;
  pending: number;
  flagged: number;
  rejected: number;
  hidden: number;
}

export interface ApproveListingResponse { message: string; listing: ApiListing }
export interface RejectListingRequest { rejectionReason?: string }
export interface RejectListingResponse { message: string; listing: ApiListing }
export interface FlagListingRequest { flagReason?: string }
export interface FlagListingResponse { message: string; listing: ApiListing }
export interface HideListingResponse { message: string; listing: ApiListing }

const LISTING_SELECT = `
  *,
  user:profiles!user_id(id, full_name, email),
  amenities:listing_amenities(amenity:amenities(id, name)),
  images:listing_listing_images(image:listing_images(id, file_url, file_name, public_id)),
  house_rules:listing_house_rules(rule:house_rules(id, name))
`.trim();

function mapRow(r: Record<string, unknown>): ApiListing {
  const user = (r.user as Record<string, unknown>) ?? {};
  const images = ((r.images as unknown[]) ?? []).map((i: unknown) => {
    const img = (i as Record<string, unknown>).image as Record<string, unknown> ?? {};
    return { fileUrl: img.file_url as string, fileType: 'image', fileName: img.file_name as string, public_id: img.public_id as string };
  });
  const amenities = ((r.amenities as unknown[]) ?? []).map((a: unknown) => {
    const am = (a as Record<string, unknown>).amenity as Record<string, unknown> ?? {};
    return { _id: am.id as string, name: am.name as string };
  });
  const houseRules = ((r.house_rules as unknown[]) ?? []).map((h: unknown) => {
    const rule = (h as Record<string, unknown>).rule as Record<string, unknown> ?? {};
    return { _id: rule.id as string, name: rule.name as string };
  });
  return {
    _id: r.id as string,
    name: r.name as string,
    description: r.description as string | undefined,
    userId: { _id: user.id as string, fullName: user.full_name as string ?? '', email: user.email as string ?? '' },
    street: r.street as string | undefined,
    city: r.city as string | undefined,
    state: r.state as string | undefined,
    country: r.country as string | undefined,
    postalCode: r.postal_code as string | undefined,
    basePrice: r.base_price as number ?? 0,
    cleaningFee: r.cleaning_fee as number | undefined,
    securityDeposit: r.security_deposit as number | undefined,
    status: (r.hide_status === true ? 'hidden' : r.status) as ApiListing['status'],
    createdAt: r.created_at as string,
    latitude: r.latitude as number | undefined,
    longitude: r.longitude as number | undefined,
    guestNo: r.guest_no as number | undefined,
    bedroomNo: r.bedroom_no as number | undefined,
    bathroomNo: r.bathroom_no as number | undefined,
    approvedBy: r.approved_by as string | null ?? null,
    approvedAt: r.approved_at as string | null ?? null,
    listingImg: images,
    amenities,
    houseRules,
    avaliableFrom: r.available_from as string | undefined,
    avaliableUntil: r.available_until as string | undefined,
    hideStatus: r.hide_status as boolean | undefined,
    editSnapshot: r.edit_snapshot as Record<string, unknown> | null ?? null,
  };
}

export const adminListingManagementApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get listings with pagination, filtering, and search
    getListings: builder.query<GetListingsResponse, GetListingsParams | void>({
      queryFn: async (params) => {
        try {
          const page = params?.page || 1;
          const limit = params?.limit || 10;
          const offset = (page - 1) * limit;
          
          let query = supabase
            .from('listings')
            .select(LISTING_SELECT, { count: 'exact' })
            // Draft listings belong to the host only — they haven't been
            // submitted for review, so they must never appear on the Admin side.
            .neq('status', 'draft')
            .order('created_at', { ascending: false });

          // Apply status filter
          if (params?.status) {
            if (params.status === 'hidden') {
              query = query.eq('hide_status', true);
            } else if (params.status === 'edited') {
              // "Edited" = host modified an already-approved listing and it's
              // awaiting re-approval. Identified by: status=pending + edit_snapshot set
              // + previously had an approval (approved_at IS NOT NULL).
              query = query
                .eq('status', 'pending')
                .not('edit_snapshot', 'is', null)
                .not('approved_at', 'is', null);
            } else {
              query = query.eq('status', params.status);
            }
          }

          // Apply search filter
          if (params?.search && params.search.trim() !== '') {
            const searchTerm = params.search.trim();
            query = query.or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`);
          }

          // Apply pagination
          query = query.range(offset, offset + limit - 1);

          const { data, error, count } = await query;
          
          if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
          
          return { 
            data: { 
              listings: (data ?? []).map(mapRow),
              totalCount: count || 0,
              currentPage: page,
              totalPages: Math.ceil((count || 0) / limit),
            } 
          };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      providesTags: [{ type: "Listing", id: "LIST" }],
    }),

    // Get listing statistics for tabs
    getListingStats: builder.query<ListingStats, void>({
      queryFn: async () => {
        try {
          const { data: listings, error } = (await supabase
            .from('listings')
            .select('status, hide_status')
            .neq('status', 'draft')) as {
              data: Array<{ status: string | null; hide_status: boolean | null }> | null;
              error: { message: string } | null;
            };

          if (error) throw error;

          const stats: ListingStats = {
            all: listings?.length || 0,
            approved: 0,
            pending: 0,
            flagged: 0,
            rejected: 0,
            hidden: 0,
          };

          listings?.forEach(listing => {
            if (listing.hide_status === true) {
              stats.hidden++;
            } else if (listing.status === 'approved') {
              stats.approved++;
            } else if (listing.status === 'pending') {
              stats.pending++;
            } else if (listing.status === 'flagged') {
              stats.flagged++;
            } else if (listing.status === 'rejected') {
              stats.rejected++;
            }
          });

          return { data: stats };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      providesTags: [{ type: "Listing", id: "STATS" }],
    }),

    // Approve listing
    approveListing: builder.mutation<ApproveListingResponse, string>({
      queryFn: async (listingId) => {
        const { data, error } = await (supabase
          .from('listings') as any)
          .update({ status: 'approved', approved_at: new Date().toISOString(), hide_status: false, edit_snapshot: null })
          .eq('id', listingId)
          .select(LISTING_SELECT)
          .single();

        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };

        const listing = mapRow(data as Record<string, unknown>);

        // Send notification to host
        await (supabase.from('notifications') as any).insert({
          user_id: listing.userId._id,
          title: 'Listing Approved',
          description: `Your listing "${listing.name}" has been approved and is now live.`,
          category: 'listing',
          is_read: false,
        });
        
        // Send email notification
        await sendEmail('listing_approved', listing.userId.email, {
          userName: listing.userId.fullName || listing.userId.email,
          listingName: listing.name,
        });
        
        return { data: { message: 'Listing approved successfully', listing } };
      },
      invalidatesTags: [{ type: "Listing", id: "LIST" }, { type: "Listing", id: "STATS" }],
    }),

    // Reject listing
    rejectListing: builder.mutation<RejectListingResponse, { listingId: string; rejectionReason?: string }>({
      queryFn: async ({ listingId, rejectionReason }) => {
        const { data, error } = await (supabase
          .from('listings') as any)
          .update({ status: 'rejected' })
          .eq('id', listingId)
          .select(LISTING_SELECT)
          .single();

        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };

        const listing = mapRow(data as Record<string, unknown>);

        // Send notification to host
        await (supabase.from('notifications') as any).insert({
          user_id: listing.userId._id,
          title: 'Listing Rejected',
          description: rejectionReason
            ? `Your listing "${listing.name}" was rejected: ${rejectionReason}`
            : `Your listing "${listing.name}" has been rejected by our team.`,
          category: 'listing',
          is_read: false,
        });
        
        // Send email notification
        await sendEmail('listing_rejected', listing.userId.email, {
          userName: listing.userId.fullName || listing.userId.email,
          listingName: listing.name,
          ...(rejectionReason ? { reason: rejectionReason } : {}),
        });
        
        return { data: { message: 'Listing rejected successfully', listing } };
      },
      invalidatesTags: [{ type: "Listing", id: "LIST" }, { type: "Listing", id: "STATS" }],
    }),

    // Flag listing
    flagListing: builder.mutation<FlagListingResponse, { listingId: string; flagReason?: string }>({
      queryFn: async ({ listingId, flagReason }) => {
        const { data, error } = await (supabase
          .from('listings') as any)
          .update({ status: 'flagged' })
          .eq('id', listingId)
          .select(LISTING_SELECT)
          .single();

        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };

        const listing = mapRow(data as Record<string, unknown>);

        // Send notification to host
        await (supabase.from('notifications') as any).insert({
          user_id: listing.userId._id,
          title: 'Listing Flagged',
          description: flagReason
            ? `Your listing "${listing.name}" has been flagged: ${flagReason}`
            : `Your listing "${listing.name}" has been flagged for review.`,
          category: 'listing',
          is_read: false,
        });
        
        // Send email notification
        await sendEmail('listing_flagged', listing.userId.email, {
          userName: listing.userId.fullName || listing.userId.email,
          listingName: listing.name,
          ...(flagReason ? { reason: flagReason } : {}),
        });
        
        return { data: { message: 'Listing flagged successfully', listing } };
      },
      invalidatesTags: [{ type: "Listing", id: "LIST" }, { type: "Listing", id: "STATS" }],
    }),

    // Hide/Unhide listing
    hideListing: builder.mutation<HideListingResponse, string>({
      queryFn: async (listingId) => {
        const { data: current } = (await supabase
          .from('listings')
          .select('hide_status')
          .eq('id', listingId)
          .single()) as { data: { hide_status: boolean | null } | null };

        const newStatus = !(current?.hide_status ?? false);

        const { data, error } = await (supabase
          .from('listings') as any)
          .update({ hide_status: newStatus })
          .eq('id', listingId)
          .select(LISTING_SELECT)
          .single();
          
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        
        return { 
          data: { 
            message: newStatus ? 'Listing hidden successfully' : 'Listing unhidden successfully', 
            listing: mapRow(data as Record<string, unknown>) 
          } 
        };
      },
      invalidatesTags: [{ type: "Listing", id: "LIST" }, { type: "Listing", id: "STATS" }],
    }),

    // Export listings to CSV
    exportListings: builder.query<string, GetListingsParams | void>({
      queryFn: async (params) => {
        try {
          let query = supabase
            .from('listings')
            .select(`
              id,
              name,
              city,
              state,
              country,
              base_price,
              status,
              hide_status,
              created_at,
              profiles!user_id(full_name, email)
            `)
            .neq('status', 'draft');

          if (params?.status) {
            if (params.status === 'hidden') {
              query = query.eq('hide_status', true);
            } else {
              query = query.eq('status', params.status);
            }
          }

          if (params?.search && params.search.trim() !== '') {
            const searchTerm = params.search.trim();
            query = query.or(`name.ilike.%${searchTerm}%,profiles.full_name.ilike.%${searchTerm}%`);
          }

          const { data: listings, error } = (await query) as {
            data: Array<{
              id: string;
              name: string | null;
              city: string | null;
              state: string | null;
              country: string | null;
              base_price: number | null;
              status: string | null;
              hide_status: boolean | null;
              created_at: string;
              profiles?: { full_name: string | null; email: string | null } | null;
            }> | null;
            error: { message: string } | null;
          };
          if (error) throw error;

          const headers = ['Listing ID', 'Name', 'Host Name', 'Email', 'Location', 'Price/Night', 'Status', 'Created Date'];
          const rows = listings?.map(listing => {
            let status = listing.status;
            if (listing.hide_status === true) status = 'hidden';
            
            return [
              listing.id.slice(0, 8).toUpperCase(),
              listing.name,
              listing.profiles?.full_name || 'Unknown',
              listing.profiles?.email || '',
              [listing.city, listing.state, listing.country].filter(Boolean).join(', '),
              listing.base_price || 0,
              status,
              new Date(listing.created_at).toLocaleDateString()
            ];
          }) || [];

          const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
          ].join('\n');

          return { data: csvContent };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
    }),
  }),
  overrideExisting: true,
});

// Export hooks
export const {
  useGetListingsQuery,
  useGetListingStatsQuery,
  useApproveListingMutation,
  useRejectListingMutation,
  useFlagListingMutation,
  useHideListingMutation,
  useExportListingsQuery,
} = adminListingManagementApiSlice;