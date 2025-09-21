import { useEffect, useMemo, useState } from "react";
import type { Conversation, Message, Participant } from "@/types";
import { ConversationHeader } from "../components/ConversationHeader";
import { MessageBubble } from "../components/MessageBubble";
import { MessageComposer } from "../components/MessageComposer";

interface ConversationPaneProps {
  conversation?: Conversation;
  messages?: Message[];
}

export function ConversationPane({
  conversation,
  messages = [],
}: ConversationPaneProps) {
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);

  // Keep local state in sync when the selected conversation/messages change
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages, conversation?.id]);

  const participantsById = useMemo(() => {
    const map = new Map<string, Participant>();
    conversation?.participants.forEach((p) => map.set(p.id, p));
    return map;
  }, [conversation]);

  const me: Participant | null =
    conversation?.participants.find((p) => p.role === "Host") || null;

  const handleSend = (text: string) => {
    if (!conversation || !me) return;
    setLocalMessages((prev) => [
      ...prev,
      {
        id: `local-${prev.length + 1}`,
        conversationId: conversation.id,
        senderId: me.id,
        body: text,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  if (!conversation) {
    return (
      <div className='h-full flex items-center justify-center text-sm text-gray-500'>
        <button className='px-4 py-2 rounded-md border-gray-200 border text-gray-600 bg-white shadow-sm'>
          Select a chat to start messaging
        </button>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col bg-white rounded-lg border-gray-200 border'>
      <ConversationHeader conversation={conversation} />
      <div className='flex-1 overflow-y-auto px-6 py-6'>
        {localMessages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            me={me}
            participantsById={participantsById}
          />
        ))}
      </div>
      <div className='p-4 border-gray-200 border-t bg-white'>
        <MessageComposer onSend={handleSend} />
      </div>
    </div>
  );
}
