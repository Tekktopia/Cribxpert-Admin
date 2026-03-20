export interface ListingRecord {
  id: string;
  title: string;
  description?: string;
  host: {
    name: string;
    avatar: string;
    email?: string;
  };
  location: string;
  price: string;
  basePrice?: number;
  cleaningFee?: number;
  securityDeposit?: number;
  status: "pending" | "active" | "approved" | "flagged" | "rejected";
  created: string;
  image: string;
  listingImg?: Array<{
    fileUrl: string;
    fileType: string;
    fileName: string;
    public_id: string;
  }>;
  guestNo?: number;
  bedroomNo?: number;
  bathroomNo?: number;
  latitude?: number;
  longitude?: number;
  totalBookings?: number;
  averageRating?: number;
  reviewCount?: number;
  approvedBy?: string | null;
  approvedAt?: string | null;
  amenities?: Array<{
    _id: string;
    name: string;
    icon?: {
      fileUrl: string;
    };
  }>;
  houseRules?: Array<{
    _id: string;
    name: string;
    icon?: {
      fileUrl: string;
    };
  }>;
  avaliableFrom?: string;
  avaliableUntil?: string;
  hideStatus?: boolean;
}

export const listingMgmtData: ListingRecord[] = [
  {
    id: "listing-001",
    title: "Makinwaa's Cottage",
    host: {
      name: "Tope Akinola",
      avatar: "/avatars/sarah.png",
    },
    location: "Muri Okunola Park, VI, Lagos",
    price: "NGN 85,000/night",
    status: "pending",
    created: "24-08-2025",
    image: "/images/complaint1.jpg",
  },
  {
    id: "listing-002",
    title: "Makinwaa's Cottage",
    host: {
      name: "Tope Akinola",
      avatar: "/avatars/michael.png",
    },
    location: "Muri Okunola Park, VI, Lagos",
    price: "NGN 85,000/night",
    status: "active",
    created: "24-08-2025",
    image: "/images/complaint1.jpg",
  },
  {
    id: "listing-003",
    title: "Makinwaa's Cottage",
    host: {
      name: "Tope Akinola",
      avatar: "/avatars/cynthia.png",
    },
    location: "Muri Okunola Park, VI, Lagos",
    price: "NGN 85,000/night",
    status: "flagged",
    created: "24-08-2025",
    image: "/images/complaint1.jpg",
  },
  {
    id: "listing-004",
    title: "Makinwaa's Cottage",
    host: {
      name: "Tope Akinola",
      avatar: "/avatars/sarah.png",
    },
    location: "Muri Okunola Park, VI, Lagos",
    price: "NGN 85,000/night",
    status: "pending",
    created: "24-08-2025",
    image: "/images/complaint1.jpg",
  },
  {
    id: "listing-005",
    title: "Makinwaa's Cottage",
    host: {
      name: "Tope Akinola",
      avatar: "/avatars/michael.png",
    },
    location: "Muri Okunola Park, VI, Lagos",
    price: "NGN 85,000/night",
    status: "active",
    created: "24-08-2025",
    image: "/images/complaint1.jpg",
  },
  {
    id: "listing-006",
    title: "Makinwaa's Cottage",
    host: {
      name: "Tope Akinola",
      avatar: "/avatars/cynthia.png",
    },
    location: "Muri Okunola Park, VI, Lagos",
    price: "NGN 85,000/night",
    status: "rejected",
    created: "24-08-2025",
    image: "/images/complaint1.jpg",
  },
];
