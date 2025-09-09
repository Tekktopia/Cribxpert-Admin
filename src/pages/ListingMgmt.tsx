import { PageWrapper } from "@/components/layout/PageWrapper";

export default function ListingMgmt() {
  return (
    <PageWrapper
      title='Listings Management'
      subtitle='Review and moderate property listings submitted by hosts'
      isPopulated={false}
      emptyState={{
        iconUrl: "/svg/listings.svg",
        title: "No listings submitted",
        subtitle:
          "Once hosts begin listing properties, you'll see them here for review.",
      }}
    >
      {/* Future listing management content will go here */}
    </PageWrapper>
  );
}
