// src/pages/admin/BookingMgmt.tsx
import { useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { BookingMgmtGrid } from "@/features/bookingmgmt/BookingMgmtGrid";
import {
  useGetBookingsQuery,
  useUpdateBookingStatusMutation,
  useReleaseEscrowMutation,
  useHoldEscrowMutation,
  type Booking,
} from "@/api/features/bookings/bookingsManagementApiSlice";
import { useRealtimeRefetch } from "@/hooks/useRealtimeRefetch";
import { useNotification } from "@/hooks/useNotification";
import { Loader2 } from "lucide-react";

export default function BookingMgmt() {
  const { showNotification } = useNotification();
  const [busyId, setBusyId] = useState<string | null>(null);

  // Pull a generous page so the cards + KPIs + 6-month trend have real data.
  const {
    data: bookingsData,
    isLoading,
    error,
    refetch,
  } = useGetBookingsQuery({ limit: 500 });

  const [updateBookingStatus] = useUpdateBookingStatusMutation();
  const [releaseEscrow] = useReleaseEscrowMutation();
  const [holdEscrow] = useHoldEscrowMutation();

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

  // Admin override: release escrowed funds to the host immediately.
  const handleReleaseFunds = async (booking: Booking) => {
    const ok = window.confirm(
      `Release funds for this booking to ${booking.hostName} now?\n\n` +
        `The host receives the payout (minus the platform fee) immediately. This cannot be undone.`,
    );
    if (!ok) return;
    setBusyId(booking.id);
    try {
      const res = await releaseEscrow({ bookingId: booking.id }).unwrap();
      showNotification({
        type: "success",
        title: "Funds released",
        message: res.hostAmount
          ? `₦${Number(res.hostAmount).toLocaleString()} sent to ${booking.hostName}.`
          : `Payout released to ${booking.hostName}.`,
        duration: 5000,
      });
    } catch (e) {
      showNotification({
        type: "error",
        title: "Release failed",
        message: (e as { error?: string })?.error ?? "Could not release the funds. Please try again.",
        duration: 6000,
      });
    } finally {
      setBusyId(null);
    }
  };

  // Admin override: hold / un-hold a booking's payout (skips auto-release cron).
  const handleToggleHold = async (booking: Booking) => {
    const nextHold = !booking.payoutHold;
    setBusyId(booking.id);
    try {
      await holdEscrow({ bookingId: booking.id, hold: nextHold }).unwrap();
      showNotification({
        type: "success",
        title: nextHold ? "Payout held" : "Hold removed",
        message: nextHold
          ? "Auto-release will skip this booking until you remove the hold."
          : "This booking is eligible for auto-release again.",
        duration: 4000,
      });
    } catch (e) {
      showNotification({
        type: "error",
        title: "Could not update hold",
        message: (e as { error?: string })?.error ?? "Please try again.",
        duration: 6000,
      });
    } finally {
      setBusyId(null);
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
        <BookingMgmtGrid
          bookings={bookings}
          onStatusUpdate={handleStatusUpdate}
          onReleaseFunds={handleReleaseFunds}
          onToggleHold={handleToggleHold}
          busyId={busyId}
        />
      )}
    </PageWrapper>
  );
}
