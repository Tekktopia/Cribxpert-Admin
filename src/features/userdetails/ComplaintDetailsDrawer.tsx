import { X, Upload, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getStatusVariant } from "@/utils/statusBadges";
import { InfoSection } from "@/components/layout/InfoSection";

interface ComplaintDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  complaintId?: string;
}

interface ComplaintDetails {
  id: string;
  ticketId: string;
  date: string;
  type: string;
  bookingId: string;
  priority: "High" | "Medium" | "Low";
  status: "Resolved" | "Under Investigation" | "Pending" | "Closed";
  timeline: {
    reported: string;
    resolved?: string;
  };
  parties: {
    reportedBy: string;
    host: string;
  };
  description: string;
  resolution: string;
  adminNotes: string;
  evidence: {
    id: string;
    type: "image" | "document";
    url: string;
    thumbnail?: string;
  }[];
}

// Mock data - in real app, this would be fetched based on complaintId
const mockComplaintDetails: ComplaintDetails = {
  id: "BK10001",
  ticketId: "BK10001",
  date: "2025-01-20",
  type: "Property Issue",
  bookingId: "10001",
  priority: "Medium",
  status: "Resolved",
  timeline: {
    reported: "2025-01-20 14:30",
    resolved: "2025-01-21 14:30",
  },
  parties: {
    reportedBy: "Sarah Johnson",
    host: "Tobi Akinola",
  },
  description:
    "Guest reported that the WiFi was not working properly and the air conditioning was making loud noises during the night.",
  resolution:
    "Host fixed the WiFi router and replaced the AC unit. Guest was satisfied with the quick resolution.",
  adminNotes: "Issue resolved within 24 hours. Host was very responsive.",
  evidence: [
    {
      id: "1",
      type: "image",
      url: "/images/complaint1.jpg",
      thumbnail: "/images/complaint1.jpg",
    },
    {
      id: "2",
      type: "image",
      url: "/images/complaint2.jpg",
      thumbnail: "/images/complaint2.jpg",
    },
  ],
};

export function ComplaintDetailsDrawer({
  isOpen,
  onClose,
  complaintId,
}: ComplaintDetailsDrawerProps) {
  console.log(complaintId); // In real app, use this to fetch specific complaint
  const complaint = mockComplaintDetails;

  const getPriorityBadgeVariant = (priority: string) =>
    getStatusVariant(priority, "complaintPriority");

  const getStatusBadgeVariant = (status: string) =>
    getStatusVariant(status, "complaint");

  const handleExport = () => {
    console.log("Exporting complaint details:", complaint.ticketId);
  };

  const handleContactParties = () => {
    console.log("Contacting parties for complaint:", complaint.ticketId);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className='fixed inset-0 bg-black/40 bg-opacity-50 z-40 transition-opacity'
        onClick={onClose}
      />

      {/* Drawer */}
      <div className='fixed right-0 rounded-2xl top-0 h-full w-full max-w-5xl bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div>
            <h2 className='text-xl font-semibold text-gray-900'>
              Complaint Details
            </h2>
            <p className='text-sm text-gray-600'>
              {complaint.ticketId} • {complaint.date}
            </p>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-full transition-colors'
          >
            <X className='w-6 h-6 text-gray-500' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 space-y-6'>
          {/* Two Column Layout */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Left Column */}
            <div className='space-y-6'>
              {/* Complaint Overview */}
              <InfoSection
                title='Complaint Overview'
                fields={[
                  { label: "Type", value: complaint.type },
                  { label: "Booking ID", value: complaint.bookingId },
                  {
                    label: "Priority",
                    value: (
                      <Badge
                        variant={getPriorityBadgeVariant(complaint.priority)}
                      >
                        {complaint.priority}
                      </Badge>
                    ),
                  },
                  {
                    label: "Status",
                    value: (
                      <Badge variant={getStatusBadgeVariant(complaint.status)}>
                        {complaint.status}
                      </Badge>
                    ),
                  },
                ]}
                variant='bordered'
              />

              {/* Timeline */}
              <InfoSection
                title='Timeline'
                fields={[
                  { label: "Reported", value: complaint.timeline.reported },
                  ...(complaint.timeline.resolved
                    ? [
                        {
                          label: "Resolved",
                          value: complaint.timeline.resolved,
                        },
                      ]
                    : []),
                ]}
                variant='bordered'
              />

              {/* Parties Involved */}
              <InfoSection
                title='Parties Involved'
                fields={[
                  { label: "Reported by", value: complaint.parties.reportedBy },
                  { label: "Host", value: complaint.parties.host },
                ]}
                variant='bordered'
              />
            </div>

            {/* Right Column */}
            <div className='space-y-6'>
              {/* Description */}
              <div className='bg-[#E6EFF1] p-4 '>
                <h3 className='text-sm font-medium text-gray-900 mb-3'>
                  Description
                </h3>
                <p className='text-sm text-gray-700 leading-relaxed'>
                  {complaint.description}
                </p>
              </div>

              {/* Resolution */}
              <div className='bg-[#E6EFF1] p-4 '>
                <h3 className='text-sm font-medium text-gray-900 mb-3'>
                  Resolution
                </h3>
                <p className='text-sm text-gray-700 leading-relaxed'>
                  {complaint.resolution}
                </p>
              </div>

              {/* Admin Notes */}
              <div className='bg-[#FEF3E2] p-4 '>
                <h3 className='text-sm font-medium text-gray-900 mb-3'>
                  Admin Notes
                </h3>
                <p className='text-sm text-gray-700 leading-relaxed'>
                  {complaint.adminNotes}
                </p>
              </div>

              {/* Evidence */}
              <div className=''>
                <h3 className='text-sm p-4  bg-[#E6EFF1] font-semibold text-gray-900 mb-3'>
                  Evidence
                </h3>
                <div className='grid grid-cols-2 gap-3'>
                  {complaint.evidence.map((item) => (
                    <div
                      key={item.id}
                      className='aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-200 transition-colors'
                    >
                      {item.type === "image" ? (
                        <img src={item.thumbnail} className='w-full h-full' />
                      ) : (
                        <div className='w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center'>
                          <span className='text-xs text-blue-600'>
                            Document
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end space-x-3 pt-4 border-t border-gray-200'>
            <button
              onClick={handleExport}
              className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2'
            >
              <span>Export</span>
              <Upload className='w-4 h-4' />
            </button>
            <button
              onClick={handleContactParties}
              className='px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2'
            >
              <span>Contact Parties</span>
              <MessageCircle className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
