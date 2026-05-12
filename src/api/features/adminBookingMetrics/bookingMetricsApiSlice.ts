// src/api/features/adminBookingMetrics/bookingMetricsApiSlice.ts
import { apiSlice } from "@/api/apiSlice";
import { supabase } from "@/lib/supabase";

export interface BookingMetricsResponse {
  totalBookings: {
    value: number;
    change: number;
    changeText: string;
    details: string;
  };
  averageValue: {
    value: string;
    change: number;
    changeText: string;
  };
  pendingPayouts: {
    value: string;
    change: number;
    changeText: string;
  };
  openDisputes: {
    value: number;
    change: number;
    changeText: string;
  };
  trends: Array<{
    date: string;
    day: string;
    confirmed: number;
    cancelled: number;
    failed: number;
  }>;
  statusBreakdown: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  recentBookings: Array<{  
    id: string;
    ticketId: string;
    property: string;
    guestName: string;
    status: string;
    date: string;
    revenue: number;
    commission: number;
  }>;
    topListings: Array<{  
    id: string;
    title: string;
    author: string;
    image: string;
    bookings: number;
  }>;
}

export const adminBookingMetricsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBookingMetrics: builder.query<BookingMetricsResponse, void>({
      queryFn: async () => {
        try {
          // ========== TOTAL BOOKINGS ==========
          const { count: totalBookings, error: totalError } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true });

          if (totalError) throw totalError;

          // Get this week's bookings
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          sevenDaysAgo.setHours(0, 0, 0, 0);
          
          const { count: thisWeekCount, error: thisWeekError } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', sevenDaysAgo.toISOString());

          if (thisWeekError) throw thisWeekError;

          // Get last week's bookings
          const fourteenDaysAgo = new Date();
          fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
          fourteenDaysAgo.setHours(0, 0, 0, 0);
          
          const { count: lastWeekCount, error: lastWeekError } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', fourteenDaysAgo.toISOString())
            .lt('created_at', sevenDaysAgo.toISOString());

          if (lastWeekError) throw lastWeekError;

          // Calculate percentage change for total bookings
          let totalBookingsChange = 0;
          if (lastWeekCount && lastWeekCount > 0) {
            totalBookingsChange = (( (thisWeekCount || 0) - lastWeekCount) / lastWeekCount) * 100;
          } else if (thisWeekCount && thisWeekCount > 0) {
            totalBookingsChange = 100;
          }

          // ========== AVERAGE BOOKING VALUE ==========
          const { data: bookingsWithPrice, error: priceError } = await supabase
            .from('bookings')
            .select('total_price, created_at')
            .in('status', ['Confirmed', 'Completed'])
            .not('total_price', 'is', null) as { data: any[] | null; error: any };

          if (priceError) throw priceError;

          // Calculate current average
          let averageValue = 0;
          if (bookingsWithPrice && bookingsWithPrice.length > 0) {
            const totalSum = bookingsWithPrice.reduce((sum: number, b: any) => sum + (b.total_price || 0), 0);
            averageValue = totalSum / bookingsWithPrice.length;
          }

          // Calculate average value change
          const thisWeekBookingsAvg = bookingsWithPrice?.filter((b: any) =>
            new Date(b.created_at) >= sevenDaysAgo
          ) || [];

          const lastWeekBookingsPrice = bookingsWithPrice?.filter((b: any) =>
            new Date(b.created_at) >= fourteenDaysAgo &&
            new Date(b.created_at) < sevenDaysAgo
          ) || [];

          let thisWeekAvg = 0;
          let lastWeekAvg = 0;

          if (thisWeekBookingsAvg.length > 0) {
            const thisWeekSum = thisWeekBookingsAvg.reduce((sum: number, b: any) => sum + (b.total_price || 0), 0);
            thisWeekAvg = thisWeekSum / thisWeekBookingsAvg.length;
          }

          if (lastWeekBookingsPrice.length > 0) {
            const lastWeekSum = lastWeekBookingsPrice.reduce((sum: number, b: any) => sum + (b.total_price || 0), 0);
            lastWeekAvg = lastWeekSum / lastWeekBookingsPrice.length;
          }

          let averageValueChange = 0;
          if (lastWeekAvg > 0) {
            averageValueChange = ((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100;
          } else if (thisWeekAvg > 0) {
            averageValueChange = 100;
          }

          // ========== PENDING PAYOUTS ==========
          const { data: pendingPayoutsData, error: payoutError } = await supabase
            .from('bookings')
            .select('total_price, created_at')
            .eq('escrow_status', 'AWAITING_KYC')
            .not('total_price', 'is', null) as { data: any[] | null; error: any };

          if (payoutError) throw payoutError;

          let pendingPayoutsTotal = 0;
          if (pendingPayoutsData && pendingPayoutsData.length > 0) {
            pendingPayoutsTotal = pendingPayoutsData.reduce((sum: number, b: any) => sum + (b.total_price || 0), 0);
          }

          // Calculate pending payouts change
          const lastWeekPayoutsData = pendingPayoutsData?.filter((b: any) =>
            new Date(b.created_at) >= fourteenDaysAgo &&
            new Date(b.created_at) < sevenDaysAgo
          ) || [];

          const lastWeekPayoutsTotal = lastWeekPayoutsData.reduce((sum: number, b: any) => sum + (b.total_price || 0), 0);

          let pendingPayoutsChange = 0;
          if (lastWeekPayoutsTotal > 0) {
            pendingPayoutsChange = ((pendingPayoutsTotal - lastWeekPayoutsTotal) / lastWeekPayoutsTotal) * 100;
          } else if (pendingPayoutsTotal > 0) {
            pendingPayoutsChange = 100;
          }

          // ========== BOOKING TRENDS ==========
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          thirtyDaysAgo.setHours(0, 0, 0, 0);

          const { data: allTrendsBookings, error: trendsError } = await supabase
            .from('bookings')
            .select('status, created_at')
            .gte('created_at', thirtyDaysAgo.toISOString()) as { data: any[] | null; error: any };

          if (trendsError) throw trendsError;

          // Group by date
          const trendsMap = new Map<string, { confirmed: number; cancelled: number; failed: number }>();

          (allTrendsBookings ?? []).forEach((booking: any) => {
            const date = new Date(booking.created_at).toISOString().split('T')[0];
            
            if (!trendsMap.has(date)) {
              trendsMap.set(date, { confirmed: 0, cancelled: 0, failed: 0 });
            }
            
            const trend = trendsMap.get(date)!;
            if (booking.status === 'Confirmed' || booking.status === 'Completed') {
              trend.confirmed++;
            } else if (booking.status === 'Cancelled') {
              trend.cancelled++;
            } else if (booking.status === 'Failed') {
              trend.failed++;
            }
          });

          // Convert to array with 'day' property for the chart
          const trends = Array.from(trendsMap.entries())
            .map(([date, counts]) => ({
              date,
              day: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              confirmed: counts.confirmed,
              cancelled: counts.cancelled,
              failed: counts.failed
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          // Calculate status breakdown as array for donut chart
          const statusBreakdownArray = [
            { 
              label: 'Confirmed', 
              value: trends.reduce((sum, t) => sum + t.confirmed, 0), 
              color: '#0F6B6F' 
            },
            { 
              label: 'Cancelled', 
              value: trends.reduce((sum, t) => sum + t.cancelled, 0), 
              color: '#F59E0B' 
            },
            { 
              label: 'Failed', 
              value: trends.reduce((sum, t) => sum + t.failed, 0), 
              color: '#EF4444' 
            },
          ];

          // ========== OPEN DISPUTES ==========
          const openDisputesCount = 0;
          const disputesChange = 0;

          // ========== RECENT BOOKINGS ==========
          const { data: recentBookingsData, error: recentError } = await supabase
            .from('bookings')
            .select(`
              id,
              listing_id,
              status,
              start_date,
              total_price,
              first_name,
              last_name,
              email,
              created_at,
              listings!bookings_listing_id_fkey (
                name
              )
            `)
            .order('created_at', { ascending: false })
            .limit(10) as { data: any[] | null; error: any };

          if (recentError) throw recentError;

          const recentBookings = (recentBookingsData ?? []).map((booking: any) => {
            // Generate ticket ID from booking ID (first 8 characters)
            const ticketId = `#${booking.id.slice(0, 8)}`;
            
            // Calculate commission (10% of total_price)
            const commission = Math.round((booking.total_price || 0) * 0.1);
            
            // Format date
            const bookingDate = booking.start_date || booking.created_at;
            
            return {
              id: booking.id,
              ticketId: ticketId,
              property: booking.listings?.name || 'Unknown Property',
              guestName: `${booking.first_name || ''} ${booking.last_name || ''}`.trim() || 'Guest',
              status: booking.status,
              date: bookingDate,
              revenue: booking.total_price || 0,
              commission: commission,
            };
          }) || [];
            
            // ========== TOP LISTINGS ==========
            const { data: topListingsData, error: topListingsError } = await supabase
            .from('listings')
            .select(`
                id,
                name,
                user_id,
                profiles!listings_user_id_fkey (
                full_name
                )
            `) as { data: any[] | null; error: any };

            if (topListingsError) throw topListingsError;

            // Get booking counts for each listing
            const listingsWithBookings = await Promise.all(
            (topListingsData ?? []).map(async (listing: any) => {
                const { count: bookingCount, error: countError } = await supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true })
                .eq('listing_id', listing.id)
                .in('status', ['Confirmed', 'Completed']);

                if (countError) {
                console.error(`Error counting bookings for listing ${listing.id}:`, countError);
                return {
                    id: listing.id,
                    title: listing.name,
                    author: listing.profiles?.full_name || 'Unknown Host',
                    image: '/placeholder-property.jpg',
                    bookings: 0
                };
                }

                return {
                id: listing.id,
                title: listing.name,
                author: listing.profiles?.full_name || 'Unknown Host',
                image: '/placeholder-property.jpg',
                bookings: bookingCount || 0
                };
            }) || []
            );

            // Sort by booking count and take top 5
            const topListings = listingsWithBookings
            .filter(listing => listing.bookings > 0)
            .sort((a, b) => b.bookings - a.bookings)
            .slice(0, 5);

          // ========== RETURN ALL DATA ==========
          return {
            data: {
              totalBookings: {
                value: totalBookings || 0,
                change: Number(totalBookingsChange.toFixed(1)),
                changeText: 'this week',
                details: 'All time bookings',
              },
              averageValue: {
                value: `₹${Math.round(averageValue).toLocaleString()}`,
                change: Number(averageValueChange.toFixed(1)),
                changeText: 'this week',
              },
              pendingPayouts: {
                value: `₹${Math.round(pendingPayoutsTotal).toLocaleString()}`,
                change: Number(pendingPayoutsChange.toFixed(1)),
                changeText: 'this week',
              },
              openDisputes: {
                value: openDisputesCount,
                change: disputesChange,
                changeText: 'this week',
              },
              trends: trends,
              statusBreakdown: statusBreakdownArray,
              recentBookings: recentBookings,
              topListings: topListings, 
            }
          };
        } catch (error) {
          console.error('Error fetching booking metrics:', error);
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: ['BookingMetrics'],
    }),
  }),
  overrideExisting: true,
});

export const { useGetBookingMetricsQuery } = adminBookingMetricsApiSlice;