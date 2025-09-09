import { CheckCircle, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InfoSection, type InfoField } from "@/components/layout/InfoSection";

interface PersonalInformationSectionProps {
  userInfo: {
    role: string;
    verificationStatus: "verified" | "pending" | "rejected";
    fullName: string;
    gender: string;
    phoneNumber: string;
    email: string;
    location: string;
  };
}

export function PersonalInformationSection({
  userInfo,
}: PersonalInformationSectionProps) {
  const getVerificationBadgeVariant = (status: string) => {
    switch (status) {
      case "verified":
        return "success";
      case "pending":
        return "pending";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

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
            variant={getVerificationBadgeVariant(userInfo.verificationStatus)}
            className='flex items-center gap-1'
          >
            <CheckCircle className='w-3 h-3' />
            {userInfo.verificationStatus.charAt(0).toUpperCase() +
              userInfo.verificationStatus.slice(1)}
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
    { label: "Gender", value: userInfo.gender },
    { label: "Phone number", value: userInfo.phoneNumber },
    { label: "Email", value: userInfo.email },
    { label: "Location", value: userInfo.location },
  ];

  return (
    <InfoSection
      title='Personal Information'
      fields={fields}
      variant='bordered'
    />
  );
}
