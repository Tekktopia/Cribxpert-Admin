import { type ActionConfig } from "@/components/layout/ManagementGrid";

// Common action configurations that can be reused across management pages
export const commonActions = {
  // User management actions
  block: (
    onBlock: (entityId: string, entityName: string, reason?: string) => void
  ): ActionConfig => ({
    key: "block",
    modalType: "block",
    modalConfig: {
      title: "Block User",
      message: "Please provide a reason for blocking this user:",
      confirmLabel: "Block User",
      variant: "destructive",
    },
    handler: (entityId, entityName, reason) =>
      onBlock(entityId, entityName, reason),
  }),

  sendNotification: (
    onSend: (entityId: string, entityName: string, message?: string) => void
  ): ActionConfig => ({
    key: "send-notification",
    modalType: "notification",
    modalConfig: {
      title: "Send Notification",
      message: "Enter your notification message:",
      confirmLabel: "Send",
      variant: "primary",
    },
    handler: (entityId, entityName, message) =>
      onSend(entityId, entityName, message),
  }),

  resetSession: (
    onReset: (entityId: string, entityName: string) => void
  ): ActionConfig => ({
    key: "reset-session",
    modalType: "confirmation",
    modalConfig: {
      title: "Reset Session",
      message:
        "Are you sure you want to reset this user's session? They will be logged out of all devices.",
      confirmLabel: "Reset Session",
      variant: "destructive",
    },
    handler: (entityId, entityName) => onReset(entityId, entityName),
  }),

  // Booking management actions
  confirm: (
    onConfirm: (entityId: string, entityName: string) => void
  ): ActionConfig => ({
    key: "confirm",
    modalType: "confirmation",
    modalConfig: {
      title: "Confirm Booking",
      message: "Are you sure you want to confirm this booking?",
      confirmLabel: "Confirm Booking",
      variant: "primary",
    },
    handler: (entityId, entityName) => onConfirm(entityId, entityName),
  }),

  cancel: (
    onCancel: (entityId: string, entityName: string) => void
  ): ActionConfig => ({
    key: "cancel",
    modalType: "confirmation",
    modalConfig: {
      title: "Cancel Booking",
      message:
        "Are you sure you want to cancel this booking? This action cannot be undone.",
      confirmLabel: "Cancel Booking",
      variant: "destructive",
    },
    handler: (entityId, entityName) => onCancel(entityId, entityName),
  }),

  hold: (
    onHold: (entityId: string, entityName: string) => void
  ): ActionConfig => ({
    key: "hold",
    modalType: "confirmation",
    modalConfig: {
      title: "Hold Booking",
      message: "Are you sure you want to put this booking on hold?",
      confirmLabel: "Hold Booking",
      variant: "primary",
    },
    handler: (entityId, entityName) => onHold(entityId, entityName),
  }),

  // Generic actions
  delete: (
    onDelete: (entityId: string, entityName: string) => void,
    entityType: string = "item"
  ): ActionConfig => ({
    key: "delete",
    modalType: "confirmation",
    modalConfig: {
      title: `Delete ${entityType}`,
      message: `Are you sure you want to delete this ${entityType}? This action cannot be undone.`,
      confirmLabel: `Delete ${entityType}`,
      variant: "destructive",
    },
    handler: (entityId, entityName) => onDelete(entityId, entityName),
  }),

  activate: (
    onActivate: (entityId: string, entityName: string) => void,
    entityType: string = "item"
  ): ActionConfig => ({
    key: "activate",
    modalType: "confirmation",
    modalConfig: {
      title: `Activate ${entityType}`,
      message: `Are you sure you want to activate this ${entityType}?`,
      confirmLabel: `Activate ${entityType}`,
      variant: "primary",
    },
    handler: (entityId, entityName) => onActivate(entityId, entityName),
  }),

  deactivate: (
    onDeactivate: (entityId: string, entityName: string) => void,
    entityType: string = "item"
  ): ActionConfig => ({
    key: "deactivate",
    modalType: "confirmation",
    modalConfig: {
      title: `Deactivate ${entityType}`,
      message: `Are you sure you want to deactivate this ${entityType}?`,
      confirmLabel: `Deactivate ${entityType}`,
      variant: "destructive",
    },
    handler: (entityId, entityName) => onDeactivate(entityId, entityName),
  }),

  // Direct action (no modal)
  view: (
    onView: (entityId: string, entityName: string) => void
  ): ActionConfig => ({
    key: "view",
    handler: (entityId, entityName) => onView(entityId, entityName),
  }),

  edit: (
    onEdit: (entityId: string, entityName: string) => void
  ): ActionConfig => ({
    key: "edit",
    handler: (entityId, entityName) => onEdit(entityId, entityName),
  }),
};

// Helper function to create custom action configurations
export const createCustomAction = (
  key: string,
  handler: (entityId: string, entityName: string, input?: string) => void,
  modalConfig?: {
    type: "block" | "notification" | "confirmation";
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: "primary" | "destructive";
  }
): ActionConfig => ({
  key,
  modalType: modalConfig?.type,
  modalConfig: modalConfig
    ? {
        title: modalConfig.title,
        message: modalConfig.message,
        confirmLabel: modalConfig.confirmLabel || key,
        variant: modalConfig.variant || "primary",
      }
    : undefined,
  handler,
});

// Common filter configurations
export const commonFilters = {
  status: (options: Array<{ value: string; label: string }>) => ({
    key: "status",
    label: "All Status",
    value: "all",
    onChange: () => {}, // Will be overridden by ManagementGrid
    options,
  }),

  role: (options: Array<{ value: string; label: string }>) => ({
    key: "role",
    label: "All Roles",
    value: "all",
    onChange: () => {}, // Will be overridden by ManagementGrid
    options,
  }),

  type: (
    options: Array<{ value: string; label: string }>,
    label: string = "All Types"
  ) => ({
    key: "type",
    label,
    value: "all",
    onChange: () => {}, // Will be overridden by ManagementGrid
    options,
  }),

  category: (options: Array<{ value: string; label: string }>) => ({
    key: "category",
    label: "All Categories",
    value: "all",
    onChange: () => {}, // Will be overridden by ManagementGrid
    options,
  }),
};

// Common search configurations
export const commonSearchConfigs = {
  user: {
    fields: ["name", "email", "ticketId"],
  },
  booking: {
    fields: ["guestName", "hostName", "propertyName", "ticketId"],
  },
  property: {
    fields: ["name", "address", "description", "id"],
  },
  transaction: {
    fields: ["id", "description", "reference"],
  },
};
