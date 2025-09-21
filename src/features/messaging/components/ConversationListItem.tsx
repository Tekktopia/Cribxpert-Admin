import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import {
  formatTimeShort,
  textPreview,
  initialsFromName,
} from "../utils/formatters";
import type { Conversation } from "@/types";

interface ConversationListItemProps {
  conversation: Conversation;
  isActive?: boolean;
  onClick?: () => void;
}

export function ConversationListItem({
  conversation,
  isActive,
  onClick,
}: ConversationListItemProps) {
  const primary = conversation.participants
    .map((p) => (p.role === "Host" ? `${p.name} (Host)` : p.name))
    .join(" – ");

  // Use first participant for avatar display when single; if 2, show stacked via CSS overlay
  const p0 = conversation.participants[0];
  const time = formatTimeShort(conversation.lastMessageAt);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-3 rounded-md border border-transparent hover:bg-slate-50 transition-colors",
        isActive && "bg-slate-50 font-bold"
      )}
      aria-current={isActive ? "true" : undefined}
    >
      <div className='flex items-start gap-3'>
        <div className='relative'>
          <Avatar className='h-9 w-9'>
            {p0?.avatar && <AvatarImage src={p0.avatar} alt={p0.name} />}
            <AvatarFallback>
              {p0?.initials || initialsFromName(p0?.name || "")}
            </AvatarFallback>
          </Avatar>
          {conversation.participants.length > 1 && (
            <div className='absolute -bottom-1 -right-1 ring-2 ring-white rounded-full'>
              <Avatar className='h-5 w-5'>
                {conversation.participants[1]?.avatar && (
                  <AvatarImage
                    src={conversation.participants[1]!.avatar!}
                    alt={conversation.participants[1]!.name}
                  />
                )}
                <AvatarFallback className='text-[10px]'>
                  {initialsFromName(conversation.participants[1]?.name || "")}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>

        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-gray-900 truncate'>
              {primary}
            </span>
            <span className='text-[11px] text-gray-500 ml-2 whitespace-nowrap'>
              {time}
            </span>
          </div>
          <div className='flex items-center justify-between mt-1'>
            <span className='text-xs text-gray-500 truncate'>
              {textPreview(conversation.preview)}
            </span>
            {conversation.status === "flagged" ? (
              <Badge variant='destructive' className='ml-2'>
                Flagged
              </Badge>
            ) : (
              <span className='text-[11px] text-gray-400 ml-2'>Normal</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
