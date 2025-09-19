import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { getStatusVariant, getStatusLabel } from "@/utils/statusBadges";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: "verified" | "pending" | "blocked" | "flagged";
  role?: string;
  timestamp?: string;
}

interface KYCComplianceProps {
  users: User[];
}

export function KYCCompliance({ users }: KYCComplianceProps) {
  const getStatusBadge = (status: string) => (
    <Badge variant={getStatusVariant(status, "kyc")}>
      {getStatusLabel(status, "kyc")}
    </Badge>
  );

  return (
    <Card className='p-4'>
      <CardHeader className='p-0 '>
        <CardTitle className='text-base pb-4 font-semibold'>
          KYC & Compliance
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4 pt-2 p-0'>
        {users.map((user) => (
          <div
            key={user.id}
            className='flex items-center justify-between rounded-lg border border-gray-100 p-4'
          >
            <div className='flex items-center space-x-3'>
              <Avatar className='w-10 h-10 border-0'>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className='font-medium text-gray-900'>{user.name}</p>
                <p className='text-sm text-gray-500'>ID Verification</p>
              </div>
            </div>
            <div className='flex flex-col items-end'>
              {getStatusBadge(user.status)}
              <span className='text-xs text-gray-500 mt-1'>
                {user.timestamp}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
