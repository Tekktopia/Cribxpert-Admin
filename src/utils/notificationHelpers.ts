import { useNotification } from "../hooks/useNotification";

// Utility hooks for common notification patterns
export function useActionNotifications() {
  const { showNotification } = useNotification();

  // Success notifications for common actions
  const showSuccess = (title: string, message?: string) => {
    showNotification({
      type: "success",
      title,
      message,
      duration: 4000,
    });
  };

  // Error notifications for failed actions
  const showError = (title: string, message?: string) => {
    showNotification({
      type: "error",
      title,
      message: message || "Something went wrong. Please try again.",
      duration: 5000,
    });
  };

  // Info notifications for general information
  const showInfo = (title: string, message?: string) => {
    showNotification({
      type: "info",
      title,
      message,
      duration: 3000,
    });
  };

  // Warning notifications for caution messages
  const showWarning = (title: string, message?: string) => {
    showNotification({
      type: "warning",
      title,
      message,
      duration: 4000,
    });
  };

  // Pre-configured notifications for common user management actions
  const notifications = {
    userBlocked: (userName: string) =>
      showSuccess("User Blocked", `${userName} has been blocked successfully.`),

    userUnblocked: (userName: string) =>
      showSuccess(
        "User Unblocked",
        `${userName} has been unblocked successfully.`
      ),

    notificationSent: (userName: string) =>
      showSuccess(
        "Notification Sent",
        `Notification sent to ${userName} successfully.`
      ),

    sessionReset: (userName: string) =>
      showSuccess(
        "Session Reset",
        `${userName}'s session has been reset successfully.`
      ),

    dataExported: () =>
      showInfo(
        "Export Started",
        "Your data export is being prepared. You'll receive a download link shortly."
      ),

    actionFailed: (action: string) =>
      showError(
        `Failed to ${action}`,
        "There was an error processing your request. Please try again."
      ),

    networkError: () =>
      showError(
        "Connection Error",
        "Unable to connect to the server. Please check your internet connection."
      ),

    unauthorized: () =>
      showError(
        "Access Denied",
        "You don't have permission to perform this action."
      ),

    validationError: (field: string) =>
      showWarning(
        "Validation Error",
        `Please check the ${field} field and try again.`
      ),
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    notifications,
    showNotification, // Raw notification function for custom use
  };
}
