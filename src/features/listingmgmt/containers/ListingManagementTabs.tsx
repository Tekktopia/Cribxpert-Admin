import { cn } from "@/utils/cn";

interface ListingManagementTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "all", label: "All Listing", count: null },
  { id: "approved", label: "Approved", count: null },
  { id: "pending", label: "Pending", count: null },
  { id: "flagged", label: "Flagged", count: null },
  { id: "rejected", label: "Rejected", count: null },
];

export function ListingManagementTabs({
  activeTab,
  onTabChange,
}: ListingManagementTabsProps) {
  return (
    <div className='border-b border-gray-200 mb-6'>
      <nav className='flex space-x-8'>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === tab.id
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            {tab.label}
            {tab.count && (
              <span className='ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs'>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
