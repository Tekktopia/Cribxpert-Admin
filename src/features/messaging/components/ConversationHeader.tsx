import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/utils/cn";
import type { Conversation } from "@/types";
import { initialsFromName } from "../utils/formatters";
import { Flag } from "lucide-react";

interface ConversationHeaderProps {
  conversation: Conversation;
  onFlagToggle?: () => void;
}

export function ConversationHeader({
  conversation,
  onFlagToggle,
}: ConversationHeaderProps) {
  const names = conversation.participants
    .map((p) => (p.role === "Host" ? `${p.name} (Host)` : p.name))
    .join(" – ");

  return (
    <div className='px-5 pt-3 pb-4 shadow-sm rounded-t-lg bg-white'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          {/* Small stacked avatars */}
          <div className='flex -space-x-2'>
            {conversation.participants.slice(0, 2).map((p) => (
              <Avatar key={p.id} className='h-7 w-7 ring-2 ring-white'>
                {p.avatar && <AvatarImage src={p.avatar} alt={p.name} />}
                <AvatarFallback className='text-[10px]'>
                  {p.initials || initialsFromName(p.name)}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div>
            <div className='text-sm font-semibold text-gray-900'>{names}</div>
            {conversation.contextSubtitle && (
              <div className='text-xs text-gray-500'>
                {conversation.contextSubtitle}
              </div>
            )}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {conversation.status === "flagged" ? (
            <Badge variant='destructive'>Flagged</Badge>
          ) : (
            <Badge variant='secondary'>Normal</Badge>
          )}
          <button
            onClick={onFlagToggle}
            className={cn(
              "inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50"
            )}
            aria-label={
              conversation.status === "flagged"
                ? "Unflag conversation"
                : "Flag conversation"
            }
          >
            <Flag className='w-4 h-4' />
          </button>
        </div>
      </div>
    </div>
  );
}
