import { ActionButton } from "@/features/listingmgmt/components/ActionButton";
import { getListingActions } from "@/utils/listingUtils";
import type { ListingRecord } from "@/data/listingMgmtData";

interface ListingActionButtonsProps {
  listing: ListingRecord;
  onAction: (action: string) => void;
}

export const ListingActionButtons = ({
  listing,
  onAction,
}: ListingActionButtonsProps) => {
  const actions = getListingActions(listing.status, listing.hideStatus);

  return actions.length > 0 ? (
    <div className='flex gap-2'>
      {actions.map((actionConfig) => (
        <ActionButton
          key={actionConfig.action}
          label={actionConfig.label}
          className="flex-1 w-full"
          onClick={() => onAction(actionConfig.action)}
          variant={actionConfig.variant}
        />
      ))}
    </div>
  ) : null;
};
