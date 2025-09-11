import { ListingDetailsModal } from "./ListingDetailsModal";
import { useListingActions } from "@/hooks/useListingActions";
import type { ListingRecord } from "@/data/listingMgmtData";

interface ListingDetailsManagerProps {
  children: (props: {
    onViewDetails: (listing: ListingRecord) => void;
  }) => React.ReactNode;
}

export function ListingDetailsManager({
  children,
}: ListingDetailsManagerProps) {
  const { selectedListing, modals, handleViewDetails, handleCloseModal } =
    useListingActions();

  return (
    <>
      {children({ onViewDetails: handleViewDetails })}

      <ListingDetailsModal
        isOpen={modals.details}
        onClose={() => handleCloseModal("details")}
        listing={selectedListing}
      />
    </>
  );
}
