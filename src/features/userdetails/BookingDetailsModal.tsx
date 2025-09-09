import { Badge } from "@/components/ui/badge";
import { InfoSection } from "@/components/layout/InfoSection";
import type { BookingDetails } from "@/utils/bookingUtils";

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingDetails | null;
}

export function BookingDetailsModal({
  isOpen,
  onClose,
  booking,
}: BookingDetailsModalProps) {
  if (!booking) return null;

  const getStatusBadgeVariant = (status: BookingDetails["status"]) => {
    switch (status) {
      case "Completed":
        return "success";
      case "Cancelled":
        return "destructive";
      case "Active":
        return "pending";
      case "Pending":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getPaymentBadgeVariant = (payment: BookingDetails["payment"]) => {
    switch (payment) {
      case "Paid":
        return "success";
      case "Refunded":
        return "destructive";
      case "Pending":
        return "warning";
      case "Failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (!booking || !isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/50' onClick={onClose} />

      {/* Modal */}
      <div className='relative bg-white rounded-2xl shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b'>
          <div>
            <h2 className='text-xl font-semibold text-gray-900'>
              {booking.property}
            </h2>
            <p className='text-sm text-gray-600 mt-1'>
              {booking.ticketId} • {booking.date}
            </p>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-full transition-colors'
          >
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Content - 3 Column Layout */}
        <div className='p-6'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Left Column - Property Image and Information */}
            <div className=''>
              {/* Property Image */}
              <div className='w-full mb-6 h-48 bg-gray-200 rounded-lg overflow-hidden'>
                {booking.propertyImage ? (
                  <img
                    src={booking.propertyImage}
                    alt={booking.property}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center'>
                    <span className='text-gray-500 text-sm'>
                      Property Image
                    </span>
                  </div>
                )}
              </div>

              {/* Property Information */}
              <InfoSection
                title='Property Information'
                fields={[
                  {
                    label: "Address",
                    value:
                      booking.propertyAddress ||
                      "No 1234, Adeyemo street, Lagos, Nigeria",
                  },
                ]}
                variant='bordered'
              />

              {/* Stay Information */}
              <InfoSection
                title='Stay Information'
                fields={[
                  {
                    label: "Check-in",
                    value: booking.stayInfo?.checkIn || "Aug 15 2025, 3:00pm",
                  },
                  {
                    label: "Check-out",
                    value: booking.stayInfo?.checkOut || "Aug 18 2025, 11:00am",
                  },
                  {
                    label: "Guests",
                    value: booking.stayInfo?.guests?.toString() || "2",
                  },
                  {
                    label: "Nights",
                    value: booking.stayInfo?.nights?.toString() || "2",
                  },
                ]}
                contentClassName="grid grid-cols-2 "
                fieldClassName="flex items-start"
                variant='bordered'
              />

              {/* Booking Status */}
              <InfoSection
                title='Booking Status'
                fields={[
                  {
                    label: "Booking",
                    value: (
                      <Badge variant={getStatusBadgeVariant(booking.status)}>
                        {booking.status}
                      </Badge>
                    ),
                  },
                  {
                    label: "Payment",
                    value: (
                      <Badge variant={getPaymentBadgeVariant(booking.payment)}>
                        {booking.payment}
                      </Badge>
                    ),
                  },
                ]}
                variant='bordered'
              />
            </div>

            {/* Middle Column - Guest and Host Information */}
            <div className='space-y-6'>
              {/* Guest Information */}
              <InfoSection
                title='Guest Information'
                fields={[
                  {
                    label: "Name",
                    value: booking.guestInfo?.name || "Tope Akinola",
                  },
                  {
                    label: "Email",
                    value: booking.guestInfo?.email || "topsky@gmail.com",
                  },
                  {
                    label: "Phone",
                    value: booking.guestInfo?.phone || "+2348187134675",
                  },
                ]}
                variant='gray'
              />

              {/* Host Information */}
              <InfoSection
                title='Host Information'
                fields={[
                  {
                    label: "Name",
                    value: booking.hostInfo?.name || "Sarah Johnson",
                  },
                  {
                    label: "Email",
                    value: booking.hostInfo?.email || "topsky@gmail.com",
                  },
                  {
                    label: "Phone",
                    value: booking.hostInfo?.phone || "+2348187134675",
                  },
                  {
                    label: "Role",
                    value: (
                      <Badge variant='secondary'>
                        {booking.hostInfo?.role || "Host"}
                      </Badge>
                    ),
                  },
                ]}
                variant='gray'
              />
            </div>

            {/* Right Column - Payment Information */}
            <div className=''>
              {/* Payment Breakdown */}
              <InfoSection
                title='Payment Breakdown'
                fields={[
                  {
                    label: "Base price (3 nights)",
                    value: booking.paymentBreakdown?.basePrice || "₦150,000",
                  },
                  {
                    label: "Service fee",
                    value: booking.paymentBreakdown?.serviceFee || "₦10,000",
                  },
                  {
                    label: "Taxes & fees",
                    value: booking.paymentBreakdown?.taxesFees || "₦1,000",
                  },
                  {
                    label: "Total",
                    value: (
                      <span className='font-semibold'>
                        {booking.paymentBreakdown?.total || booking.amount}
                      </span>
                    ),
                  },
                ]}
                variant='bordered'
              />

              {/* Payment Information */}
              <InfoSection
                title='Payment Information'
                fields={[
                  {
                    label: "Method",
                    value:
                      booking.paymentBreakdown?.method ||
                      "Credit Card ****1234",
                  },
                  {
                    label: "Confirmation",
                    value:
                      booking.paymentBreakdown?.confirmation || "HNT-BK1001",
                  },
                ]}
                variant='bordered'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
