export interface BookingHistoryRecord {
  id: string;
  ticketId: string;
  property: string;
  date: string;
  status: "Completed" | "Cancelled" | "Pending" | "Active";
  amount: string;
  payment: "Paid" | "Refunded" | "Pending" | "Failed";
}

export const mockBookingHistoryData: BookingHistoryRecord[] = [
  {
    id: "1",
    ticketId: "100012",
    property: "Cozy Beach House",
    date: "Aug 15-18, 2025",
    status: "Completed",
    amount: "₦150,000",
    payment: "Paid",
  },
  {
    id: "2",
    ticketId: "100013",
    property: "Makinwaa's Cottage",
    date: "Aug 18-21, 2025",
    status: "Cancelled",
    amount: "₦250,000",
    payment: "Refunded",
  },
  {
    id: "3",
    ticketId: "100023",
    property: "City Center Studio",
    date: "Aug 19-22, 2025",
    status: "Completed",
    amount: "₦200,000",
    payment: "Paid",
  },
  {
    id: "4",
    ticketId: "100024",
    property: "Mountain View Villa",
    date: "Sep 01-05, 2025",
    status: "Active",
    amount: "₦500,000",
    payment: "Paid",
  },
  {
    id: "5",
    ticketId: "100025",
    property: "Downtown Apartment",
    date: "Sep 10-12, 2025",
    status: "Pending",
    amount: "₦180,000",
    payment: "Pending",
  },
  {
    id: "6",
    ticketId: "100026",
    property: "Lakeside Cabin",
    date: "Sep 15-20, 2025",
    status: "Cancelled",
    amount: "₦320,000",
    payment: "Refunded",
  },
  {
    id: "7",
    ticketId: "100027",
    property: "Urban Loft",
    date: "Sep 25-28, 2025",
    status: "Completed",
    amount: "₦275,000",
    payment: "Paid",
  },
  {
    id: "8",
    ticketId: "100028",
    property: "Seaside Villa",
    date: "Oct 01-07, 2025",
    status: "Active",
    amount: "₦450,000",
    payment: "Paid",
  },
];
