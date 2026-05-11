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
  amenities?: Array<{ _id: string; name: string; icon?: { fileUrl: string } }>;
  houseRules?: Array<{ _id: string; name: string }>;
  avaliableFrom?: string;
  avaliableUntil?: string;
  hideStatus?: boolean;
}

export interface GetListingsResponse { listings: ApiListing[] }
export interface GetListingsParams { status?: "pending" | "approved" | "rejected" | "flagged" }
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
    status: r.status as ApiListing['status'],
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
  };
}

export const adminListingManagementApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getListings: builder.query<GetListingsResponse, GetListingsParams | void>({
      queryFn: async (params) => {
        let query = supabase.from('listings').select(LISTING_SELECT).order('created_at', { ascending: false });
        if (params?.status) query = query.eq('status', params.status);
        const { data, error } = await query;
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return { data: { listings: (data ?? []).map(mapRow) } };
      },
      providesTags: [{ type: "Listing", id: "LIST" }],
    }),

    approveListing: builder.mutation<ApproveListingResponse, string>({
      queryFn: async (listingId) => {
        const { data, error } = await supabase
          .from('listings')
          .update({ status: 'approved', approved_at: new Date().toISOString() })
          .eq('id', listingId)
          .select(LISTING_SELECT)
          .single();
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        const listing = mapRow(data as Record<string, unknown>);
        await supabase.from('notifications').insert({
          user_id: listing.userId._id,
          title: 'Listing Approved',
          description: `Your listing "${listing.name}" has been approved and is now live.`,
          category: 'listing',
          is_read: false,
        });
        await sendEmail('listing_approved', listing.userId.email, {
          userName: listing.userId.fullName || listing.userId.email,
          listingName: listing.name,
        });
        return { data: { message: 'Listing approved successfully', listing } };
      },
      invalidatesTags: [{ type: "Listing", id: "LIST" }],
    }),

    rejectListing: builder.mutation<RejectListingResponse, { listingId: string; rejectionReason?: string }>({
      queryFn: async ({ listingId, rejectionReason }) => {
        const { data, error } = await supabase
          .from('listings')
          .update({ status: 'rejected' })
          .eq('id', listingId)
          .select(LISTING_SELECT)
          .single();
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        const listing = mapRow(data as Record<string, unknown>);
        await supabase.from('notifications').insert({
          user_id: listing.userId._id,
          title: 'Listing Rejected',
          description: rejectionReason
            ? `Your listing "${listing.name}" was rejected: ${rejectionReason}`
            : `Your listing "${listing.name}" has been rejected by our team.`,
          category: 'listing',
          is_read: false,
        });
        await sendEmail('listing_rejected', listing.userId.email, {
          userName: listing.userId.fullName || listing.userId.email,
          listingName: listing.name,
          ...(rejectionReason ? { reason: rejectionReason } : {}),
        });
        return { data: { message: 'Listing rejected successfully', listing } };
      },
      invalidatesTags: [{ type: "Listing", id: "LIST" }],
    }),

    flagListing: builder.mutation<FlagListingResponse, { listingId: string; flagReason?: string }>({
      queryFn: async ({ listingId, flagReason }) => {
        const { data, error } = await supabase
          .from('listings')
          .update({ status: 'flagged' })
          .eq('id', listingId)
          .select(LISTING_SELECT)
          .single();
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        const listing = mapRow(data as Record<string, unknown>);
        await supabase.from('notifications').insert({
          user_id: listing.userId._id,
          title: 'Listing Flagged',
          description: flagReason
            ? `Your listing "${listing.name}" has been flagged: ${flagReason}`
            : `Your listing "${listing.name}" has been flagged for review.`,
          category: 'listing',
          is_read: false,
        });
        await sendEmail('listing_flagged', listing.userId.email, {
          userName: listing.userId.fullName || listing.userId.email,
          listingName: listing.name,
          ...(flagReason ? { reason: flagReason } : {}),
        });
        return { data: { message: 'Listing flagged successfully', listing } };
      },
      invalidatesTags: [{ type: "Listing", id: "LIST" }],
    }),

    hideListing: builder.mutation<HideListingResponse, string>({
      queryFn: async (listingId) => {
        const { data: current } = await supabase.from('listings').select('hide_status').eq('id', listingId).single();
        const newStatus = !(current?.hide_status ?? false);
        const { data, error } = await supabase
          .from('listings')
          .update({ hide_status: newStatus })
          .eq('id', listingId)
          .select(LISTING_SELECT)
          .single();
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return { data: { message: newStatus ? 'Listing hidden successfully' : 'Listing unhidden successfully', listing: mapRow(data as Record<string, unknown>) } };
      },
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
