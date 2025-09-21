interface MessagingTabsProps {
  active: "all" | "unread" | "flagged";
  onChange: (tab: "all" | "unread" | "flagged") => void;
}

export function MessagingTabs({ active, onChange }: MessagingTabsProps) {
  const Tab = ({
    id,
    label,
  }: {
    id: MessagingTabsProps["active"];
    label: string;
  }) => (
    <button
      onClick={() => onChange(id)}
      className={`px-3 py-2 text-sm rounded-md ${
        active === id
          ? "bg-primary-600 text-white"
          : "text-gray-600 hover:text-gray-800"
      }`}
      role='tab'
      aria-selected={active === id}
    >
      {label}
    </button>
  );

  return (
    <div role='tablist' className='flex items-center gap-2'>
      <Tab id='all' label='All' />
      <Tab id='unread' label='Unread' />
      <Tab id='flagged' label='Flagged' />
    </div>
  );
}
