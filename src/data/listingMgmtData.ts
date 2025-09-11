export interface ListingRecord {
  id: string;
  title: string;
  host: {
    name: string;
    avatar: string;
  };
  location: string;
  price: string;
  status: "pending" | "active" | "flagged" | "rejected";
  created: string;
  image: string;
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
