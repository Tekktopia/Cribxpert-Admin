import { NotificationToast, type NotificationProps } from "./NotificationToast";

interface NotificationContainerProps {
  notifications: NotificationProps[];
  onRemove: (id: string) => void;
}

export function NotificationContainer({
  notifications,
  onRemove,
}: NotificationContainerProps) {
  if (notifications.length === 0) return null;

  return (
    <div className='fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full'>
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          {...notification}
          onRemove={onRemove}
          isVisible={true}
        />
      ))}
    </div>
  );
}
