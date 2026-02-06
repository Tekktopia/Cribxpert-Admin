import { useAppDispatch } from "@/store/hooks";
import { setActiveTab } from "@/store/slices/listingSlice";
import PageTitle from "@/components/layout/PageTitle";
import { Button } from "@/components/ui/button";

export function ListingManagementHeader() {
  const dispatch = useAppDispatch();

  const handleReviewPending = () => {
    dispatch(setActiveTab("pending"));
  };

  return (
    <div className='flex items-start justify-between'>
      <PageTitle
        title='Listings Management'
        subtitle='Review and moderate property listings submitted by hosts'
      />
      <div className='flex items-center space-x-4'>
        <Button
          variant='primary'
          className='bg-primary-600 hover:bg-primary-700 text-white border-0'
          onClick={handleReviewPending}
        >
          Review Pending Listings
        </Button>
      </div>
    </div>
  );
}
