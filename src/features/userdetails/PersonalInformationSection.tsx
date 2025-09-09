import { CheckCircle, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

  const informationFields = [
    { label: "Full Name", value: userInfo.fullName },
    { label: "Gender", value: userInfo.gender },
    { label: "Phone number", value: userInfo.phoneNumber },
    { label: "Email", value: userInfo.email },
    { label: "Location", value: userInfo.location },
  ];

  return (
    <div className='border border-[#EBEBEB] rounded-b-lg'>
      <h2 className='text-lg font-semibold py-3 px-4 bg-[#E6EFF1] mb-6'>
        Personal Information
      </h2>

      <div className='space-y-2 px-6 pb-6'>
        {/* Role */}
        <div className='flex items-center gap-4 py-2'>
          <span className='text-sm text-gray-600'>Role:</span>
          <Badge variant={getRoleBadgeVariant(userInfo.role)}>
            {userInfo.role}
          </Badge>
        </div>

        {/* Verification Status */}
        <div className='flex items-center gap-4 py-2'>
          <span className='text-sm text-gray-600'>Verification Status:</span>
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
        </div>

        {/* Personal Details */}
        {informationFields.map((field) => (
          <div key={field.label} className='flex items-center gap-4 py-2'>
            <span className='text-sm text-gray-600'>{field.label}:</span>
            <span className='text-sm text-gray-900 font-medium'>
              {field.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
