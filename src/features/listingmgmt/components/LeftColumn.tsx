import { InfoSection } from "@/components/layout/InfoSection";
import { PropertyDetailsSection } from "./PropertyDetailsSection";
import type { ListingRecord } from "@/data/listingMgmtData";

interface LeftColumnProps {
  listing: ListingRecord;
}

export function LeftColumn({ listing }: LeftColumnProps) {
  const amenities = [
    "• WiFi",
    "• Kitchen",
    "• Washer & Dryer",
    "• Air Conditioning",
    "• Heating",
    "• TV",
    "• Gym Access",
    "• Rooftop Terrace",
    "• Concierge",
    "• Parking",
  ].map((amenity) => ({ label: amenity, value: "" }));

  const houseRules = [
    "• No smoking",
    "• No pets",
    "• No parties or events",
    "• Quiet hours 10 PM - 8 AM",
    "• Maximum 4 guests",
  ].map((rule) => ({ label: rule, value: "" }));

  return (
    <div className='space-y-0'>
      <PropertyDetailsSection listing={listing} />

      {/* Amenities */}
      <InfoSection
        title='Amenities'
        fields={amenities}
        variant='bordered'
        className=''
        contentClassName='grid grid-cols-3 gap-1'
        fieldClassName='py-1'
      />

      {/* House Rules */}
      <InfoSection
        title='House Rules'
        fields={houseRules}
        variant='bordered'
        className=''
        fieldClassName='py-1'
      />

      {/* Check In & Check Out */}
      <InfoSection
        title='Check In & Check Out'
        fields={[
          { label: "Check-in", value: "3:00 PM" },
          { label: "Check-out", value: "11:00 AM" },
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
      <InfoSection
        title='Action History'
        fields={[
          {
            label: "Approved By",
            value: "Jennifer D on August 15, 2025",
          },
          {
            label: "Notes",
            value: "Property meets all requirements. Approved for listing",
          },
        ]}
        variant='bordered'
        className='mt-4'
      />
    </div>
  );
}
