import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setListings,
  setActiveTab,
  selectFilteredListings,
  selectActiveTab,
} from "../store/slices/listingSlice";
import { listingMgmtData } from "../data/listingMgmtData";

export function useListingFilters() {
  const dispatch = useAppDispatch();
  const filteredListings = useAppSelector(selectFilteredListings);
  const activeTab = useAppSelector(selectActiveTab);

  // Initialize listings data on mount
  useEffect(() => {
    dispatch(setListings(listingMgmtData));
  }, [dispatch]);

  const handleTabChange = (tab: string) => {
    dispatch(setActiveTab(tab));
  };

  return {
    filteredListings,
    activeTab,
    handleTabChange,
  };
}
