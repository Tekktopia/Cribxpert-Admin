import { useState, useMemo } from "react";
import {
  conversations as seedConversations,
  messagesByConversation,
} from "@/data/messagingData";
import { MessagingSidebar } from "./MessagingSidebar";
import { ConversationPane } from "./ConversationPane";

export function MessagingLayout() {
  const [activeId, setActiveId] = useState<string | undefined>(undefined);

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

  return (
    <div className='grid grid-cols-12 gap-4'>
      <div className='col-span-4 bg-white border border-gray-200 rounded-lg'>
        <MessagingSidebar
          conversations={seedConversations}
          activeId={activeId}
          onSelect={setActiveId}
        />
      </div>
      <div className='col-span-8'>
        <ConversationPane
          conversation={activeConversation}
          messages={activeMessages}
        />
      </div>
    </div>
  );
}
