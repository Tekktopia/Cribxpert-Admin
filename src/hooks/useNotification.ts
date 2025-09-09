import { useContext, createContext } from "react";
import type { NotificationProps } from "../components/ui/NotificationToast";

export interface NotificationContextType {
  showNotification: (notification: Omit<NotificationProps, "id">) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

export const NotificationContext =
  createContext<NotificationContextType | null>(null);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
}
