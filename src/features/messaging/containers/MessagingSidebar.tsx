import { useMemo, useState } from "react";
import type { Conversation } from "@/types";
import { SearchAndFilters } from "@/components/ui/SearchAndFilters";
import { VirtualizedConversationList } from "../components/VirtualizedConversationList";
import { textPreview } from "../utils/formatters";

interface MessagingSidebarProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
}

export function MessagingSidebar({
  conversations,
  activeId,
  onSelect,
}: MessagingSidebarProps) {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "unread" | "flagged">("all");

  const filtered = useMemo(() => {
    let items = conversations;
    if (tab === "unread") items = items.filter((c) => c.unreadCount > 0);
    if (tab === "flagged") items = items.filter((c) => c.status === "flagged");
    if (q.trim()) {
      const s = q.toLowerCase();
      items = items.filter((c) => {
        const name = c.participants
          .map((p) => p.name)
          .join(" ")
          .toLowerCase();
        return (
          name.includes(s) || textPreview(c.preview).toLowerCase().includes(s)
        );
      });
    }
    return items;
  }, [conversations, q, tab]);

  return (
    <div className='flex flex-col h-full'>
      <div className='p-3'>
        <div className='relative'>
          <SearchAndFilters
            searchValue={q}
            onSearchChange={setQ}
            searchPlaceholder='Search Users...'
            filters={[]}
            showActiveFilters={false}
          />
        </div>
        <div className='mt-3 flex items-center gap-2'>
          <button
            onClick={() => setTab("all")}
            className={`px-3 py-2 text-sm rounded-md ${
              tab === "all"
                ? "bg-primary-600 text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTab("unread")}
            className={`px-3 py-2 text-sm rounded-md ${
              tab === "unread"
                ? "bg-primary-600 text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setTab("flagged")}
            className={`px-3 py-2 text-sm rounded-md ${
              tab === "flagged"
                ? "bg-primary-600 text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Flagged
          </button>
        </div>
      </div>
      <div className='px-3 pb-3 border-t border-gray-200'>
        <VirtualizedConversationList
          conversations={filtered}
          activeId={activeId}
          onSelect={onSelect}
          height={560}
        />
      </div>
    </div>
  );
}
