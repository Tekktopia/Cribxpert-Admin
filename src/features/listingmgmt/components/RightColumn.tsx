import { PricingSection } from "./PricingSection";
import { HostInformation } from "./HostInformation";
import { PerformanceSection } from "./PerformanceSection";
import { ListingInfoSection } from "./ListingInfoSection";
import type { ListingRecord } from "@/data/listingMgmtData";

interface RightColumnProps {
  listing?: ListingRecord;
  className?: string;
}

export function RightColumn({ listing, className = "" }: RightColumnProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <PricingSection
        basePrice={listing?.basePrice}
        cleaningFee={listing?.cleaningFee}
        securityDeposit={listing?.securityDeposit}
      />
      <HostInformation host={listing?.host} />
      <PerformanceSection listing={listing} />
      <ListingInfoSection listing={listing} />
    </div>
  );
}
