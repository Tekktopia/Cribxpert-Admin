import { PageWrapper } from "@/components/layout/PageWrapper";

export default function MessagingMgmt() {
  return (
    <PageWrapper
      title='Messaging'
      subtitle='Monitor user conversations and flag abusive or suspicious content'
      isPopulated={false}
      emptyState={{
        iconUrl: "/svg/messaging.svg",
        title: "No messages to review",
        subtitle:
          "You'll be able to monitor conversations as users start messaging each other.",
      }}
    >
      {/* Future messaging content will go here */}
    </PageWrapper>
  );
}
