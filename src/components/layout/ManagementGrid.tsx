import { useState, useMemo, useCallback } from "react";
import { Upload } from "lucide-react";
import {
  SearchAndFilters,
  type FilterConfig,
  type ActionButton,
} from "@/components/ui/SearchAndFilters";
import {
  BlockUserModal,
  SendNotificationModal,
  ConfirmationModal,
} from "@/components/ui/ActionModals";

// Base entity interface that all entities must extend
export interface BaseEntity {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// Entity action interface for modal handling
export interface EntityAction {
  id: string;
  name: string;
}

// Modal configuration interface
export interface ModalConfig {
  type: "block" | "notification" | "confirmation";
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "primary" | "destructive";
  onConfirm: (input?: string) => void;
}

// Action configuration interface
export interface ActionConfig {
  key: string;
  modalType?: "block" | "notification" | "confirmation";
  modalConfig?: Partial<ModalConfig>;
  handler?: (entityId: string, entityName: string, input?: string) => void;
}

// Search configuration interface
export interface SearchConfig {
  fields: string[]; // Fields to search in
  customFilter?: (entity: BaseEntity, searchValue: string) => boolean;
}

// Generic props interface
export interface ManagementGridProps<T extends BaseEntity> {
  // Core data
  data: T[];
  entityName: string;

  // Search configuration
  searchPlaceholder: string;
  searchConfig?: SearchConfig;

  // Filter configuration
  filters: FilterConfig[];
  customFilterFunction?: (
    entity: T,
    searchValue: string,
    filterValues: Record<string, string>
  ) => boolean;

  // Table rendering
  renderTable: (
    filteredData: T[],
    onAction: (entityId: string, action: string) => void
  ) => React.ReactNode;

  // Action configuration
  actions?: ActionConfig[];
  onEntityAction?: (entityId: string, action: string) => void;

  // Export functionality
  onExport?: () => void;
  customActionButtons?: ActionButton[];

  // Entity name extractor
  getEntityName?: (entity: T) => string;

  // Optional custom modals
  customModals?: React.ReactNode;
}

// Main reusable ManagementGrid component
export function ManagementGrid<T extends BaseEntity>({
  data,
  entityName,
  searchPlaceholder,
  searchConfig,
  filters,
  customFilterFunction,
  renderTable,
  actions = [],
  onEntityAction,
  onExport,
  customActionButtons = [],
  getEntityName,
  customModals,
}: ManagementGridProps<T>) {
  const [searchValue, setSearchValue] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      filters.forEach((filter) => {
        initial[filter.key] = "all";
      });
      return initial;
    }
  );

  // Modal states
  const [selectedEntity, setSelectedEntity] = useState<EntityAction | null>(
    null
  );
  const [activeModal, setActiveModal] = useState<ModalConfig | null>(null);

  // Default entity name extractor
  const extractEntityName = (entity: T): string => {
    if (getEntityName) {
      return getEntityName(entity);
    }
    // Try common name fields using safe property access
    const nameValue = safeGetProperty(entity, "name");
    if (typeof nameValue === "string") return nameValue;

    const guestNameValue = safeGetProperty(entity, "guestName");
    if (typeof guestNameValue === "string") return guestNameValue;

    const titleValue = safeGetProperty(entity, "title");
    if (typeof titleValue === "string") return titleValue;

    const emailValue = safeGetProperty(entity, "email");
    if (typeof emailValue === "string") return emailValue;

    return entity.id;
  };

  // Safe property accessor using Map for security
  const safeGetProperty = useCallback((obj: T, key: string): unknown => {
    // Create a map of safe property accessors
    const propertyMap = new Map<string, () => unknown>([
      ["id", () => obj.id],
      ["name", () => ("name" in obj ? obj.name : undefined)],
      ["guestName", () => ("guestName" in obj ? obj.guestName : undefined)],
      ["hostName", () => ("hostName" in obj ? obj.hostName : undefined)],
      ["email", () => ("email" in obj ? obj.email : undefined)],
      ["title", () => ("title" in obj ? obj.title : undefined)],
      ["status", () => ("status" in obj ? obj.status : undefined)],
      ["role", () => ("role" in obj ? obj.role : undefined)],
      ["ticketId", () => ("ticketId" in obj ? obj.ticketId : undefined)],
      [
        "propertyName",
        () => ("propertyName" in obj ? obj.propertyName : undefined),
      ],
      ["dates", () => ("dates" in obj ? obj.dates : undefined)],
      [
        "paymentStatus",
        () => ("paymentStatus" in obj ? obj.paymentStatus : undefined),
      ],
      ["amount", () => ("amount" in obj ? obj.amount : undefined)],
      ["avatar", () => ("avatar" in obj ? obj.avatar : undefined)],
      ["lastActive", () => ("lastActive" in obj ? obj.lastActive : undefined)],
    ]);

    const accessor = propertyMap.get(key);
    return accessor ? accessor() : undefined;
  }, []);

  // Default search function
  const defaultSearchFunction = useCallback(
    (entity: T, searchValue: string): boolean => {
      if (!searchValue) return true;

      const searchLower = searchValue.toLowerCase();

      if (searchConfig?.customFilter) {
        return searchConfig.customFilter(entity, searchValue);
      }

      const fieldsToSearch = searchConfig?.fields || ["name", "id"];

      return fieldsToSearch.some((field) => {
        const value = safeGetProperty(entity, field);
        if (typeof value === "string") {
          return value.toLowerCase().includes(searchLower);
        }
        return false;
      });
    },
    [searchConfig, safeGetProperty]
  );

  // Default filter function
  const defaultFilterFunction = useCallback(
    (
      entity: T,
      searchValue: string,
      filterValues: Record<string, string>
    ): boolean => {
      // Apply search filter
      if (!defaultSearchFunction(entity, searchValue)) {
        return false;
      }

      // Apply property filters
      return Object.entries(filterValues).every(([key, value]) => {
        if (value === "all") return true;
        const entityValue = safeGetProperty(entity, key);
        return entityValue === value;
      });
    },
    [defaultSearchFunction, safeGetProperty]
  );

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    const filterFunction = customFilterFunction || defaultFilterFunction;
    return data.filter((entity) =>
      filterFunction(entity, searchValue, filterValues)
    );
  }, [
    data,
    searchValue,
    filterValues,
    customFilterFunction,
    defaultFilterFunction,
  ]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  // Handle entity actions
  const handleEntityAction = (entityId: string, action: string) => {
    const entity = data.find((item) => item.id === entityId);
    if (!entity) return;

    const entityName = extractEntityName(entity);
    setSelectedEntity({ id: entityId, name: entityName });

    // Find action configuration
    const actionConfig = actions.find((a) => a.key === action);

    if (actionConfig?.modalType && actionConfig.modalConfig) {
      // Show configured modal
      const modalConfig: ModalConfig = {
        type: actionConfig.modalType,
        title: actionConfig.modalConfig.title || `${action} ${entityName}`,
        message:
          actionConfig.modalConfig.message ||
          `Are you sure you want to ${action} ${entityName}?`,
        confirmLabel: actionConfig.modalConfig.confirmLabel || action,
        variant: actionConfig.modalConfig.variant || "primary",
        onConfirm: (input?: string) => {
          if (actionConfig.handler) {
            actionConfig.handler(entityId, entityName, input);
          }
          setActiveModal(null);
          setSelectedEntity(null);
        },
      };
      setActiveModal(modalConfig);
    } else if (actionConfig?.handler) {
      // Execute handler directly
      actionConfig.handler(entityId, entityName);
    } else if (onEntityAction) {
      // Fallback to generic action handler
      onEntityAction(entityId, action);
    }
  };

  const handleClearFilters = () => {
    setSearchValue("");
    const clearedFilters: Record<string, string> = {};
    filters.forEach((filter) => {
      clearedFilters[filter.key] = "all";
    });
    setFilterValues(clearedFilters);
  };

  // Map filters with proper onChange handlers
  const mappedFilters: FilterConfig[] = filters.map((filter) => ({
    ...filter,
    value: filterValues[filter.key] || "all",
    onChange: (value: string) => handleFilterChange(filter.key, value),
  }));

  // Define default action buttons
  const defaultActionButtons: ActionButton[] = onExport
    ? [
        {
          label: "Export",
          icon: <Upload className='w-4 h-4 ml-2' />,
          onClick: onExport,
          variant: "primary",
        },
      ]
    : [];

  const actionButtons = [...defaultActionButtons, ...customActionButtons];

  return (
    <div className='space-y-6'>
      {/* Search and Filters */}
      <SearchAndFilters
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder={searchPlaceholder}
        filters={mappedFilters}
        actionButtons={actionButtons}
        resultsInfo={{
          total: data.length,
          filtered: filteredData.length,
          entityName,
        }}
        showActiveFilters={true}
        onClearFilters={handleClearFilters}
      />

      {/* Table */}
      {renderTable(filteredData, handleEntityAction)}

      {/* Default Modals */}
      {activeModal && activeModal.type === "block" && (
        <BlockUserModal
          isOpen={true}
          onClose={() => {
            setActiveModal(null);
            setSelectedEntity(null);
          }}
          userName={selectedEntity?.name || ""}
          onConfirm={(reason: string) => activeModal.onConfirm(reason)}
        />
      )}

      {activeModal && activeModal.type === "notification" && (
        <SendNotificationModal
          isOpen={true}
          onClose={() => {
            setActiveModal(null);
            setSelectedEntity(null);
          }}
          userName={selectedEntity?.name || ""}
          onSend={(message: string) => activeModal.onConfirm(message)}
        />
      )}

      {activeModal && activeModal.type === "confirmation" && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => {
            setActiveModal(null);
            setSelectedEntity(null);
          }}
          title={activeModal.title}
          message={activeModal.message}
          confirmLabel={activeModal.confirmLabel || "Confirm"}
          onConfirm={() => activeModal.onConfirm()}
          variant={activeModal.variant || "primary"}
        />
      )}

      {/* Custom Modals */}
      {customModals}
    </div>
  );
}
