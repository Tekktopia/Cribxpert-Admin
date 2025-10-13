import { type Audience } from "../utils/types";

interface AudienceSelectProps {
  value: Audience;
  onChange: (value: Audience) => void;
  className?: string;
}

export function AudienceSelect({
  value,
  onChange,
  className = "",
}: AudienceSelectProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Audience)}
        className='appearance-none bg-white border border-gray-200 rounded-md px-3 py-2.5 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 cursor-pointer w-full'
      >
        <option value='all'>All Users</option>
        <option value='hosts'>Hosts Only</option>
        <option value='guests'>Guests Only</option>
        <option value='custom'>Custom Group</option>
      </select>
      {/* Optional chevron can be added via background-icon or absolute SVG */}
    </div>
  );
}
