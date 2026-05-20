// src/features/dashboard/RecentActivity.tsx
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

  const displayedActivities = activities.slice(0, 5);

  useEffect(() => {
    if (isDrawerOpen) {
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
    }
  }, [isDrawerOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setIsDrawerOpen(false), 300);
  };

  const renderRow = (activity: ActivityItem) => (
    <div
      key={activity.id}
      className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 leading-tight">
          {activity.title}
        </p>
        <p className="text-sm text-gray-500 mt-0.5 truncate">
          {activity.description}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{activity.timestamp}</p>
      </div>
      <Badge
        variant={getStatusVariant(activity.status, "activity")}
        className="flex-shrink-0 mt-0.5"
      >
        {getStatusLabel(activity.status, "activity")}
      </Badge>
    </div>
  );

  return (
    <>
      <Card className="p-5 h-full">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Recent Activity
            </CardTitle>
            {activities.length > 5 && (
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors"
              >
                View all
              </button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {activities.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No recent activity
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {displayedActivities.map(renderRow)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Slide-in drawer */}
      {(isDrawerOpen || isAnimating) && (
        <>
          <div
            className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
              isAnimating ? "opacity-100" : "opacity-0"
            }`}
            onClick={handleClose}
          />

          <div
            className={`fixed top-0 right-0 h-full w-full lg:w-[480px] bg-white z-50 flex flex-col transform transition-transform duration-300 ease-out ${
              isAnimating ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                All Recent Activity
              </h2>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {activities.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-12">
                  No recent activities
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {activities.map(renderRow)}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
