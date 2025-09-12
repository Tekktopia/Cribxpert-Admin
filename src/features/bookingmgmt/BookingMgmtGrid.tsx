import { useState, useMemo } from "react";
import { Upload } from "lucide-react";
import type { BookingMgmtData } from "@/data/bookingMgmtData";
import {
  SearchAndFilters,
  type FilterConfig,
  type ActionButton,
} from "@/components/ui/SearchAndFilters";
import { BookingTable } from "./BookingTable";
import {
  ConfirmationModal,
  SendNotificationModal,
} from "@/components/ui/ActionModals";
import { useNotification } from "@/hooks/useNotification";

interface BookingMgmtGridProps {
  data: BookingMgmtData;
}

export function BookingMgmtGrid({ data }: BookingMgmtGridProps) {
  const { showNotification } = useNotification();
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // Modal states
  const [selectedBooking, setSelectedBooking] = useState<{
    id: string;
    guestName: string;
  } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Filter bookings based on search and filters
  const filteredBookings = useMemo(() => {
    return data.bookings.filter((booking) => {
      const matchesSearch =
        booking.guestName.toLowerCase().includes(searchValue.toLowerCase()) ||
        booking.hostName.toLowerCase().includes(searchValue.toLowerCase()) ||
        booking.propertyName
          .toLowerCase()
          .includes(searchValue.toLowerCase()) ||
        booking.ticketId.toLowerCase().includes(searchValue.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;

      const matchesPayment =
        paymentFilter === "all" || booking.paymentStatus === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [data.bookings, searchValue, statusFilter, paymentFilter]);

  const handleBookingAction = (bookingId: string, action: string) => {
    const booking = data.bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    setSelectedBooking({ id: bookingId, guestName: booking.guestName });

    switch (action) {
      case "confirm":
        setShowConfirmModal(true);
        break;
      case "cancel":
        setShowCancelModal(true);
        break;
      case "hold":
        setShowHoldModal(true);
        break;
      case "send-notification":
        setShowNotificationModal(true);
        break;
      default:
        console.log("Booking action:", bookingId, action);
    }
  };

  const handleConfirmBooking = async () => {
    try {
      console.log("Confirming booking:", selectedBooking?.guestName);
      setShowConfirmModal(false);

      showNotification({
        type: "success",
        title: "Booking Confirmed",
        message: `Booking for ${selectedBooking?.guestName} has been confirmed successfully.`,
        duration: 5000,
      });

      setSelectedBooking(null);
    } catch (error) {
      console.error("Error confirming booking:", error);
      showNotification({
        type: "error",
        title: "Failed to Confirm Booking",
        message: "There was an error confirming the booking. Please try again.",
        duration: 5000,
      });
    }
  };

  const handleCancelBooking = async () => {
    try {
      console.log("Cancelling booking:", selectedBooking?.guestName);
      setShowCancelModal(false);

      showNotification({
        type: "success",
        title: "Booking Cancelled",
        message: `Booking for ${selectedBooking?.guestName} has been cancelled successfully.`,
        duration: 5000,
      });

      setSelectedBooking(null);
    } catch (error) {
      console.error("Error cancelling booking:", error);
      showNotification({
        type: "error",
        title: "Failed to Cancel Booking",
        message: "There was an error cancelling the booking. Please try again.",
        duration: 5000,
      });
    }
  };

  const handleHoldBooking = async () => {
    try {
      console.log("Putting booking on hold:", selectedBooking?.guestName);
      setShowHoldModal(false);

      showNotification({
        type: "success",
        title: "Booking Put on Hold",
        message: `Booking for ${selectedBooking?.guestName} has been put on hold.`,
        duration: 5000,
      });

      setSelectedBooking(null);
    } catch (error) {
      console.error("Error putting booking on hold:", error);
      showNotification({
        type: "error",
        title: "Failed to Hold Booking",
        message:
          "There was an error putting the booking on hold. Please try again.",
        duration: 5000,
      });
    }
  };

  const handleSendNotification = async (message: string) => {
    try {
      console.log(
        "Sending notification to:",
        selectedBooking?.guestName,
        "Message:",
        message
      );

      setShowNotificationModal(false);

      showNotification({
        type: "success",
        title: "Notification Sent",
        message: `Your notification has been sent to ${selectedBooking?.guestName}.`,
        duration: 4000,
      });

      setSelectedBooking(null);
    } catch (error) {
      console.error("Error sending notification:", error);
      showNotification({
        type: "error",
        title: "Failed to Send Notification",
        message:
          "There was an error sending the notification. Please try again.",
        duration: 5000,
      });
    }
  };

  const handleExport = () => {
    console.log("Export bookings");

    showNotification({
      type: "info",
      title: "Export Started",
      message:
        "Your booking data export is being prepared. You'll receive a download link shortly.",
      duration: 3000,
    });
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
    setPaymentFilter("all");
    setSearchValue("");
  };

  // Define filter configurations
  const filters: FilterConfig[] = [
    {
      key: "status",
      label: "All Status",
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: "Confirmed", label: "Confirmed" },
        { value: "Pending", label: "Pending" },
        { value: "Cancelled", label: "Cancelled" },
        { value: "On Hold", label: "On Hold" },
      ],
    },
    {
      key: "payment",
      label: "Payment Status",
      value: paymentFilter,
      onChange: setPaymentFilter,
      options: [
        { value: "Paid", label: "Paid" },
        { value: "On Hold", label: "On Hold" },
        { value: "Refunded", label: "Refunded" },
      ],
    },
  ];

  // Define action buttons
  const actionButtons: ActionButton[] = [
    {
      label: "Export",
      icon: <Upload className='w-4 h-4 ml-2' />,
      onClick: handleExport,
      variant: "primary",
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Search and Filters */}
      <SearchAndFilters
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder='Search bookings by guest, host, property, or ticket ID...'
        filters={filters}
        actionButtons={actionButtons}
        resultsInfo={{
          total: data.bookings.length,
          filtered: filteredBookings.length,
          entityName: "bookings",
        }}
        showActiveFilters={true}
        onClearFilters={handleClearFilters}
      />

      {/* Bookings Table */}
      <BookingTable
        bookings={filteredBookings}
        onBookingAction={handleBookingAction}
      />

      {/* Modals */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title='Confirm Booking'
        message={`Are you sure you want to confirm the booking for ${selectedBooking?.guestName}?`}
        confirmLabel='Confirm Booking'
        onConfirm={handleConfirmBooking}
        variant='primary'
      />

      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title='Cancel Booking'
        message={`Are you sure you want to cancel the booking for ${selectedBooking?.guestName}? This action cannot be undone.`}
        confirmLabel='Cancel Booking'
        onConfirm={handleCancelBooking}
        variant='destructive'
      />

      <ConfirmationModal
        isOpen={showHoldModal}
        onClose={() => setShowHoldModal(false)}
        title='Hold Booking'
        message={`Are you sure you want to put the booking for ${selectedBooking?.guestName} on hold?`}
        confirmLabel='Hold Booking'
        onConfirm={handleHoldBooking}
        variant='primary'
      />

      <SendNotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        userName={selectedBooking?.guestName || ""}
        onSend={handleSendNotification}
      />
    </div>
  );
}
