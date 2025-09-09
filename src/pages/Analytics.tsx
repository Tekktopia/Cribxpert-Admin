import { PageWrapper } from "@/components/layout/PageWrapper";

export default function Analytics() {
  return (
    <PageWrapper
      title='Analytics'
      subtitle='Get insights into user behavior, growth metrics, and listing performance'
      isPopulated={false}
      emptyState={{
        iconUrl: "/svg/analytics.svg",
        title: "Analytics will appear here",
        subtitle:
          "Track user growth, top listings, and engagement once data is available.",
      }}
    >
      {/* Future analytics content will go here */}
    </PageWrapper>
  );
}
