import { PageWrapper } from "@/components/layout/PageWrapper";

export default function Notification() {
  return (
    <PageWrapper
      title='Notification'
      subtitle='Send alerts and updates to all users or specific groups.'
      isPopulated={false}
      emptyState={{
        iconUrl: "/svg/notification.svg",
        title: "No notification yet",
        subtitle:
          "Bookings and performance insights will show here once activity begins.",
      }}
    >
      {/* Future notification content will go here */}
    </PageWrapper>
  );
}
