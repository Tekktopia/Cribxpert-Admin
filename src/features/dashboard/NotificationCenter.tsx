import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  timestamp: string;
  read: boolean;
}

interface NotificationCenterProps {
  notifications: NotificationItem[];
}

export function NotificationCenter({ notifications }: NotificationCenterProps) {
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "success":
        return <Badge variant='success'>Success</Badge>;
      case "warning":
        return <Badge variant='warning'>Warning</Badge>;
      case "error":
        return <Badge variant='destructive'>Error</Badge>;
      case "info":
        return <Badge variant='secondary'>Info</Badge>;
      default:
        return <Badge variant='secondary'>{type}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle className='text-lg'>Notification Center</CardTitle>
        <Button variant='ghost' size='sm'>
          <span className='text-primary-600'>Complete</span>
        </Button>
      </CardHeader>
      <CardContent className='space-y-4'>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-3 rounded-lg border ${
              !notification.read
                ? "bg-blue-50 border-blue-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <div className='flex items-center space-x-2 mb-1'>
                  {getTypeBadge(notification.type)}
                  <span className='text-xs text-gray-500'>
                    {notification.timestamp}
                  </span>
                </div>
                <h4 className='font-medium text-gray-900'>
                  {notification.title}
                </h4>
                <p className='text-sm text-gray-600 mt-1'>
                  {notification.message}
                </p>
              </div>
              {!notification.read && (
                <div className='w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1' />
              )}
            </div>
          </div>
        ))}

        <div className='text-center pt-2'>
          <button className='text-sm text-teal-600 hover:text-teal-700'>
            View All Notifications
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
