// src/pages/admin/BookingMgmt.tsx
import { PageWrapper } from "@/components/layout/PageWrapper";
import { BookingMgmtGrid } from "@/features/bookingmgmt/BookingMgmtGrid";
import { 
  useGetBookingsQuery,
  useGetBookingStatusCountsQuery,
  useGetPaymentStatusCountsQuery 
} from "@/api/features/bookings/bookingsManagementApiSlice";
import { Loader2 } from "lucide-react";

export default function BookingMgmt() {
  // Fetch bookings directly
  const { 
    data: bookingsData, 
    isLoading: bookingsLoading, 
    error: bookingsError 
  } = useGetBookingsQuery({ limit: 10 });
  
  // Fetch status counts
  const { 
    data: statusCounts, 
    isLoading: statusLoading 
  } = useGetBookingStatusCountsQuery();
  
  // Fetch payment status counts
  const { 
    data: paymentCounts, 
    isLoading: paymentLoading 
  } = useGetPaymentStatusCountsQuery();

  const isLoading = bookingsLoading || statusLoading || paymentLoading;

  if (isLoading) {
    return (
      <PageWrapper
        title='Bookings Management'
        subtitle='Track all bookings, monitor statuses, and manage payment related actions'
        isPopulated={false}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          <span className="ml-2">Loading bookings...</span>
        </div>
      </PageWrapper>
    );
  }

  if (bookingsError) {
    return (
      <PageWrapper
        title='Bookings Management'
        subtitle='Track all bookings, monitor statuses, and manage payment related actions'
        isPopulated={false}
      >
        <div className="text-red-500 text-center p-8">
          Error loading bookings. Please try again.
        </div>
      </PageWrapper>
    );
  }

  // Transform bookings data to match your component's expected format
  const transformedData = {
    bookings: bookingsData?.bookings.map(booking => ({
      id: booking.id,
      ticketId: booking.ticketId,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      hostName: booking.hostName,
      propertyName: booking.propertyName,
      dates: booking.dateRange,
      status: booking.status,
      paymentStatus: booking.paymentStatus === 'AWAITING_KYC' ? 'Awaiting KYC' 
        : booking.paymentStatus === 'DELIVERY_CONFIRMED' ? 'Delivery Confirmed' 
        : booking.paymentStatus,
      totalPrice: booking.totalPrice,
      commission: booking.commission,
    })) || [],
    statusCounts: {
      all: statusCounts?.['All Status'] || 0,
      pending: statusCounts?.['Pending'] || 0,
      confirmed: statusCounts?.['Confirmed'] || 0,
      cancelled: statusCounts?.['Cancelled'] || 0,
      completed: statusCounts?.['Completed'] || 0,
    },
    paymentStatusCounts: {
      all: paymentCounts?.['All'] || 0,
      awaitingKyc: paymentCounts?.['AWAITING_KYC'] || 0,
      deliveryConfirmed: paymentCounts?.['DELIVERY_CONFIRMED'] || 0,
    }
  };

  const isPopulated = transformedData.bookings.length > 0;

  return (
    <PageWrapper
      title='Bookings Management'
      subtitle='Track all bookings, monitor statuses, and manage payment related actions'
      isPopulated={isPopulated}
      emptyState={{
        iconUrl: "/svg/bookings-simple.svg",
        title: "No bookings yet",
        subtitle: "All property bookings made by guests will show here once they start rolling in.",
      }}
    >
      {isPopulated && <BookingMgmtGrid data={transformedData} />}
    </PageWrapper>
  );
}