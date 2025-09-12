import { Badge } from "@/components/ui/badge";
import { InfoSection } from "@/components/layout/InfoSection";
import {
  Users,
  Bed,
  Bath,
  MapPin,
  X,
  Star,
  Plane,
  ChevronRight,
  Mail,
  Phone,
} from "lucide-react";
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
  if (!listing || !isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/50' onClick={onClose} />

      {/* Modal */}
      <div className='relative bg-white rounded-2xl shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b'>
          <h2 className='text-xl font-semibold text-gray-900'>
            {listing.title}
          </h2>
          <Badge className='bg-yellow-50 text-yellow-600 border-0 hover:bg-yellow-50 text-xs'>
            Pending
          </Badge>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-full transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>
          {/* Property Image Gallery - Full Width at Top */}
          <div className='grid grid-cols-6 gap-2 mb-6'>
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className='aspect-video bg-blue-100 rounded-lg overflow-hidden'
              >
                <img
                  src={listing.image}
                  alt={`${listing.title} - View ${index + 1}`}
                  className='w-full h-full object-cover'
                />
              </div>
            ))}
          </div>

          {/* Main Content - Two Column Layout */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Left Column */}
            <div className='space-y-0'>
              <div className={`border border-[#EBEBEB]`}>
                <h3
                  className={`text-lg font-semibold py-3 px-4 bg-[#E6EFF1] mb-2`}
                >
                  Property Details
                </h3>
                <div className={`space-y-1 px-4 pb-2`}>
                  <div className={`flex items-center gap-4 py-2`}>
                    <span className='text-sm text-gray-600 min-w-0 flex-shrink-0'>
                      Role:
                    </span>
                    <div className='flex items-center space-x-2 min-w-0 flex-1'>
                      <Badge className='bg-pink-50 text-pink-600 border-0 hover:bg-pink-50'>
                        Host
                      </Badge>
                    </div>
                  </div>

                  {/* Property Stats */}
                  <div className='flex items-center text-xs gap-1 text-gray-600 mb-4'>
                    <span className='flex items-center gap-1'>
                      <Users className='w-4 h-4' /> 4 guests
                    </span>
                    <span className='flex items-center gap-1'>
                      <Bed className='w-4 h-4' /> 2 bedrooms
                    </span>
                    <span className='flex items-center gap-1'>
                      <Bath className='w-4 h-4' /> 2 bathrooms
                    </span>
                    <span className='flex items-center gap-1'>
                      <MapPin className='w-4 h-4' /> {listing.location}
                    </span>
                  </div>

                  {/* Description */}
                  <div className='mt-4'>
                    <p className='text-sm text-gray-700 leading-relaxed'>
                      Experience luxury living in this stunning downtown loft
                      featuring floor-to-ceiling windows with breathtaking city
                      views. This modern space combines industrial charm with
                      contemporary comfort, perfect for business travelers and
                      urban explorers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <InfoSection
                title='Amenities'
                fields={[
                  { label: "• WiFi", value: "" },
                  { label: "• Kitchen", value: "" },
                  { label: "• Washer & Dryer", value: "" },
                  { label: "• Air Conditioning", value: "" },
                  { label: "• Heating", value: "" },
                  { label: "• TV", value: "" },
                  { label: "• Gym Access", value: "" },
                  { label: "• Rooftop Terrace", value: "" },
                  { label: "• Concierge", value: "" },
                  { label: "• Parking", value: "" },
                ]}
                variant='bordered'
                className=''
                contentClassName='grid grid-cols-3 gap-1'
                fieldClassName='py-1'
              />

              {/* House Rules */}
              <InfoSection
                title='House Rules'
                fields={[
                  { label: "• No smoking", value: "" },
                  { label: "• No pets", value: "" },
                  { label: "• No parties or events", value: "" },
                  { label: "• Quiet hours 10 PM - 8 AM", value: "" },
                  { label: "• Maximum 4 guests", value: "" },
                ]}
                variant='bordered'
                className=''
                fieldClassName='py-1'
              />

              {/* Check In & Check Out */}
              <InfoSection
                title='Check In & Check Out'
                fields={[
                  { label: "Check-in", value: "3:00 PM" },
                  { label: "Check-out", value: "11:00 AM" },
                ]}
                variant='bordered'
                className='mt-4'
                fieldClassName='py-1'
              />

              <div className='mt-4'>
                <p className='text-xs text-gray-500'>
                  Cancellation Policy: Moderate - Free cancellation up to 5 days
                  before check-in
                </p>
              </div>

              {/* Action History */}
              <InfoSection
                title='Action History'
                fields={[
                  {
                    label: "Approved By",
                    value: "Jennifer D on August 15, 2025",
                  },
                  {
                    label: "Notes",
                    value:
                      "Property meets all requirements. Approved for listing",
                  },
                ]}
                variant='bordered'
                className='mt-4'
              />
            </div>

            {/* Right Column */}
            <div className='space-y-4'>
              {/* Pricing */}
              <div className='bg-[#E6EFF1] p-4'>
                <h3 className='text-sm font-medium text-gray-600 mb-2'>
                  Pricing
                </h3>
                <p className='text-2xl font-bold text-gray-900'>
                  NGN 85,000/night
                </p>
              </div>

              {/* Host Information */}
              <InfoSection
                title='Host Information'
                fields={[
                  { label: "Name", value: "Sarah Johnson" },
                  {
                    label: <Mail className='w-4 h-4 text-gray-500' />,
                    value: "topsky@gmail.com",
                  },
                  {
                    label: <Phone className='w-4 h-4 text-gray-500' />,
                    value: "+2348187134675",
                  },
                ]}
                headerClassName="!text-lg"
                variant='gray'
              />

              {/* Performance */}
              <InfoSection
                title='Performance'
                fields={[
                  { label: "Total Bookings", value: "12" },
                  {
                    label: "Average Rating",
                    value: (
                      <span className='flex items-center gap-1'>
                        <Star className='w-4 h-4 fill-yellow-400 text-yellow-400' />
                        4.8
                      </span>
                    ),
                  },
                  { label: "Reviews", value: "10" },
                ]}
                headerClassName="!text-lg"
                variant='gray'
              />

              {/* Listing Info */}
              <InfoSection
                title='Listing Info'
                fields={[
                  { label: "Created", value: "August 9, 2025" },
                  {
                    label: "Status",
                    value: (
                      <Badge className='bg-green-50 text-green-600 border-0 hover:bg-green-50'>
                        Active
                      </Badge>
                    ),
                  },
                ]}
                headerClassName="!text-lg"
                variant='gray'
              />
            </div>
          </div>

          {/* Explore The Area - Full Width at Bottom */}
          <div className='mt-6'>
            <h3 className='text-lg font-semibold mb-4'>Explore The Area</h3>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Map Section */}
              <div className='relative'>
                <div className='w-full h-64 bg-green-100 rounded-lg overflow-hidden relative'>
                  {/* Placeholder map with location marker */}
                  <div className='absolute inset-0 bg-gradient-to-br from-green-200 to-green-300'>
                    {/* Map placeholder content */}
                    <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                      <div className='w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg'>
                        <MapPin className='w-6 h-6 text-white' />
                      </div>
                    </div>
                    {/* Map grid lines for realistic look */}
                    <div className='absolute inset-0 opacity-20'>
                      <div className='grid grid-cols-8 h-full'>
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className='border-r border-gray-400'
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Locations List */}
              <div className='space-y-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center flex-shrink-0'>
                    <MapPin className='w-3 h-3 text-gray-600' />
                  </div>
                  <div className='flex-1'>
                    <div className='font-medium text-gray-900'>
                      Trans Amusement Children's Museum
                    </div>
                    <div className='text-sm text-gray-500'>2 min walk</div>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <div className='w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center flex-shrink-0'>
                    <MapPin className='w-3 h-3 text-gray-600' />
                  </div>
                  <div className='flex-1'>
                    <div className='font-medium text-gray-900'>
                      Ventura Mall
                    </div>
                    <div className='text-sm text-gray-500'>10 min walk</div>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <div className='w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center flex-shrink-0'>
                    <Plane className='w-3 h-3 text-gray-600' />
                  </div>
                  <div className='flex-1'>
                    <div className='font-medium text-gray-900'>
                      National Airport Station
                    </div>
                    <div className='text-sm text-gray-500'>24 min walk</div>
                  </div>
                </div>

                <button className='flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mt-4'>
                  <span className='text-sm'>See more about area</span>
                  <ChevronRight className='w-4 h-4' />
                </button>
              </div>
            </div>

            {/* Federal Capital Territory Guidance */}
            <div className='mt-6 pt-4 border-t border-gray-200'>
              <p className='text-sm text-gray-600 mb-2'>
                Federal Capital Territory Gombe
              </p>
              <button className='flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors'>
                <span className='text-sm'>View in map</span>
                <ChevronRight className='w-4 h-4' />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
