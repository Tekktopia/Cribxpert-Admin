import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { getStatusLabel, getStatusVariant } from "@/utils/statusBadges";

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Show only the last 3 activities in the card
  const displayedActivities = activities.slice(0, 3);
  
  // Handle drawer open animation
  useEffect(() => {
    if (isDrawerOpen) {
      // Small delay to trigger animation
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
    }
  }, [isDrawerOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    // Wait for close animation to complete before removing from DOM
    setTimeout(() => {
      setIsDrawerOpen(false);
    }, 300);
  };

  const handleOpen = () => {
    setIsDrawerOpen(true);
  };
  
  const getStatusBadge = (status: ActivityItem["status"]) => (
    <Badge variant={getStatusVariant(status, "activity")}>
      {getStatusLabel(status, "activity")}
    </Badge>
  );

  const renderActivityItem = (activity: ActivityItem) => (
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
  );

  return (
    <>
      <Card className='p-4'>
        <CardHeader className='p-0 pb-4'>
          <div className='flex justify-between items-center'>
            <CardTitle className='text-xl font-semibold'>
              Recent Activity
            </CardTitle>
            <button
              onClick={handleOpen}
              className='text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors'
            >
              View all
            </button>
          </div>
        </CardHeader>
        <CardContent className='p-0'>
          <div className='space-y-4'>
            {displayedActivities.map(renderActivityItem)}
          </div>
        </CardContent>
      </Card>

      {/* Drawer for viewing all activities */}
      {(isDrawerOpen || isAnimating) && (
        <>
          {/* Overlay with fade animation */}
          <div
            className={`fixed inset-0 h-full bg-black/50 z-40 transition-opacity duration-300 ease-in-out ${
              isAnimating ? "opacity-100" : "opacity-0"
            }`}
            onClick={handleClose}
          />

          {/* Drawer with slide animation */}
          <div
            className={`fixed top-0 right-0 overflow-y-auto p-6 h-full w-full lg:w-[500px] bg-white shadow-2xl transform transition-transform duration-300 ease-out z-50 ${
              isAnimating ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Header */}
            <div className='flex items-center justify-between mb-6 pb-4 border-b border-gray-200'>
              <CardTitle className='text-2xl font-semibold'>
                All Recent Activities
              </CardTitle>
              <button
                onClick={handleClose}
                className='p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors'
                aria-label='Close drawer'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* Activities List */}
            <div className='space-y-4'>
              {activities.length === 0 ? (
                <div className='text-center py-12 text-gray-500'>
                  <p>No recent activities</p>
                </div>
              ) : (
                activities.map(renderActivityItem)
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
