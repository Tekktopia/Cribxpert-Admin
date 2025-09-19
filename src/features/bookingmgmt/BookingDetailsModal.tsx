import { type Booking } from "@/data/bookingMgmtData";
import { Badge } from "@/components/ui/badge";
import { getStatusVariant } from "@/utils/statusBadges";
import {
  DetailsModal,
  DetailsSection,
  DetailsField,
} from "@/features/bookingmgmt/DetailsModal";

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

  const getStatusBadge = (status: Booking["status"]) => (
    <Badge variant={getStatusVariant(status, "booking")} className='text-xs'>
      {status}
    </Badge>
  );

  return (
    <DetailsModal
      isOpen={isOpen}
      onClose={onClose}
      title='Booking Details'
      size='lg'
    >
      {/* Guest Information */}
      <DetailsSection title='Guest Information'>
        <DetailsField label='Guest Name' value={booking.guestName} />
        <DetailsField
          label='Contact Details'
          value={`${booking.guestName
            .toLowerCase()
            .replace(" ", "")}@Gmail.Com`}
        />
      </DetailsSection>

      {/* Host Information */}
      <DetailsSection title='Host Information'>
        <DetailsField label='Host Name' value={booking.hostName} />
        <DetailsField
          label='Contact Details'
          value={`${booking.hostName.toLowerCase().replace(" ", "")}@Gmail.Com`}
        />
      </DetailsSection>

      {/* Booking Information */}
      <DetailsSection title='Booking Information'>
        <DetailsField label='Date' value={booking.dates} />
        <DetailsField label='Property Name' value={booking.propertyName} />
        <DetailsField label='Status' value={getStatusBadge(booking.status)} />
        <DetailsField label='Payment Status' value={booking.paymentStatus} />
      </DetailsSection>
    </DetailsModal>
  );
}
