import { useMemo, useRef, useState, useEffect } from "react";
import type { UIEvent } from "react";
import type { Conversation } from "@/types";
import { ConversationListItem } from "./ConversationListItem";

interface VirtualizedConversationListProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
  itemHeight?: number; // px
  overscan?: number; // rows
  height?: number; // container height; defaults to 560px
}

export function VirtualizedConversationList({
  conversations,
  activeId,
  onSelect,
  itemHeight = 72,
  overscan = 6,
  height = 560,
}: VirtualizedConversationListProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = conversations.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    conversations.length - 1,
    Math.floor((scrollTop + height) / itemHeight) + overscan
  );

  const visible = useMemo(
    () => conversations.slice(startIndex, endIndex + 1),
    [conversations, startIndex, endIndex]
  );

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Ensure container has fixed height for windowing
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.height = `${height}px`;
    }
  }, [height]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className='relative overflow-y-auto'
      style={{ height }}
      role='list'
      aria-label='Conversations'
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: startIndex * itemHeight,
            left: 0,
            right: 0,
          }}
        >
          {visible.map((c) => (
            <div key={c.id} style={{ height: itemHeight }} role='listitem'>
              <ConversationListItem
                conversation={c}
                isActive={c.id === activeId}
                onClick={() => onSelect(c.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
