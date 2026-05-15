// src/features/bookingmgmt/BookingMgmtGrid.tsx
import { useState, useEffect } from "react";
import type { Booking } from "@/data/bookingMgmtData";
import { BookingTable } from "./BookingTable";
import { ManagementGrid } from "@/components/layout/ManagementGrid";
import { useNotification } from "@/hooks/useNotification";
import {
  commonActions,
  commonFilters,
  commonSearchConfigs,
} from "@/utils/managementActions";
import {
  useUpdateBookingStatusMutation,
  useUpdatePaymentStatusMutation,
  useGetBookingsQuery,
} from "@/api/features/bookings/bookingsManagementApiSlice";

interface BookingMgmtGridProps {
  data: {
    bookings: Booking[];
    statusCounts: {
      all: number;
      pending: number;
      confirmed: number;
      cancelled: number;
      completed: number;
    };
    paymentStatusCounts: {
      all: number;
      awaitingKyc: number;
      deliveryConfirmed: number;
    };
  };
}

export function BookingMgmtGrid({ data }: BookingMgmtGridProps) {
  const { showNotification } = useNotification();
  const [updateBookingStatus] = useUpdateBookingStatusMutation();
  const [updatePaymentStatus] = useUpdatePaymentStatusMutation();
  const { refetch } = useGetBookingsQuery({});

  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] =
    useState<string>("all");
  const [searchTerm, _setSearchTerm] = useState<string>("");
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>(
    data.bookings,
  );
  const getPaymentStatusDisplay = (status: string): string => {
  if (status === "AWAITING_KYC") return "Awaiting KYC";
  if (status === "DELIVERY_CONFIRMED") return "Delivery Confirmed";
  return status;
};


  const [_isExporting, setIsExporting] = useState(false);

  // Apply filters
  useEffect(() => {
    let filtered = [...data.bookings];

    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (booking) => booking.status === selectedStatus,
      );
    }

    if (selectedPaymentStatus !== "all") {
      filtered = filtered.filter((booking) => {
        const paymentStatusMap: Record<string, string> = {
          AWAITING_KYC: "Awaiting KYC",
          DELIVERY_CONFIRMED: "Delivery Confirmed",
        };
        const mappedStatus =
          paymentStatusMap[booking.paymentStatus] || booking.paymentStatus;
        return mappedStatus === selectedPaymentStatus;
      });
    }

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.guestName.toLowerCase().includes(term) ||
          booking.hostName.toLowerCase().includes(term) ||
          booking.propertyName.toLowerCase().includes(term) ||
          booking.ticketId.toLowerCase().includes(term),
      );
    }

    setFilteredBookings(filtered);
  }, [data.bookings, selectedStatus, selectedPaymentStatus, searchTerm]);

  // Export function - generates and downloads CSV
  const exportToCSV = () => {
    setIsExporting(true);

    try {
      // Define CSV headers
      const headers = [
        "Ticket ID",
        "Guest Name",
        "Guest Email",
        "Host Name",
        "Property Name",
        "Dates",
        "Status",
        "Payment Status",
        "Total Price (₹)",
        "Commission (₹)",
      ];

      // Convert filtered bookings to CSV rows
      const rows = filteredBookings.map((booking) => [
        booking.ticketId,
        booking.guestName,
        booking.guestEmail || "",
        booking.hostName,
        booking.propertyName,
        booking.dates,
        booking.status,
       getPaymentStatusDisplay(booking.paymentStatus),
    
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `bookings_export_${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showNotification({
        type: "success",
        title: "Export Successful",
        message: `${filteredBookings.length} bookings have been exported successfully.`,
        duration: 4000,
      });
    } catch (error) {
      console.error("Export failed:", error);
      showNotification({
        type: "error",
        title: "Export Failed",
        message: "Failed to export bookings. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Action handlers
  const handleConfirmBooking = async (
    bookingId: string,
    entityName: string,
  ) => {
    try {
      await updateBookingStatus({ bookingId, status: "Confirmed" }).unwrap();
      showNotification({
        type: "success",
        title: "Booking Confirmed",
        message: `Booking for ${entityName} has been confirmed successfully.`,
        duration: 5000,
      });
      setTimeout(() => refetch(), 1000);
    } catch (error) {
      showNotification({
        type: "error",
        title: "Action Failed",
        message: `Failed to confirm booking for ${entityName}.`,
        duration: 5000,
      });
    }
  };

  const handleCancelBooking = async (bookingId: string, entityName: string) => {
    try {
      await updateBookingStatus({ bookingId, status: "Cancelled" }).unwrap();
      showNotification({
        type: "success",
        title: "Booking Cancelled",
        message: `Booking for ${entityName} has been cancelled successfully.`,
        duration: 5000,
      });
      setTimeout(() => refetch(), 1000);
    } catch (error) {
      showNotification({
        type: "error",
        title: "Action Failed",
        message: `Failed to cancel booking for ${entityName}.`,
        duration: 5000,
      });
    }
  };

  const handleHoldBooking = async (bookingId: string, entityName: string) => {
    try {
      await updatePaymentStatus({
        bookingId,
        paymentStatus: "ON_HOLD",
      }).unwrap();
      showNotification({
        type: "success",
        title: "Booking Put on Hold",
        message: `Booking for ${entityName} has been put on hold.`,
        duration: 5000,
      });
      setTimeout(() => refetch(), 1000);
    } catch (error) {
      showNotification({
        type: "error",
        title: "Action Failed",
        message: `Failed to put booking on hold for ${entityName}.`,
        duration: 5000,
      });
    }
  };

  const handleSendNotification = (bookingId: string, entityName: string) => {
    showNotification({
      type: "success",
      title: "Notification Sent",
      message: `Your notification has been sent to ${entityName}.`,
      duration: 4000,
    });
  };

  const filters = [
    {
      ...commonFilters.status([
        { value: "Confirmed", label: "Confirmed" },
        { value: "Pending", label: "Pending" },
        { value: "Cancelled", label: "Cancelled" },
        { value: "Completed", label: "Completed" },
      ]),
      value: selectedStatus,
      onChange: (value: string) => setSelectedStatus(value),
    },
    {
      key: "paymentStatus",
      label: "Payment Status",
      value: selectedPaymentStatus,
      onChange: (value: string) => setSelectedPaymentStatus(value),
      options: [
        { value: "all", label: "All" },
        { value: "Awaiting KYC", label: "Awaiting KYC" },
        { value: "Delivery Confirmed", label: "Delivery Confirmed" },
      ],
    },
  ];

  const actions = [
    commonActions.view((entityId) => {
      console.log("View booking:", entityId);
    }),
    commonActions.confirm(handleConfirmBooking),
    commonActions.cancel(handleCancelBooking),
    commonActions.hold(handleHoldBooking),
    commonActions.sendNotification(handleSendNotification),
  ];

  const renderTable = (
    filteredData: Booking[],
    onAction: (entityId: string, action: string) => void,
  ) => <BookingTable bookings={filteredData} onBookingAction={onAction} />;

  const getEntityName = (booking: Booking) => booking.guestName;

  return (
    <ManagementGrid
      data={filteredBookings}
      entityName="bookings"
      searchPlaceholder="Search bookings by guest, host, property, or ticket ID..."
      searchConfig={{
        ...commonSearchConfigs.booking,
      }}
      filters={filters}
      actions={actions}
      renderTable={renderTable}
      onExport={exportToCSV}
      getEntityName={getEntityName}
    />
  );
}
