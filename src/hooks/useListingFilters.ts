import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setActiveTab,
  selectFilteredListings,
  selectActiveTab,
} from "../store/slices/listingSlice";

export function useListingFilters() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(selectActiveTab);
  const filteredListings = useAppSelector(selectFilteredListings);

  const handleTabChange = (tab: string) => {
    dispatch(setActiveTab(tab));
  };

  return {
    filteredListings,
    activeTab,
    handleTabChange,
  };
}
