import { ListingContent } from "./ListingContent";
import { ListingDetailsManager } from "../modals/ListingDetailsManager";
import { ListingActionModalsManager } from "../modals/ListingActionModalsManager";
import { useListingActions } from "@/hooks/useListingActions";

export function ListingManagementContainer() {
  const { handleAction } = useListingActions();

  return (
    <>
      {/* Main Content with Details Modal */}
      <ListingDetailsManager>
        {({ onViewDetails }) => (
          <ListingContent
            onViewDetails={onViewDetails}
            onAction={handleAction}
          />
        )}
      </ListingDetailsManager>

      {/* Action Modals */}
      <ListingActionModalsManager />
    </>
  );
}
