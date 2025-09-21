import { useState, useMemo } from "react";
import { ChevronLeft } from "lucide-react";
import {
  conversations as seedConversations,
  messagesByConversation,
} from "@/data/messagingData";
import { MessagingSidebar } from "./MessagingSidebar";
import { ConversationPane } from "./ConversationPane";

export function MessagingLayout() {
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const activeConversation = useMemo(
    () => seedConversations.find((c) => c.id === activeId),
    [activeId]
  );
  const allowedIds = useMemo(
    () => new Set(seedConversations.map((c) => c.id)),
    []
  );
  const messagesMap = useMemo(
    () => new Map(Object.entries(messagesByConversation)),
    []
  );
  const activeMessages =
    activeId && allowedIds.has(activeId) ? messagesMap.get(activeId) ?? [] : [];

  const handleSelect = (id: string) => {
    setActiveId(id);
    setMobileView("chat");
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-12 gap-4 h-[calc(100vh-220px)] md:h-auto'>
      {/* Sidebar (visible on md+, or on mobile when in list view) */}
      <div
        className={`bg-white border border-gray-200 rounded-lg ${
          mobileView === "list" ? "block" : "hidden"
        } md:block md:col-span-4`}
      >
        <MessagingSidebar
          conversations={seedConversations}
          activeId={activeId}
          onSelect={handleSelect}
        />
      </div>

      {/* Conversation pane (visible on md+, or on mobile when in chat view) */}
      <div
        className={`${
          mobileView === "chat" ? "block" : "hidden"
        } md:block md:col-span-8`}
      >
        {/* Mobile back bar to mimic WhatsApp */}
        <div className='md:hidden mb-2'>
          <button
            onClick={() => setMobileView("list")}
            className='inline-flex items-center gap-2 text-sm text-gray-700'
            aria-label='Back to conversations'
          >
            <ChevronLeft className='w-5 h-5' />
            Chats
          </button>
        </div>
        <ConversationPane
          conversation={activeConversation}
          messages={activeMessages}
        />
      </div>
    </div>
  );
}
