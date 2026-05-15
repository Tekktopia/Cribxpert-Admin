export interface Booking {
  id: string;
  ticketId: string;
  guestName: string;
  guestEmail?: string;
  hostName: string;
  propertyName: string;
  dates: string;
  status: "Confirmed" | "Pending" | "Cancelled" | "On Hold";
  paymentStatus: "Paid" | "Refunded" | "On Hold";
  amount: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  avatar?: string;
}

export interface BookingMgmtData {
  bookings: Booking[];
  stats: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
  };
}

export const mockBookingMgmtData: BookingMgmtData = {
  bookings: [
    {
      id: "1",
      ticketId: "BK001",
      guestName: "Sarah Johnson",
      hostName: "Robert Smith",
      propertyName: "Makinwaa's Cottage",
      dates: "5 - 7 May 2025",
      status: "Confirmed",
      paymentStatus: "Paid",
      amount: "₦150,000",
      checkIn: "2025-05-05",
      checkOut: "2025-05-07",
      guests: 2,
      avatar: "/avatars/sarah.png",
    },
    {
      id: "2",
      ticketId: "BK002",
      guestName: "Sarah Johnson",
      hostName: "Robert Smith",
      propertyName: "Makinwaa's Cottage",
      dates: "5 - 7 May 2025",
      status: "Pending",
      paymentStatus: "On Hold",
      amount: "₦200,000",
      checkIn: "2025-05-05",
      checkOut: "2025-05-07",
      guests: 4,
      avatar: "/avatars/sarah.png",
    },
    {
      id: "3",
      ticketId: "BK003",
      guestName: "Sarah Johnson",
      hostName: "Robert Smith",
      propertyName: "Makinwaa's Cottage",
      dates: "5 - 7 May 2025",
      status: "Confirmed",
      paymentStatus: "Paid",
      amount: "₦180,000",
      checkIn: "2025-05-05",
      checkOut: "2025-05-07",
      guests: 3,
      avatar: "/avatars/sarah.png",
    },
    {
      id: "4",
      ticketId: "BK004",
      guestName: "Sarah Johnson",
      hostName: "Robert Smith",
      propertyName: "Makinwaa's Cottage",
      dates: "5 - 7 May 2025",
      status: "Cancelled",
      paymentStatus: "Refunded",
      amount: "₦120,000",
      checkIn: "2025-05-05",
      checkOut: "2025-05-07",
      guests: 2,
      avatar: "/avatars/sarah.png",
    },
    {
      id: "5",
      ticketId: "BK005",
      guestName: "Sarah Johnson",
      hostName: "Robert Smith",
      propertyName: "Makinwaa's Cottage",
      dates: "5 - 7 May 2025",
      status: "Cancelled",
      paymentStatus: "Refunded",
      amount: "₦90,000",
      checkIn: "2025-05-05",
      checkOut: "2025-05-07",
      guests: 1,
      avatar: "/avatars/sarah.png",
    },
    {
      id: "6",
      ticketId: "BK006",
      guestName: "Sarah Johnson",
      hostName: "Robert Smith",
      propertyName: "Makinwaa's Cottage",
      dates: "5 - 7 May 2025",
      status: "Pending",
      paymentStatus: "On Hold",
      amount: "₦300,000",
      checkIn: "2025-05-05",
      checkOut: "2025-05-07",
      guests: 6,
      avatar: "/avatars/sarah.png",
    },
    {
      id: "7",
      ticketId: "BK007",
      guestName: "Sarah Johnson",
      hostName: "Robert Smith",
      propertyName: "Makinwaa's Cottage",
      dates: "5 - 7 May 2025",
      status: "Confirmed",
      paymentStatus: "Paid",
      amount: "₦220,000",
      checkIn: "2025-05-05",
      checkOut: "2025-05-07",
      guests: 4,
      avatar: "/avatars/sarah.png",
    },
    {
      id: "8",
      ticketId: "BK008",
      guestName: "Sarah Johnson",
      hostName: "Robert Smith",
      propertyName: "Makinwaa's Cottage",
      dates: "5 - 7 May 2025",
      status: "Confirmed",
      paymentStatus: "Paid",
      amount: "₦160,000",
      checkIn: "2025-05-05",
      checkOut: "2025-05-07",
      guests: 3,
      avatar: "/avatars/sarah.png",
    },
    {
      id: "9",
      ticketId: "BK009",
      guestName: "Sarah Johnson",
      hostName: "Robert Smith",
      propertyName: "Makinwaa's Cottage",
      dates: "5 - 7 May 2025",
      status: "Confirmed",
      paymentStatus: "Paid",
      amount: "₦190,000",
      checkIn: "2025-05-05",
      checkOut: "2025-05-07",
      guests: 2,
      avatar: "/avatars/sarah.png",
    },
    {
      id: "10",
      ticketId: "BK010",
      guestName: "Sarah Johnson",
      hostName: "Robert Smith",
      propertyName: "Makinwaa's Cottage",
      dates: "5 - 7 May 2025",
      status: "Cancelled",
      paymentStatus: "Refunded",
      amount: "₦140,000",
      checkIn: "2025-05-05",
      checkOut: "2025-05-07",
      guests: 2,
      avatar: "/avatars/sarah.png",
    },
  ],
  stats: {
    total: 500,
    confirmed: 324,
    pending: 98,
    cancelled: 78,
  },
};
