import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

interface ActivityItem {
  id: string;
  type: "user_verification" | "listing_flagged" | "payout_processed";
  title: string;
  description: string;
  timestamp: string;
  status: "pending" | "completed" | "failed";
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className='bg-green-50 text-green-600 border-0 hover:bg-green-50'>
            Success
          </Badge>
        );
      case "pending":
        return (
          <Badge className='bg-amber-50 text-amber-600 border-0 hover:bg-amber-50'>
            Warning
          </Badge>
        );
      case "failed":
        return (
          <Badge className='bg-red-50 text-red-600 border-0 hover:bg-red-50'>
            Failed
          </Badge>
        );
      default:
        return <Badge variant='secondary'>{status}</Badge>;
    }
  };

  return (
    <Card className='p-4'>
      <CardHeader className='p-0 pb-4'>
        <div className='flex justify-between items-center'>
          <CardTitle className='text-xl font-semibold'>
            Recent Activity
          </CardTitle>
          <a href='#' className='text-sm text-green-600 font-medium'>
            View all
          </a>
        </div>
      </CardHeader>
      <CardContent className='p-0'>
        <div className='space-y-4'>
          {activities.map((activity) => (
            <Card
              key={activity.id}
              className='border border-gray-100 rounded-3xl py-2 px-3'
            >
              <div className='flex justify-between items-center mb-2'>
                <h3 className='font-medium text-gray-900 text-sm'>
                  {activity.title}
                </h3>
                {getStatusBadge(activity.status)}
              </div>
              <p className='text-gray-600 text-sm mb-2'>
                {activity.description}
              </p>
              <p className='text-xs text-gray-500'>{activity.timestamp}</p>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
