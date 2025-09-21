export interface KYCSubmission {
  id: string;
  ticketId: string;
  name: string;
  email: string;
  documentType: "Driver License" | "Passport" | "National ID";
  status: "Pending" | "Under Review" | "Approved" | "Rejected";
  submissionDate: string; // YYYY-MM-DD
  avatar?: string;
  role?: "Host" | "Guest";
  internalId?: string; // e.g., ID: 0000001
  notes?: string;
  images?: string[]; // front/back placeholders
}

export interface KYCData {
  submissions: KYCSubmission[];
  stats: {
    total: number;
    approved: number;
    pending: number;
    underReview: number;
    rejected: number;
  };
}

export const mockKycData: KYCData = {
  submissions: [
    {
      id: "100012",
      ticketId: "100012",
      name: "Tope Akinola",
      email: "topsyk@gmail.com",
      documentType: "Driver License",
      status: "Pending",
      submissionDate: "2024-08-29",
      avatar: "/avatars/michael.png",
      role: "Host",
      internalId: "ID: 0000001",
      notes: "Initial submission for host verification",
      images: ["/images/complaint1.jpg", "/images/complaint2.jpg"],
    },
    {
      id: "100013",
      ticketId: "100013",
      name: "Tope Akinola",
      email: "topsyk@gmail.com",
      documentType: "Passport",
      status: "Under Review",
      submissionDate: "2025-08-28",
      avatar: "/avatars/michael.png",
      role: "Host",
      internalId: "ID: 0000001",
      notes: "Documents under manual investigation",
      images: ["/images/complaint1.jpg", "/images/complaint2.jpg"],
    },
    {
      id: "100014",
      ticketId: "100014",
      name: "Tope Akinola",
      email: "topsyk@gmail.com",
      documentType: "Driver License",
      status: "Approved",
      submissionDate: "2025-08-28",
      avatar: "/avatars/michael.png",
      role: "Host",
      internalId: "ID: 0000001",
      notes: "Verification completed successfully",
      images: ["/images/complaint1.jpg", "/images/complaint2.jpg"],
    },
    {
      id: "100015",
      ticketId: "100015",
      name: "Tope Akinola",
      email: "topsyk@gmail.com",
      documentType: "Driver License",
      status: "Pending",
      submissionDate: "2025-08-28",
      avatar: "/avatars/michael.png",
      role: "Host",
      internalId: "ID: 0000001",
      notes: "Awaiting review by compliance team",
      images: ["/images/complaint1.jpg", "/images/complaint2.jpg"],
    },
    {
      id: "100016",
      ticketId: "100016",
      name: "Tope Akinola",
      email: "topsyk@gmail.com",
      documentType: "National ID",
      status: "Under Review",
      submissionDate: "2025-08-28",
      avatar: "/avatars/michael.png",
      role: "Host",
      internalId: "ID: 0000001",
      notes: "Under review",
      images: ["/images/complaint1.jpg", "/images/complaint2.jpg"],
    },
    {
      id: "100017",
      ticketId: "100017",
      name: "Tope Akinola",
      email: "topsyk@gmail.com",
      documentType: "National ID",
      status: "Approved",
      submissionDate: "2025-08-28",
      avatar: "/avatars/michael.png",
      role: "Host",
      internalId: "ID: 0000001",
      notes: "Verified",
      images: ["/images/complaint1.jpg", "/images/complaint2.jpg"],
    },
    {
      id: "100018",
      ticketId: "100018",
      name: "Tope Akinola",
      email: "topsyk@gmail.com",
      documentType: "National ID",
      status: "Pending",
      submissionDate: "2025-08-28",
      avatar: "/avatars/michael.png",
      role: "Host",
      internalId: "ID: 0000001",
      notes: "Pending",
      images: ["/images/complaint1.jpg", "/images/complaint2.jpg"],
    },
    {
      id: "100019",
      ticketId: "100019",
      name: "Tope Akinola",
      email: "topsyk@gmail.com",
      documentType: "Driver License",
      status: "Approved",
      submissionDate: "2025-08-27",
      avatar: "/avatars/michael.png",
      role: "Host",
      internalId: "ID: 0000001",
      notes: "Verified",
      images: ["/images/complaint1.jpg", "/images/complaint2.jpg"],
    },
    {
      id: "100022",
      ticketId: "100022",
      name: "Tope Akinola",
      email: "topsyk@gmail.com",
      documentType: "National ID",
      status: "Under Review",
      submissionDate: "2025-08-27",
      avatar: "/avatars/michael.png",
      role: "Host",
      internalId: "ID: 0000001",
      notes: "Under review",
      images: ["/images/complaint1.jpg", "/images/complaint2.jpg"],
    },
    {
      id: "100023",
      ticketId: "100023",
      name: "Tope Akinola",
      email: "topsyk@gmail.com",
      documentType: "National ID",
      status: "Approved",
      submissionDate: "2025-08-27",
      avatar: "/avatars/michael.png",
      role: "Host",
      internalId: "ID: 0000001",
      notes: "Verified",
      images: ["/images/complaint1.jpg", "/images/complaint2.jpg"],
    },
  ],
  stats: {
    total: 500,
    approved: 240,
    pending: 180,
    underReview: 60,
    rejected: 20,
  },
};
