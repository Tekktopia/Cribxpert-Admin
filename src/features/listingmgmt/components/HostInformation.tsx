import { InfoSection } from "@/components/layout/InfoSection";
import { Mail, Phone } from "lucide-react";

interface HostInformationProps {
  hostName?: string;
  hostEmail?: string;
  hostPhone?: string;
}

export function HostInformation({
  hostName = "Sarah Johnson",
  hostEmail = "topsky@gmail.com",
  hostPhone = "+2348187134675",
}: HostInformationProps) {
  return (
    <InfoSection
      title='Host Information'
      fields={[
        { label: "Name:", value: hostName },
        {
          label: (
            <span className='flex items-center gap-2'>
              <Mail className='w-4 h-4 text-gray-500' />
              <span>:</span>
            </span>
          ),
          value: hostEmail,
        },
        {
          label: (
            <span className='flex items-center gap-2'>
              <Phone className='w-4 h-4 text-gray-500' />
              <span>:</span>
            </span>
          ),
          value: hostPhone,
        },
      ]}
      headerClassName='!text-lg'
      variant='gray'
    />
  );
}
