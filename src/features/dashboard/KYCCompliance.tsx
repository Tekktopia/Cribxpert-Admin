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
  status: "verified" | "pending" | "blocked";
  role: string;
}

interface KYCComplianceProps {
  users: User[];
}

export function KYCCompliance({ users }: KYCComplianceProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge variant='success'>Verified</Badge>;
      case "pending":
        return <Badge variant='pending'>Pending</Badge>;
      case "blocked":
        return <Badge variant='destructive'>Blocked</Badge>;
      default:
        return <Badge variant='secondary'>{status}</Badge>;
    }
  };

  const getStatusAction = (status: string) => {
    switch (status) {
      case "verified":
        return "View profile";
      case "pending":
        return "Review KYC";
      case "blocked":
        return "Reason";
      default:
        return "View";
    }
  };

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle className='text-lg'>KYC & Compliance</CardTitle>
        <a href='#' className='text-sm text-primary-600 hover:text-primary-700'>
          View all
        </a>
      </CardHeader>
      <CardContent className='space-y-4'>
        {users.map((user) => (
          <div
            key={user.id}
            className='flex items-center justify-between p-3 rounded-lg hover:bg-gray-50'
          >
            <div className='flex items-center space-x-3'>
              <Avatar className='w-10 h-10'>
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
                <p className='text-sm text-gray-500'>{user.role}</p>
              </div>
            </div>
            <div className='flex items-center space-x-3'>
              {getStatusBadge(user.status)}
              <button className='text-sm text-teal-600 hover:text-teal-700'>
                {getStatusAction(user.status)}
              </button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
