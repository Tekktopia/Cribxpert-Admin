// data/csrUserData.ts
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "Host" | "Guest" | "Admin" | "CSR";
  status: "Active" | "Suspended" | "Pending" | "Inactive";
  lastActive: string;
  joinDate: string;
  address?: string;
  avatar?: string;
  metrics?: {
    activeBookings: number;
    completedBookings: number;
    complaints: number;
    disputes: number;
  };
  propertyInfo?: {
    address: string;
    listings?: number;
  };
}

export interface UserSummary {
  totalUsers: number;
  guests: number;
  hosts: number;
  suspended: number;
}

export const userSummaryData: UserSummary = {
  totalUsers: 30,
  guests: 15,
  hosts: 15,
  suspended: 1
};

export const usersData: User[] = [
  {
    id: "1",
    name: "Tope Akinola",
    email: "topsky@gmail.com",
    phone: "+2348167134675",
    role: "Host",
    status: "Active",
    lastActive: "2 hours ago",
    joinDate: "2025-01-15",
    address: "No 1234, Adeyemo street, Lagos, Nigeria",
    metrics: {
      activeBookings: 3,
      completedBookings: 12,
      complaints: 1,
      disputes: 0
    },
    propertyInfo: {
      address: "No 1234, Adeyemo street, Lagos, Nigeria",
      listings: 2
    }
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+2348123456789",
    role: "Host",
    status: "Active",
    lastActive: "5 mins ago",
    joinDate: "2025-02-20",
    address: "No 567, Victoria Island, Lagos, Nigeria",
    metrics: {
      activeBookings: 5,
      completedBookings: 8,
      complaints: 0,
      disputes: 1
    },
    propertyInfo: {
      address: "No 567, Victoria Island, Lagos, Nigeria",
      listings: 3
    }
  },
  {
    id: "3",
    name: "Michael Chen",
    email: "michael.c@email.com",
    role: "Guest",
    status: "Active",
    lastActive: "1 day ago",
    joinDate: "2025-03-10",
    metrics: {
      activeBookings: 1,
      completedBookings: 5,
      complaints: 0,
      disputes: 0
    }
  },
  {
    id: "4",
    name: "Amara Okafor",
    email: "amara.o@email.com",
    role: "Guest",
    status: "Suspended",
    lastActive: "3 days ago",
    joinDate: "2025-01-05",
    metrics: {
      activeBookings: 0,
      completedBookings: 2,
      complaints: 2,
      disputes: 1
    }
  },
  {
    id: "5",
    name: "James Wilson",
    email: "james.w@email.com",
    role: "Host",
    status: "Active",
    lastActive: "30 mins ago",
    joinDate: "2024-12-01",
    address: "No 89, Lekki Phase 1, Lagos, Nigeria",
    metrics: {
      activeBookings: 4,
      completedBookings: 15,
      complaints: 0,
      disputes: 0
    },
    propertyInfo: {
      address: "No 89, Lekki Phase 1, Lagos, Nigeria",
      listings: 4
    }
  }
];