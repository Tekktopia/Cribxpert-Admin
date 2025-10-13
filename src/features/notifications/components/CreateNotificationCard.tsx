import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  NotificationForm,
  type NotificationFormValue,
} from "./NotificationForm";
import { ScheduleControls } from "./ScheduleControls";

interface CreateNotificationCardProps {
  value: NotificationFormValue;
  onChange: (patch: Partial<NotificationFormValue>) => void;
  onSendNow: () => void;
  onPickDate: () => void;
  onSchedule: () => void;
}

export function CreateNotificationCard({
  value,
  onChange,
  onSendNow,
  onPickDate,
  onSchedule,
}: CreateNotificationCardProps) {
  return (
    <Card>
      <CardHeader className='flex items-center gap-2'>
        <div className='flex items-center gap-2'>
          <span className='w-6 h-6 rounded-full bg-teal-50 flex items-center justify-center border border-[#EEEEEE]'>
            <img
              src='/svg/notification.svg'
              alt='notification'
              className='w-4 h-4'
            />
          </span>
          <span className='text-sm font-medium text-gray-900'>
            Create New Notification
          </span>
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        <NotificationForm value={value} onChange={onChange} />

        {/* Actions */}
        <div className='flex items-center justify-between pt-2'>
          {value.isScheduled ? (
            <ScheduleControls
              onPickDate={onPickDate}
              onSchedule={onSchedule}
              disabled={!value.scheduledAt}
            />
          ) : (
            <div />
          )}
          {!value.isScheduled && (
            <Button variant='primary' onClick={onSendNow}>
              Send Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
