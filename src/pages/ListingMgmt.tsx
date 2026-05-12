import { useMemo, useEffect } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { ListingManagementContainer } from "../features/listingmgmt/containers/ListingManagementContainer";
import { ListingManagementHeader } from "../features/listingmgmt/containers/ListingManagementHeader";
import { useGetListingsQuery } from "@/api/features/adminListingManagement/adminListingManagementApiSlice";
import LoadingPage from "@/components/ui/LoadingPage";
import { useAppDispatch } from "@/store/hooks";
import { setListings } from "@/store/slices/listingSlice";
import type { ListingRecord } from "@/data/listingMgmtData";
import { useRealtimeRefetch } from "@/hooks/useRealtimeRefetch";

export default function ListingMgmt() {
  const dispatch = useAppDispatch();
  const { data: listingsData, isLoading, error, refetch } = useGetListingsQuery();
  useRealtimeRefetch(['listings'], refetch);

  // Transform API data to match ListingRecord type
  const transformedListings = useMemo(() => {
    if (!listingsData?.listings) return [];

    return listingsData.listings.map((apiListing): ListingRecord => {
      // Get first image URL or use placeholder
      const imageUrl =
        apiListing.listingImg && apiListing.listingImg.length > 0
          ? apiListing.listingImg[0].fileUrl
          : "/images/complaint1.jpg";

      // Construct location from address fields
      const locationParts: string[] = [];
      if (apiListing.street) locationParts.push(apiListing.street);
      if (apiListing.city) locationParts.push(apiListing.city);
      if (apiListing.state) locationParts.push(apiListing.state);
      if (apiListing.country) locationParts.push(apiListing.country);
      const location = locationParts.length > 0
        ? locationParts.join(", ")
        : "Location not specified";

      // Format price using basePrice
      const basePrice = apiListing.basePrice || 0;
      const price = `NGN ${basePrice.toLocaleString()}/night`;

      // Format date
      const createdDate = new Date(apiListing.createdAt);
      const formattedDate = `${String(createdDate.getDate()).padStart(2, "0")}-${String(createdDate.getMonth() + 1).padStart(2, "0")}-${createdDate.getFullYear()}`;

      // Map status: API uses "approved" but UI uses "active"
      const status: ListingRecord["status"] =
        apiListing.status === "approved"
          ? "active"
          : (apiListing.status as ListingRecord["status"]);

      // Generate avatar URL for host
      const hostName = apiListing.userId?.fullName || "Unknown Host";
      const hostEmail = apiListing.userId?.email;
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(hostName)}&background=0e7490&color=fff&size=128`;

      return {
        id: apiListing._id,
        propertyId: (apiListing as any).propertyId,
        title: apiListing.name,
        description: apiListing.description,
        host: {
          name: hostName,
          avatar: avatarUrl,
          email: hostEmail,
        },
        location,
        price,
        basePrice: apiListing.basePrice,
        cleaningFee: apiListing.cleaningFee,
        securityDeposit: apiListing.securityDeposit,
        status,
        created: formattedDate,
        image: imageUrl,
        listingImg: apiListing.listingImg,
        guestNo: apiListing.guestNo,
        bedroomNo: apiListing.bedroomNo,
        bathroomNo: apiListing.bathroomNo,
        latitude: apiListing.latitude,
        longitude: apiListing.longitude,
        totalBookings: apiListing.totalBookings,
        averageRating: apiListing.averageRating,
        reviewCount: apiListing.reviewCount,
        approvedBy: apiListing.approvedBy,
        approvedAt: apiListing.approvedAt,
        amenities: apiListing.amenities,
        houseRules: apiListing.houseRules,
        avaliableFrom: apiListing.avaliableFrom,
        avaliableUntil: apiListing.avaliableUntil,
        hideStatus: apiListing.hideStatus ?? false,
      };
    });
  }, [listingsData]);

  // Update Redux store with transformed listings
  useEffect(() => {
    dispatch(setListings(transformedListings));
  }, [transformedListings, dispatch]);

  const isPopulated = !isLoading && transformedListings.length > 0;

  if (isLoading) {
    return (
      <PageWrapper
        title='Listings Management'
        subtitle='Review and moderate property listings submitted by hosts'
        isPopulated={false}
        showDefaultHeader={false}
        headerComponent={<ListingManagementHeader />}
        emptyState={{
          iconUrl: "/svg/listings.svg",
          title: "Loading listings...",
          subtitle: "Please wait while we fetch the listings.",
        }}
      >
        <LoadingPage />
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper
        title='Listings Management'
        subtitle='Review and moderate property listings submitted by hosts'
        isPopulated={false}
        showDefaultHeader={false}
        headerComponent={<ListingManagementHeader />}
        emptyState={{
          iconUrl: "/svg/listings.svg",
          title: "Error loading listings",
          subtitle: "There was an error loading listings. Please try again later.",
        }}
      />
    );
  }

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
