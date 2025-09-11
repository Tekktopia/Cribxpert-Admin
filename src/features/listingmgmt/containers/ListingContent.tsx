import { ListingManagementTabs } from "./ListingManagementTabs";
import { ListingGrid } from "../components/ListingGrid";
import { useListingFilters } from "@/hooks/useListingFilters";
import type { ListingRecord } from "@/data/listingMgmtData";

interface ListingContentProps {
  onViewDetails: (listing: ListingRecord) => void;
  onAction: (listing: ListingRecord, action: string) => void;
}

export function ListingContent({
  onViewDetails,
  onAction,
}: ListingContentProps) {
  const { filteredListings, activeTab, handleTabChange } = useListingFilters();

  return (
    <>
      {/* Tabs */}
      <ListingManagementTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Listings Grid */}
      <ListingGrid
        listings={filteredListings}
        onViewDetails={onViewDetails}
        onAction={onAction}
      />
    </>
  );
}
