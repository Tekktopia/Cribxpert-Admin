import type { Message, Participant } from "@/types";
import { Paperclip } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  me: Participant | null;
  participantsById: Map<string, Participant>;
}

export function MessageBubble({
  message,
  me,
  participantsById,
}: MessageBubbleProps) {
  const isMe = me && message.senderId === me.id;
  const author = participantsById.get(message.senderId);

  // Colors based on Figma: my message teal primary, others light gray
  const baseClasses = "max-w-[80%] px-4 py-3 rounded-2xl text-sm";
  const meClasses = "bg-primary-600 text-white ml-auto";
  const otherClasses = "bg-slate-100 text-gray-800";

  return (
    <div
      className={`w-full flex ${isMe ? "justify-end" : "justify-start"} mb-4`}
    >
      <div>
        {message.body && (
          <div className={`${baseClasses} ${isMe ? meClasses : otherClasses}`}>
            {message.body}
          </div>
        )}
        {message.attachments && message.attachments.length > 0 && (
          <div
            className={`mt-2 border rounded-xl px-4 py-3 w-[260px] ${
              isMe ? "ml-auto" : ""
            }`}
          >
            <div className='flex items-center gap-3 text-gray-700'>
              <div className='h-9 w-9 rounded-md border flex items-center justify-center text-gray-500'>
                <Paperclip className='w-4 h-4' />
              </div>
              <div className='text-sm'>
                <div className='font-medium'>
                  {message.attachments[0].name || "Attachment"}
                </div>
                {message.attachments[0].sizeLabel && (
                  <div className='text-xs text-gray-500'>
                    {message.attachments[0].sizeLabel}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div
          className={`mt-1 text-[11px] text-gray-500 ${
            isMe ? "text-right" : ""
          }`}
        >
          {author?.name} · {/* time shown by outer container in real impl */}
          {isMe ? "You" : author?.role ?? ""}
        </div>
      </div>
    </div>
  );
}
