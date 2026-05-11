import { Button } from "@/components/ui/button";

interface ScheduleControlsProps {
  onPickDate: () => void;
  onSchedule: () => void;
  disabled?: boolean;
  isSending?: boolean;
}

export function ScheduleControls({
  onPickDate,
  onSchedule,
  disabled,
  isSending = false,
}: ScheduleControlsProps) {
  return (
    <div className='flex items-center gap-3'>
      <Button
        variant='secondary'
        onClick={onPickDate}
        disabled={disabled || isSending}
        className='bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
      >
        Schedule Date
      </Button>
      <Button variant='primary' onClick={onSchedule} disabled={disabled || isSending}>
        {isSending ? "Scheduling..." : "Schedule Notification"}
      </Button>
    </div>
  );
}
