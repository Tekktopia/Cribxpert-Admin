// Extended user details data that includes all information from userMgmtData plus additional details

export interface UserBooking {
  id: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  status: "Active" | "Completed" | "Cancelled";
  amount: number;
  guests: number;
}

export interface UserEarning {
  id: string;
  propertyName: string;
  date: string;
  amount: number;
  status: "Paid" | "Pending" | "Processing";
}

export interface UserProperty {
  id: string;
  name: string;
  location: string;
  type: string;
  status: "Active" | "Inactive" | "Under Review";
  rating: number;
  totalBookings: number;
  monthlyEarnings: number;
}

export interface DetailedUser {
  // Basic info from User interface
  id: string;
  ticketId: string;
  name: string;
  email: string;
  avatar: string;
  role: "Host" | "Guest";
  status: "Verified" | "Pending" | "Blocked";
  lastActive: string;
  joinDate: string;
  phone?: string;
  totalBookings?: number;
  totalEarnings?: number;
  kycStatus: "completed" | "pending" | "rejected";
  gender?: string;
  dateJoined?: string;
  location?: string;
  activeBookings?: number;

  // Extended details for the detailed page
  fullAddress?: string;
  nationality?: string;
  dateOfBirth?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  verificationDocuments?: {
    type: string;
    status: "verified" | "pending" | "rejected";
    uploadDate: string;
  }[];

  // Booking stats
  completedBookings?: number;
  cancelledBookings?: number;
  averageRating?: number;

  // Recent bookings
  recentBookings?: UserBooking[];

  // For hosts - properties and earnings
  properties?: UserProperty[];
  recentEarnings?: UserEarning[];

  // Account settings
  notifications?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  privacy?: {
    profileVisibility: "public" | "private";
    contactVisibility: "hosts" | "verified" | "none";
  };
}

// Function to get detailed user data by ID
export function getDetailedUserById(userId: string): DetailedUser | null {
  const userDetails: Record<string, Partial<DetailedUser>> = {
    "1": {
      id: "1",
      ticketId: "TK001",
      name: "Tope Akinola",
      email: "topesky@gmail.com",
      avatar: "/avatars/tope.png",
      role: "Host",
      status: "Verified",
      lastActive: "2 hours ago",
      joinDate: "2024-01-15",
      phone: "08167898767",
      totalBookings: 25,
      totalEarnings: 450000,
      kycStatus: "completed",
      gender: "Male",
      dateJoined: "2024-01-15",
      location: "Lagos, Nigeria",
      activeBookings: 3,
      fullAddress: "23 Victoria Island, Lagos State, Nigeria",
      nationality: "Nigerian",
      dateOfBirth: "1990-05-15",
      emergencyContact: {
        name: "Adebayo Akinola",
        phone: "08123456789",
        relationship: "Brother",
      },
      verificationDocuments: [
        {
          type: "National ID",
          status: "verified",
          uploadDate: "2024-01-20",
        },
        {
          type: "Passport",
          status: "verified",
          uploadDate: "2024-01-22",
        },
      ],
      completedBookings: 20,
      cancelledBookings: 2,
      averageRating: 4.8,
      properties: [
        {
          id: "p1",
          name: "Luxury Villa Victoria Island",
          location: "Victoria Island, Lagos",
          type: "Villa",
          status: "Active",
          rating: 4.9,
          totalBookings: 15,
          monthlyEarnings: 180000,
        },
        {
          id: "p2",
          name: "Modern Apartment Ikoyi",
          location: "Ikoyi, Lagos",
          type: "Apartment",
          status: "Active",
          rating: 4.7,
          totalBookings: 10,
          monthlyEarnings: 120000,
        },
      ],
      recentBookings: [
        {
          id: "b1",
          propertyName: "Luxury Villa Victoria Island",
          checkIn: "2024-09-10",
          checkOut: "2024-09-15",
          status: "Active",
          amount: 75000,
          guests: 4,
        },
        {
          id: "b2",
          propertyName: "Modern Apartment Ikoyi",
          checkIn: "2024-08-20",
          checkOut: "2024-08-25",
          status: "Completed",
          amount: 60000,
          guests: 2,
        },
      ],
      recentEarnings: [
        {
          id: "e1",
          propertyName: "Luxury Villa Victoria Island",
          date: "2024-09-05",
          amount: 75000,
          status: "Paid",
        },
        {
          id: "e2",
          propertyName: "Modern Apartment Ikoyi",
          date: "2024-08-28",
          amount: 60000,
          status: "Paid",
        },
      ],
      notifications: {
        email: true,
        sms: true,
        push: true,
      },
      privacy: {
        profileVisibility: "public",
        contactVisibility: "verified",
      },
    },
    // Add more users as needed...
  };

  // Get base user details and merge with extended details
  const extendedDetails = userDetails[userId];
  if (!extendedDetails) return null;

  return extendedDetails as DetailedUser;
}

// Sample data for demo
export const sampleDetailedUsers: DetailedUser[] = [
  {
    id: "1",
    ticketId: "TK001",
    name: "Tope Akinola",
    email: "topesky@gmail.com",
    avatar: "/avatars/tope.png",
    role: "Host",
    status: "Verified",
    lastActive: "2 hours ago",
    joinDate: "2024-01-15",
    phone: "08167898767",
    totalBookings: 25,
    totalEarnings: 450000,
    kycStatus: "completed",
    gender: "Male",
    dateJoined: "2024-01-15",
    location: "Lagos, Nigeria",
    activeBookings: 3,
    fullAddress: "23 Victoria Island, Lagos State, Nigeria",
    nationality: "Nigerian",
    dateOfBirth: "1990-05-15",
    completedBookings: 20,
    cancelledBookings: 2,
    averageRating: 4.8,
    recentBookings: [],
    properties: [],
    recentEarnings: [],
    notifications: {
      email: true,
      sms: true,
      push: true,
    },
    privacy: {
      profileVisibility: "public",
      contactVisibility: "verified",
    },
  },
];
