import { useState } from "react";
import { type Booking } from "@/data/bookingMgmtData";
import { Badge } from "@/components/ui/badge";
import { getStatusVariant } from "@/utils/statusBadges";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { ActionMenuTrigger } from "@/components/ui/ActionMenuTrigger";
import { BookingDetailsModal } from "@/features/bookingmgmt/BookingDetailsModal";
import { DataTable, type TableColumn } from "@/components/layout/DataTable";
import { Eye, Ban, Bell, CheckCircle, XCircle } from "lucide-react";

interface BookingTableProps {
  bookings: Booking[];
  onBookingAction?: (bookingId: string, action: string) => void;
}

export function BookingTable({ bookings, onBookingAction }: BookingTableProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBookingAction = (bookingId: string, action: string) => {
    if (action === "view") {
      const booking = bookings.find((b) => b.id === bookingId);
      if (booking) {
        setSelectedBooking(booking);
        setIsModalOpen(true);
      }
    } else {
      // Handle other actions
      onBookingAction?.(bookingId, action);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const getStatusBadge = (status: Booking["status"]) => (
    <Badge variant={getStatusVariant(status, "booking")} className='text-xs'>
      {status}
    </Badge>
  );

  const getPaymentBadge = (paymentStatus: Booking["paymentStatus"]) => (
    <Badge
      variant={getStatusVariant(paymentStatus, "payment")}
      className='text-xs'
    >
      {paymentStatus}
    </Badge>
  );

  const columns: TableColumn<Booking>[] = [
    {
      key: "guestName",
      header: "Guest Name",
      width: "w-48",
      render: (booking) => (
        <div className='flex items-center'>
          <Avatar className='h-8 w-8 mr-3'>
            <AvatarImage src={booking.avatar} alt={booking.guestName} />
            <AvatarFallback>
              {booking.guestName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className='text-sm font-medium text-gray-900'>
            {booking.guestName}
          </div>
        </div>
      ),
    },
    {
      key: "hostName",
      header: "Host Name",
      width: "w-40",
      render: (booking) => (
        <span className='text-sm text-gray-900'>{booking.hostName}</span>
      ),
    },
    {
      key: "propertyName",
      header: "Property Name",
      width: "w-48",
      render: (booking) => (
        <span className='text-sm text-gray-900'>{booking.propertyName}</span>
      ),
    },
    {
      key: "dates",
      header: "Dates",
      width: "w-32",
      render: (booking) => (
        <span className='text-sm text-gray-500'>{booking.dates}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "w-28",
      render: (booking) => getStatusBadge(booking.status),
    },
    {
      key: "paymentStatus",
      header: "Payment Status",
      width: "w-32",
      render: (booking) => getPaymentBadge(booking.paymentStatus),
    },
  ];

  const renderRowAction = (booking: Booking) => {
    const menuItems = [
      {
        label: "View",
        action: "view",
        icon: <Eye className='w-4 h-4' />,
      },
      {
        label: "Confirm Booking",
        action: "confirm",
        icon: <CheckCircle className='w-4 h-4' />,
      },
      {
        label: "Cancel Booking",
        action: "cancel",
        icon: <XCircle className='w-4 h-4' />,
        variant: "destructive" as const,
      },
      {
        label: "Hold Booking",
        action: "hold",
        icon: <Ban className='w-4 h-4' />,
      },
      {
        label: "Send Notification",
        action: "send-notification",
        icon: <Bell className='w-4 h-4' />,
      },
    ];

    return (
      <ActionMenu
        items={menuItems}
        onSelect={(action) => handleBookingAction(booking.id, action)}
        trigger={<ActionMenuTrigger />}
      />
    );
  };

  return (
    <>
      <DataTable
        data={bookings}
        columns={columns}
        keyExtractor={(booking) => booking.id}
        renderRowAction={renderRowAction}
        onRowAction={(booking, action) =>
          handleBookingAction(booking.id, action)
        }
        showCheckboxes={true}
        showPagination={true}
        maxHeight='500px'
        initialItemsPerPage={10}
      />

      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
}
