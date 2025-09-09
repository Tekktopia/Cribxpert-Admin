interface UserNavigationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "info", label: "Info" },
  { id: "activity", label: "Activity" },
  { id: "history", label: "History" },
];

export function UserNavigationTabs({
  activeTab,
  onTabChange,
}: UserNavigationTabsProps) {
  return (
    <div className='mb-'>
      <nav className='-mb-px flex space-x-8'>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
