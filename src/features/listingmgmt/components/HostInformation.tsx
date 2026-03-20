import { InfoSection } from "@/components/layout/InfoSection";
import { Mail, User } from "lucide-react";
import type { ListingRecord } from "@/data/listingMgmtData";

interface HostInformationProps {
  host?: ListingRecord["host"];
}

export function HostInformation({
  host,
}: HostInformationProps) {
  const hostName = host?.name || "Unknown Host";
  const hostEmail = host?.email || "Not provided";

  return (
    <InfoSection
      title='Host Information'
      fields={[

        { label: (
          <span className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            Name
            <span>:</span>
          </span>
        ),
        value: hostName
      },
      {
        label: (
          <span className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            Email
            <span>:</span>
          </span>
        ),
        value: hostEmail,
      },
    
      ]}
      headerClassName='!text-lg'
      variant='gray'
    />
  );
}
