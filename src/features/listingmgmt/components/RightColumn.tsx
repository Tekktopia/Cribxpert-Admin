import { PricingSection } from "./PricingSection";
import { HostInformation } from "./HostInformation";
import { PerformanceSection } from "./PerformanceSection";
import { ListingInfoSection } from "./ListingInfoSection";

interface RightColumnProps {
  className?: string;
}

export function RightColumn({ className = "" }: RightColumnProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <PricingSection />
      <HostInformation />
      <PerformanceSection />
      <ListingInfoSection />
    </div>
  );
}
