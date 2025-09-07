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
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className='bg-teal-50 text-teal-600 hover:bg-teal-50 border-0'>
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge className='bg-amber-50 text-amber-600 hover:bg-amber-50 border-0'>
            Pending
          </Badge>
        );
      case "flagged":
        return (
          <Badge className='bg-red-50 text-red-600 hover:bg-red-50 border-0'>
            Flagged
          </Badge>
        );
      case "blocked":
        return (
          <Badge className='bg-red-50 text-red-600 hover:bg-red-50 border-0'>
            Blocked
          </Badge>
        );
      default:
        return <Badge variant='secondary'>{status}</Badge>;
    }
  };

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
