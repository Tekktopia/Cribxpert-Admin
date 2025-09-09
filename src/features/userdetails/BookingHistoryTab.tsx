import { Badge } from "@/components/ui/badge";
import { DataTable, type TableColumn } from "@/components/layout/DataTable";
import { MoreHorizontal } from "lucide-react";
import {
  mockBookingHistoryData,
  type BookingHistoryRecord,
} from "@/data/bookingHistoryData";

interface BookingHistoryTabProps {
  userId: string;
}

export function BookingHistoryTab({ userId }: BookingHistoryTabProps) {
  console.log(userId);
  // In a real app, you'd filter by userId or fetch user-specific booking data
  const bookingData = mockBookingHistoryData;

  const getStatusBadgeVariant = (status: BookingHistoryRecord["status"]) => {
    switch (status) {
      case "Completed":
        return "success";
      case "Cancelled":
        return "destructive";
      case "Active":
        return "pending";
      case "Pending":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getPaymentBadgeVariant = (payment: BookingHistoryRecord["payment"]) => {
    switch (payment) {
      case "Paid":
        return "success";
      case "Refunded":
        return "destructive";
      case "Pending":
        return "warning";
      case "Failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const columns: TableColumn<BookingHistoryRecord>[] = [
    {
      key: "ticketId",
      header: "Ticket ID",
      render: (item) => (
        <span className='text-sm font-medium text-gray-900'>
          {item.ticketId}
        </span>
      ),
    },
    {
      key: "property",
      header: "Property",
      render: (item) => (
        <span className='text-sm text-gray-900'>{item.property}</span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (item) => (
        <span className='text-sm text-gray-600'>{item.date}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <Badge variant={getStatusBadgeVariant(item.status)}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (item) => (
        <span className='text-sm font-medium text-gray-900'>{item.amount}</span>
      ),
    },
    {
      key: "payment",
      header: "Payment",
      render: (item) => (
        <Badge variant={getPaymentBadgeVariant(item.payment)}>
          {item.payment}
        </Badge>
      ),
    },
  ];

  const renderRowAction = (item: BookingHistoryRecord) => (
    <button
      className='text-gray-400 hover:text-gray-600 p-1'
      onClick={() => console.log("Action for booking:", item.ticketId)}
    >
      <MoreHorizontal className='w-4 h-4' />
    </button>
  );

  return (
    <div className='border border-[#EBEBEB] rounded-b-lg'>
      {/* Header */}
      <h3 className='text-lg font-semibold py-3 px-4 bg-[#E6EFF1] mb-0'>
        Booking History
      </h3>

      {/* Data Table */}
      <DataTable
        data={bookingData}
        columns={columns}
        keyExtractor={(item) => item.id}
        renderRowAction={renderRowAction}
        showCheckboxes={true}
        showPagination={true}
        initialItemsPerPage={10}
        itemsPerPageOptions={[5, 10, 25, 50]}
        maxHeight='500px'
        className='border-0 rounded-none'
        tableClassName=''
      />
    </div>
  );
}
