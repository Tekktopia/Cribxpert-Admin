import { ActionMenu } from "@/components/ui/ActionMenu";
import { ActionMenuTrigger } from "@/components/ui/ActionMenuTrigger";

interface RowActionMenuProps {
  onSelect: (action: string) => void;
  isScheduled?: boolean;
}

export function RowActionMenu({ onSelect, isScheduled }: RowActionMenuProps) {
  return (
    <ActionMenu
      onSelect={onSelect}
      trigger={<ActionMenuTrigger />}
      items={[
        { label: "View", action: "view" },
        { label: "Edit", action: "edit" },
        ...(isScheduled
          ? [{ label: "Cancel Schedule", action: "cancel" as const }]
          : []),
        { label: "Delete", action: "delete", variant: "destructive" },
      ]}
    />
  );
}
