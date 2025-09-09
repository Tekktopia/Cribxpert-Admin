// Extended booking interface for detailed modal
export interface BookingDetails {
  id: string;
  ticketId: string;
  property: string;
  date: string;
  status: "Completed" | "Cancelled" | "Pending" | "Active";
  amount: string;
  payment: "Paid" | "Refunded" | "Pending" | "Failed";
  // Additional details for the modal
  propertyImage?: string;
  propertyAddress?: string;
  guestInfo?: {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  hostInfo?: {
    name: string;
    email: string;
    phone: string;
    role: string;
    avatar?: string;
  };
  stayInfo?: {
    checkIn: string;
    checkOut: string;
    guests: number;
    nights: number;
  };
  paymentBreakdown?: {
    basePrice: string;
    serviceFee: string;
    taxesFees: string;
    total: string;
    method: string;
    confirmation: string;
  };
}

// Helper function to transform basic booking data to detailed booking data
export function transformToBookingDetails(basicBooking: {
  id: string;
  ticketId: string;
  property: string;
  date: string;
  status: "Completed" | "Cancelled" | "Pending" | "Active";
  amount: string;
  payment: "Paid" | "Refunded" | "Pending" | "Failed";
}): BookingDetails {
  return {
    ...basicBooking,
    propertyImage: "/images/complaint1.jpg",
    propertyAddress: "No 1234, Adeyemo street, Lagos, Nigeria",
    guestInfo: {
      name: "Tope Akinola",
      email: "topsky@gmail.com",
      phone: "+2348187134675",
    },
    hostInfo: {
      name: "Sarah Johnson",
      email: "topsky@gmail.com",
      phone: "+2348187134675",
      role: "Host",
    },
    stayInfo: {
      checkIn: "Aug 15 2025, 3:00pm",
      checkOut: "Aug 18 2025, 11:00am",
      guests: 2,
      nights: 2,
    },
    paymentBreakdown: {
      basePrice: "₦150,000",
      serviceFee: "₦10,000",
      taxesFees: "₦1,000",
      total: basicBooking.amount,
      method: "Credit Card ****1234",
      confirmation: "HNT-BK1001",
    },
  };
}
