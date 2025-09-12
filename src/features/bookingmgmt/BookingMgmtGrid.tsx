import type { BookingMgmtData, Booking } from "@/data/bookingMgmtData";
import { BookingTable } from "./BookingTable";
import { ManagementGrid } from "@/components/layout/ManagementGrid";
import { useNotification } from "@/hooks/useNotification";
import {
  commonActions,
  commonFilters,
  commonSearchConfigs,
} from "@/utils/managementActions";

interface BookingMgmtGridProps {
  data: BookingMgmtData;
}

export function BookingMgmtGrid({ data }: BookingMgmtGridProps) {
  const { showNotification } = useNotification();

  // Define filter configurations using common patterns
  const filters = [
    commonFilters.status([
      { value: "Confirmed", label: "Confirmed" },
      { value: "Pending", label: "Pending" },
      { value: "Cancelled", label: "Cancelled" },
      { value: "On Hold", label: "On Hold" },
    ]),
    {
      key: "paymentStatus",
      label: "Payment Status",
      value: "all",
      onChange: () => {}, // Will be overridden by ManagementGrid
      options: [
        { value: "Paid", label: "Paid" },
        { value: "On Hold", label: "On Hold" },
        { value: "Refunded", label: "Refunded" },
      ],
    },
  ];

  // Action handlers
  const handleConfirmBooking = (
    // entityId: string,
    entityName: string
  ) => {
    showNotification({
      type: "success",
      title: "Booking Confirmed",
      message: `Booking for ${entityName} has been confirmed successfully.`,
      duration: 5000,
    });
  };

  const handleCancelBooking = (
    // entityId: string,
    entityName: string
  ) => {
    showNotification({
      type: "success",
      title: "Booking Cancelled",
      message: `Booking for ${entityName} has been cancelled successfully.`,
      duration: 5000,
    });
  };

  const handleHoldBooking = (
    // entityId: string,
    entityName: string
  ) => {
    showNotification({
      type: "success",
      title: "Booking Put on Hold",
      message: `Booking for ${entityName} has been put on hold.`,
      duration: 5000,
    });
  };

  const handleSendNotification = (
    // entityId: string,
    entityName: string
    // message?: string
  ) => {
    showNotification({
      type: "success",
      title: "Notification Sent",
      message: `Your notification has been sent to ${entityName}.`,
      duration: 4000,
    });
  };

  const handleExport = () => {
    showNotification({
      type: "info",
      title: "Export Started",
      message:
        "Your booking data export is being prepared. You'll receive a download link shortly.",
      duration: 3000,
    });
  };

  // Define actions using common action patterns
  const actions = [
    commonActions.view((entityId) => {
      console.log("View booking:", entityId);
    }),
    commonActions.confirm(handleConfirmBooking),
    commonActions.cancel(handleCancelBooking),
    commonActions.hold(handleHoldBooking),
    commonActions.sendNotification(handleSendNotification),
  ];

  // Table render function
  const renderTable = (
    filteredData: Booking[],
    onAction: (entityId: string, action: string) => void
  ) => <BookingTable bookings={filteredData} onBookingAction={onAction} />;

  // Entity name extractor for bookings
  const getEntityName = (booking: Booking) => booking.guestName;

  return (
    <ManagementGrid
      data={data.bookings}
      entityName='bookings'
      searchPlaceholder='Search bookings by guest, host, property, or ticket ID...'
      searchConfig={commonSearchConfigs.booking}
      filters={filters}
      actions={actions}
      renderTable={renderTable}
      onExport={handleExport}
      getEntityName={getEntityName}
    />
  );
}
