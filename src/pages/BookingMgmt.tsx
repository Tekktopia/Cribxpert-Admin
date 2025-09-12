import { PageWrapper } from "@/components/layout/PageWrapper";
import { BookingMgmtGrid } from "@/features/bookingmgmt/BookingMgmtGrid";
import { mockBookingMgmtData } from "@/data/bookingMgmtData";

export default function BookingMgmt() {
  const isPopulated = mockBookingMgmtData.bookings.length > 0;

  return (
    <PageWrapper
      title='Bookings Management'
      subtitle='Track all bookings, monitor statuses, and manage payment related actions'
      isPopulated={isPopulated}
      emptyState={{
        iconUrl: "/svg/bookings-simple.svg",
        title: "No bookings yet",
        subtitle:
          "All property bookings made by guests will show here once they start rolling in.",
      }}
    >
      {isPopulated && <BookingMgmtGrid data={mockBookingMgmtData} />}
    </PageWrapper>
  );
}
