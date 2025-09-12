import { type Booking } from "@/data/bookingMgmtData";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/Modal";

interface BookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
}: BookingDetailsModalProps) {
  if (!booking) return null;

  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "Confirmed":
        return (
          <Badge variant='success' className='text-xs'>
            Confirmed
          </Badge>
        );
      case "Pending":
        return (
          <Badge variant='warning' className='text-xs'>
            Pending
          </Badge>
        );
      case "Cancelled":
        return (
          <Badge variant='destructive' className='text-xs'>
            Cancelled
          </Badge>
        );
      case "On Hold":
        return (
          <Badge variant='secondary' className='text-xs'>
            On Hold
          </Badge>
        );
      default:
        return (
          <Badge variant='secondary' className='text-xs'>
            {status}
          </Badge>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Booking Details'
      size='lg'
      showCloseButton={true}
      closeOnOverlayClick={true}
    >
      <div className='space-y-6 text-left'>
        {/* Guest Information */}
        <div className='space-y-4'>
          <h4 className='text-base font-medium text-gray-900 flex items-center gap-2'>
            Guest Information
          </h4>

          <div className='space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-600'>Guest Name:</span>
              <span className='text-sm font-semibold text-gray-900'>
                {booking.guestName}
              </span>
            </div>

            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-600'>Contact Details:</span>
              <span className='text-sm font-medium text-gray-900'>
                {booking.guestName.toLowerCase().replace(" ", "")}@Gmail.Com
              </span>
            </div>
          </div>

          <hr className='border-gray-200' />
        </div>

        {/* Host Information */}
        <div className='space-y-4'>
          <h4 className='text-base font-medium text-gray-900 flex items-center gap-2'>
            Host Information
          </h4>

          <div className='space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-600'>Host Name:</span>
              <span className='text-sm font-semibold text-gray-900'>
                {booking.hostName}
              </span>
            </div>

            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-600'>Contact Details:</span>
              <span className='text-sm font-medium text-gray-900'>
                {booking.hostName.toLowerCase().replace(" ", "")}@Gmail.Com
              </span>
            </div>
          </div>

          <hr className='border-gray-200' />
        </div>

        {/* Booking Information */}
        <div className='space-y-4'>
          <h4 className='text-base font-medium text-gray-900 flex items-center gap-2'>
            Booking Information
          </h4>

          <div className='space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-600'>Date:</span>
              <span className='text-sm font-medium text-gray-900'>
                {booking.dates}
              </span>
            </div>

            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-600'>Property Name:</span>
              <span className='text-sm font-semibold text-gray-900'>
                {booking.propertyName}
              </span>
            </div>

            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-600'>Status:</span>
              <div className='flex justify-end'>
                {getStatusBadge(booking.status)}
              </div>
            </div>

            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-600'>Payment Status:</span>
              <span className='text-sm font-semibold text-gray-900'>
                {booking.paymentStatus}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
