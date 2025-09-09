import { Users, Home, FileX, DollarSign } from "lucide-react";

interface UserStatsCardsProps {
  stats: {
    activeBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalEarnings: string;
  };
}

const statsConfig = [
  {
    key: "activeBookings",
    label: "Active Bookings",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    key: "completedBookings",
    label: "Completed Bookings",
    icon: Home,
    color: "text-primary-600",
    bgColor: "bg-primary-50",
  },
  {
    key: "cancelledBookings",
    label: "Cancelled Bookings",
    icon: FileX,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    key: "totalEarnings",
    label: "Total Earnings",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
];

export function UserStatsCards({ stats }: UserStatsCardsProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
      {statsConfig.map((config) => {
        const Icon = config.icon;
        const value = stats[config.key as keyof typeof stats];

        return (
          <div
            key={config.key}
            className='bg-white rounded-lg border border-gray-200 p-6'
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 mb-1'>
                  {config.label}
                </p>
                <p className='text-2xl font-semibold text-gray-900'>{value}</p>
              </div>
              <div className={`${config.bgColor} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 ${config.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
