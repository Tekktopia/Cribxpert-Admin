import { PageWrapper } from "@/components/layout/PageWrapper";
import { ListingManagementContainer } from "../features/listingmgmt/containers/ListingManagementContainer";
import { ListingManagementHeader } from "../features/listingmgmt/containers/ListingManagementHeader";

export default function ListingMgmt() {
  // State to toggle between populated and empty view (for demo purposes)
  const isPopulated = true;

  return (
    <PageWrapper
      title='Listings Management'
      subtitle='Review and moderate property listings submitted by hosts'
      isPopulated={isPopulated}
      showDefaultHeader={false}
      headerComponent={<ListingManagementHeader />}
      emptyState={{
        iconUrl: "/svg/listings.svg",
        title: "No listings submitted",
        subtitle:
          "Once hosts begin listing properties, you'll see them here for review.",
      }}
    >
      <ListingManagementContainer />
    </PageWrapper>
  );
}
