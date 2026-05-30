import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { AudienceSelect } from "./AudienceSelect";
import { UsersCombobox } from "./UsersCombobox";
import { type Audience } from "../utils/types";

export interface NotificationFormValue {
  title: string;
  audience: Audience;
  message: string;
  isScheduled: boolean;
  scheduledAt?: string;
  /** Required when audience === "custom" — the exact users to notify. */
  targetUserIds?: string[];
}

interface NotificationFormProps {
  value: NotificationFormValue;
  onChange: (patch: Partial<NotificationFormValue>) => void;
}

export function NotificationForm({ value, onChange }: NotificationFormProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      {/* Title */}
      <div className='flex flex-col md:col-span-1'>
        <label className='text-sm font-medium text-gray-700 mb-2'>
          Notification Title
        </label>
        <input
          value={value.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder='Enter notification title..'
          className='w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm placeholder-gray-400'
        />
      </div>

      {/* Audience */}
      <div className='flex flex-col md:col-span-1'>
        <label className='text-sm font-medium text-gray-700 mb-2'>
          Target Audience
        </label>
        <AudienceSelect
          value={value.audience}
          onChange={(v) =>
            onChange(
              v === "custom"
                ? { audience: v }
                : { audience: v, targetUserIds: [] }, // clear chips when leaving custom
            )
          }
        />
      </div>

      {/* Specific-users combobox (only shown when audience === "custom") */}
      {value.audience === "custom" && (
        <div className='md:col-span-2'>
          <UsersCombobox
            label='Pick specific users'
            selectedIds={value.targetUserIds ?? []}
            onChange={(ids) => onChange({ targetUserIds: ids })}
          />
        </div>
      )}

      {/* Message */}
      <div className='flex flex-col md:col-span-2'>
        <label className='text-sm font-medium text-gray-700 mb-2'>
          Message
        </label>
        <textarea
          value={value.message}
          onChange={(e) => onChange({ message: e.target.value })}
          placeholder='Enter your notification message..'
          rows={4}
          className='w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm placeholder-gray-400 resize-none'
        />
      </div>

      {/* Schedule toggle */}
      <div className='md:col-span-2'>
        <ToggleSwitch
          checked={value.isScheduled}
          onChange={(checked) => onChange({ isScheduled: checked })}
          label='Schedule for later'
        />
      </div>
    </div>
  );
}
