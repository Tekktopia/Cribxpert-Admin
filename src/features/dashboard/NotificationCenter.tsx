import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useState } from "react";

interface NotificationItem {
  id: string;
  type: "system_alert" | "suspicious_activity" | "maintenance" | "broadcast";
  title: string;
  description: string;
  timestamp: string;
  priority: "High" | "Medium" | "Low";
  status: "unread" | "read";
}

interface NotificationCenterProps {
  notifications: NotificationItem[];
}

export function NotificationCenter({ notifications }: NotificationCenterProps) {
  const [activeTab, setActiveTab] = useState("system_alerts");

  return (
    <Card className='p-4'>
      <CardHeader className='pb-4 p-0'>
        <div className='flex justify-between items-center mb-4'>
          <CardTitle className='text-base font-semibold'>
            Notification Center
          </CardTitle>
          <Button
            size='sm'
            className='bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md'
          >
            + Compose
          </Button>
        </div>

        {/* Tabs */}
        <div className='flex space-x-0 bg-gray-100 rounded-xl p-1'>
          <button
            onClick={() => setActiveTab("system_alerts")}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-colors flex-1 ${
              activeTab === "system_alerts"
                ? "bg-white text-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            System Alerts
          </button>
          <button
            onClick={() => setActiveTab("broadcast")}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-colors flex-1 ${
              activeTab === "broadcast"
                ? "bg-white text-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Broadcast
          </button>
        </div>
      </CardHeader>
      <CardContent className='p-0'>
        <div className='space-y-2 mt-4'>
          {activeTab === "system_alerts" ? (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className='border border-gray-100 rounded-3xl p-3'
              >
                <div className='flex justify-between items-start mb-2'>
                  <h3 className='font-medium text-gray-900 text-sm'>
                    {notification.title}
                  </h3>
                  <span className='text-xs text-gray-500'>
                    {notification.timestamp}
                  </span>
                </div>
                <p className='text-gray-600 text-sm mb-3'>
                  {notification.description}
                </p>
                <div className='flex space-x-4'>
                  <button className='text-xs text-teal-600 hover:text-teal-700'>
                    View Details
                  </button> 
                  <button className='text-xs text-gray-500 hover:text-gray-700'>
                    Mark as read
                  </button>
                </div>
              </Card>
            ))
          ) : (
            <>
              <Card className='border border-gray-100 rounded-3xl p-3'>
                <div className='flex justify-between items-start mb-2'>
                  <h3 className='font-medium text-gray-900 text-base'>
                    Platform Update Announcement
                  </h3>
                  <div className='flex items-center space-x-2'>
                    <span className='bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium'>
                      Sent
                    </span>
                    <span className='text-xs text-gray-500'>2025-01-15</span>
                  </div>
                </div>
                <p className='text-gray-600 text-sm'>To: All Users</p>
              </Card>
              <Card className='border border-gray-100 rounded-3xl p-3'>
                <div className='flex justify-between items-start mb-2'>
                  <h3 className='font-medium text-gray-900 text-base'>
                    Holiday Policy Changes
                  </h3>
                  <div className='flex items-center space-x-2'>
                    <span className='bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium'>
                      Draft
                    </span>
                    <span className='text-xs text-gray-500'>2025-01-14</span>
                  </div>
                </div>
                <p className='text-gray-600 text-sm'>To: Hosts Only</p>
              </Card>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
