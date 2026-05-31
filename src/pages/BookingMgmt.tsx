// src/pages/admin/BookingMgmt.tsx
import { PageWrapper } from "@/components/layout/PageWrapper";
import { BookingMgmtGrid } from "@/features/bookingmgmt/BookingMgmtGrid";
import {
  useGetBookingsQuery,
  useUpdateBookingStatusMutation,
} from "@/api/features/bookings/bookingsManagementApiSlice";
import { useRealtimeRefetch } from "@/hooks/useRealtimeRefetch";
import { useNotification } from "@/hooks/useNotification";
import { Loader2 } from "lucide-react";

export default function BookingMgmt() {
  const { showNotification } = useNotification();

  // Pull a generous page so the cards + KPIs + 6-month trend have real data.
  const {
    data: bookingsData,
    isLoading,
    error,
    refetch,
  } = useGetBookingsQuery({ limit: 500 });

  const [updateBookingStatus] = useUpdateBookingStatusMutation();

  // Live updates — any change to bookings re-pulls the list.
  useRealtimeRefetch(["bookings"], refetch, "admin-bookings");

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    try {
      await updateBookingStatus({ bookingId, status }).unwrap();
      showNotification({
        type: "success",
        title: `Booking ${status}`,
        message: `The booking has been marked as ${status.toLowerCase()}.`,
        duration: 4000,
      });
    } catch {
      showNotification({
        type: "error",
        title: "Update failed",
        message: "Could not update the booking status. Please try again.",
        duration: 5000,
      });
    }
  };

  if (isLoading) {
    return (
      <PageWrapper
        title="Bookings Management"
        subtitle="Track all bookings, monitor statuses, and manage payment related actions"
        isPopulated={false}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          <span className="ml-2">Loading bookings...</span>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper
        title="Bookings Management"
        subtitle="Track all bookings, monitor statuses, and manage payment related actions"
        isPopulated={false}
      >
        <div className="text-red-500 text-center p-8">
          Error loading bookings. Please try again.
        </div>
      </PageWrapper>
    );
  }

  const bookings = bookingsData?.bookings ?? [];
  const isPopulated = bookings.length > 0;

  return (
    <PageWrapper
      title="Bookings Management"
      subtitle="Track all bookings, monitor statuses, and manage payment related actions"
      isPopulated={isPopulated}
      emptyState={{
        iconUrl: "/svg/bookings-simple.svg",
        title: "No bookings yet",
        subtitle:
          "All property bookings made by guests will show here once they start rolling in.",
      }}
    >
      {isPopulated && (
        <BookingMgmtGrid bookings={bookings} onStatusUpdate={handleStatusUpdate} />
      )}
    </PageWrapper>
  );
}
