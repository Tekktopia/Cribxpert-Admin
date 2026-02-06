import { InfoSection } from "@/components/layout/InfoSection";
import { PropertyDetailsSection } from "./PropertyDetailsSection";
import type { ListingRecord } from "@/data/listingMgmtData";

interface LeftColumnProps {
  listing: ListingRecord;
}

export function LeftColumn({ listing }: LeftColumnProps) {
  // Use actual amenities from listing or fallback to empty array
  const amenities = listing.amenities && listing.amenities.length > 0
    ? listing.amenities.map((amenity) => ({
        label: `• ${amenity.name}`,
        value: "",
      }))
    : [];

  // Use actual house rules from listing or fallback to empty array
  const houseRules = listing.houseRules && listing.houseRules.length > 0
    ? listing.houseRules.map((rule) => ({
        label: `• ${rule.name}`,
        value: "",
      }))
    : [];

  return (
    <div className='space-y-0'>
      <PropertyDetailsSection listing={listing} />

      {/* Amenities */}
      <InfoSection
        title='Amenities'
        fields={amenities}
        variant='bordered'
        className=''
        contentClassName='grid grid-cols-2 gap-x-6 gap-y-2'
        fieldClassName='py-1.5'
      />

      {/* House Rules */}
      <InfoSection
        title='House Rules'
        fields={houseRules}
        variant='bordered'
        className=''
        contentClassName='grid grid-cols-2 gap-x-6 gap-y-2'
        fieldClassName='py-1.5'
      />

      {/* Availability */}
      <InfoSection
        title='Availability'
        fields={[
          {
            label: "Available From",
            value: listing.avaliableFrom
              ? (() => {
                  try {
                    const date = new Date(listing.avaliableFrom);
                    return date.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                  } catch {
                    return listing.avaliableFrom;
                  }
                })()
              : "Not specified",
          },
          {
            label: "Available Until",
            value: listing.avaliableUntil
              ? (() => {
                  try {
                    const date = new Date(listing.avaliableUntil);
                    return date.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                  } catch {
                    return listing.avaliableUntil;
                  }
                })()
              : "Not specified",
          },
        ]}
        variant='bordered'
        className='mt-4'
        fieldClassName='py-1'
      />

      <div className='mt-4'>
        <p className='text-xs text-gray-500'>
          Cancellation Policy: Moderate - Free cancellation up to 5 days before
          check-in
        </p>
      </div>

      {/* Action History */}
      {listing.approvedBy && listing.approvedAt && (
        <InfoSection
          title='Action History'
          fields={[
            {
              label: "Approved By",
              value: listing.approvedBy,
            },
            {
              label: "Approved At",
              value: (() => {
                try {
                  const date = new Date(listing.approvedAt);
                  return date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });
                } catch {
                  return listing.approvedAt;
                }
              })(),
            },
          ]}
          variant='bordered'
          className='mt-4'
        />
      )}
    </div>
  );
}
