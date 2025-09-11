import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/badge";
import { InfoSection } from "@/components/layout/InfoSection";
import type { ListingRecord } from "@/data/listingMgmtData";

interface ListingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ListingRecord | null;
}

export function ListingDetailsModal({
  isOpen,
  onClose,
  listing,
}: ListingDetailsModalProps) {
  if (!listing) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className='bg-yellow-50 text-yellow-600 border-0 hover:bg-yellow-50'>
            Pending Review
          </Badge>
        );
      case "active":
        return (
          <Badge className='bg-green-50 text-green-600 border-0 hover:bg-green-50'>
            Active
          </Badge>
        );
      case "flagged":
        return (
          <Badge className='bg-red-50 text-red-600 border-0 hover:bg-red-50'>
            Flagged
          </Badge>
        );
      case "rejected":
        return (
          <Badge className='bg-gray-50 text-gray-600 border-0 hover:bg-gray-50'>
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const actions = [
    {
      label: "Close",
      onClick: onClose,
      variant: "secondary" as const,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Listing Details'
      actions={actions}
      size='lg'
      showCloseButton={true}
    >
      <div className='space-y-6'>
        {/* Property Image */}
        <div className='w-full h-64 bg-gray-200 rounded-lg overflow-hidden'>
          <img
            src={listing.image}
            alt={listing.title}
            className='w-full h-full object-cover'
          />
        </div>

        {/* Property Title and Status */}
        <div className='flex items-start justify-between'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              {listing.title}
            </h2>
            <div className='flex items-center space-x-2 mb-4'>
              <svg
                className='w-5 h-5 text-gray-400'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z'
                  clipRule='evenodd'
                />
              </svg>
              <span className='text-gray-600'>{listing.location}</span>
            </div>
          </div>
          {getStatusBadge(listing.status)}
        </div>

        {/* Property Information */}
        <InfoSection
          title='Property Information'
          fields={[
            {
              label: "Price per night",
              value: listing.price,
            },
            {
              label: "Property Type",
              value: "Cottage",
            },
            {
              label: "Bedrooms",
              value: "3",
            },
            {
              label: "Bathrooms",
              value: "2",
            },
            {
              label: "Max Guests",
              value: "6",
            },
            {
              label: "Created Date",
              value: listing.created,
            },
          ]}
          variant='bordered'
        />

        {/* Host Information */}
        <InfoSection
          title='Host Information'
          fields={[
            {
              label: "Host Name",
              value: listing.host.name,
            },
            {
              label: "Host Email",
              value: "topsky@gmail.com",
            },
            {
              label: "Host Phone",
              value: "+2348187134675",
            },
            {
              label: "Host Status",
              value: (
                <Badge className='bg-green-50 text-green-600 border-0 hover:bg-green-50'>
                  Verified
                </Badge>
              ),
            },
            {
              label: "Total Listings",
              value: "3",
            },
            {
              label: "Host Since",
              value: "January 2024",
            },
          ]}
          variant='bordered'
        />

        {/* Property Description */}
        <InfoSection
          title='Property Description'
          fields={[
            {
              label: "Description",
              value:
                "Beautiful cottage located in the heart of Victoria Island, Lagos. This property features modern amenities, spacious rooms, and easy access to local attractions. Perfect for both business and leisure travelers looking for a comfortable stay in Lagos.",
            },
            {
              label: "Amenities",
              value:
                "WiFi, Air Conditioning, Kitchen, Parking, Swimming Pool, Security",
            },
            {
              label: "House Rules",
              value:
                "No smoking, No pets, Check-in after 3 PM, Check-out before 11 AM",
            },
          ]}
          variant='bordered'
        />
      </div>
    </Modal>
  );
}
