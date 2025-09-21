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
  height?: number; // if omitted, auto-measure container height
}

export function VirtualizedConversationList({
  conversations,
  activeId,
  onSelect,
  itemHeight = 72,
  overscan = 6,
  height,
}: VirtualizedConversationListProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [autoHeight, setAutoHeight] = useState<number>(560);

  const totalHeight = conversations.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const h = height ?? autoHeight;
  const endIndex = Math.min(
    conversations.length - 1,
    Math.floor((scrollTop + h) / itemHeight) + overscan
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
    if (!containerRef.current) return;
    if (height) {
      containerRef.current.style.height = `${height}px`;
      return;
    }
    // Auto-measure with ResizeObserver
    const el = containerRef.current;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      const newH = Math.floor(entry.contentRect.height);
      if (newH > 0) setAutoHeight(newH);
    });
    ro.observe(el);
    // Initial measure
    const rect = el.getBoundingClientRect();
    if (rect.height > 0) setAutoHeight(Math.floor(rect.height));
    return () => ro.disconnect();
  }, [height]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className='relative overflow-y-auto'
    //   style={{ height: h }}
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
