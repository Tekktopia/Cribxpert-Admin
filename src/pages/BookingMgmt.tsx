import { PageWrapper } from "@/components/layout/PageWrapper";

export default function BookingMgmt() {
  return (
    <PageWrapper
      title='Bookings Management'
      subtitle='Track all bookings, monitor statuses, and manage payment related actions'
      isPopulated={false}
      emptyState={{
        iconUrl: "/svg/bookings.svg",
        title: "No bookings yet",
        subtitle:
          "All property bookings made by guests will show here once they start rolling in.",
      }}
    >
      {/* Future booking management content will go here */}
    </PageWrapper>
  );
}
