import { PageWrapper } from "@/components/layout/PageWrapper";
import { MessagingLayout } from "@/features/messaging";

export default function MessagingMgmt() {
  return (
    <PageWrapper
      title='Messaging'
      subtitle='Monitor user conversations and flag abusive or suspicious content'
      isPopulated={true}
    >
      <MessagingLayout />
    </PageWrapper>
  );
}
