import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";

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
        return <Badge variant='success'>Completed</Badge>;
      case "pending":
        return <Badge variant='pending'>Pending</Badge>;
      case "failed":
        return <Badge variant='destructive'>Failed</Badge>;
      default:
        return <Badge variant='secondary'>{status}</Badge>;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "user_verification":
        return "bg-blue-100 text-blue-800";
      case "listing_flagged":
        return "bg-yellow-100 text-yellow-800";
      case "payout_processed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle className='text-lg'>Recent Activity</CardTitle>
        <a href='#' className='text-sm text-primary-600 hover:text-primary-700'>
          View all
        </a>
      </CardHeader>
      <CardContent className='space-y-4'>
        {activities.map((activity) => (
          <div
            key={activity.id}
            className='flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50'
          >
            <div
              className={`w-2 h-2 rounded-full mt-2 ${
                getTypeColor(activity.type)
                  .replace("text-", "bg-")
                  .split(" ")[0]
              }`}
            />
            <div className='flex-1 min-w-0'>
              <div className='flex items-center justify-between'>
                <p className='font-medium text-gray-900 truncate'>
                  {activity.title}
                </p>
                {getStatusBadge(activity.status)}
              </div>
              <p className='text-sm text-gray-500 mt-1'>
                {activity.description}
              </p>
              <p className='text-xs text-gray-400 mt-1'>{activity.timestamp}</p>
            </div>
          </div>
        ))}

        <div className='pt-4 border-t'>
          <Button variant='ghost' className='w-full'>
            View All Activities
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
