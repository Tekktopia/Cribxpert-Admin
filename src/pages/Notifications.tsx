import { PageWrapper } from "@/components/layout/PageWrapper";
import { NotificationPageContainer } from "@/features/notifications";

export default function Notification() {
  return (
    <PageWrapper
      title='Notification'
      subtitle='Send alerts and updates to all users or specific groups.'
      isPopulated
      emptyState={{
        iconUrl: "/svg/notification.svg",
        title: "No notification yet",
        subtitle:
          "Bookings and performance insights will show here once activity begins.",
      }}
    >
      <NotificationPageContainer />
    </PageWrapper>
  );
}
