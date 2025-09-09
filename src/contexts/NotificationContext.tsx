import { useState, useCallback } from "react";
import { NotificationContainer } from "../components/ui/NotificationContainer";
import type { NotificationProps } from "../components/ui/NotificationToast";
import { NotificationContext } from "../hooks/useNotification";

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const showNotification = useCallback(
    (notification: Omit<NotificationProps, "id">) => {
      const id =
        Math.random().toString(36).substring(2) + Date.now().toString(36);

      const newNotification: NotificationProps = {
        ...notification,
        id,
        duration: notification.duration || 5000,
      };

      setNotifications((prev) => [...prev, newNotification]);
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        removeNotification,
        clearAllNotifications,
      }}
    >
      {children}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </NotificationContext.Provider>
  );
}
