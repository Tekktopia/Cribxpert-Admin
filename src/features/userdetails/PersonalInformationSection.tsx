import { CheckCircle, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getStatusLabel, getStatusVariant } from "@/utils/statusBadges";
import { InfoSection, type InfoField } from "@/components/layout/InfoSection";

interface PersonalInformationSectionProps {
  userInfo: {
    role: string;
    verificationStatus: "verified" | "pending" | "rejected";
    fullName: string;
    phoneNumber: string;
    email: string;
    accountDisabled?: boolean;
  };
}

export function PersonalInformationSection({
  userInfo,
}: PersonalInformationSectionProps) {
  const getRoleBadgeVariant = (role: string) => {
    return role === "Host" ? "pending" : "secondary";
  };

  const fields: InfoField[] = [
    {
      label: "Role",
      value: (
        <Badge variant={getRoleBadgeVariant(userInfo.role)}>
          {userInfo.role}
        </Badge>
      ),
    },
    {
      label: "Verification Status",
      value: (
        <div className='flex items-center space-x-2'>
          <Badge
            variant={getStatusVariant(userInfo.verificationStatus, "kyc")}
            className='flex items-center gap-1'
          >
            <CheckCircle className='w-3 h-3' />
            {getStatusLabel(userInfo.verificationStatus, "kyc")}
          </Badge>
          {userInfo.verificationStatus === "verified" && (
            <button className='text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center'>
              <Eye className='w-4 h-4 mr-1' />
              View Documents
            </button>
          )}
        </div>
      ),
    },
    { label: "Full Name", value: userInfo.fullName },
    { label: "Phone number", value: userInfo.phoneNumber },
    { label: "Email", value: userInfo.email },
    {
      label: "Account Status",
      value: (
        <Badge
          variant={userInfo.accountDisabled ? "destructive" : "default"}
          className='text-xs'
        >
          {userInfo.accountDisabled ? "Blocked" : "Active"}
        </Badge>
      ),
    },
  ];

  return (
    <InfoSection
      title='Personal Information'
      fields={fields}
      variant='bordered'
    />
  );
}
