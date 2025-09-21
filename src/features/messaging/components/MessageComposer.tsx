import { useState } from "react";
import { Paperclip, Send, AlertTriangle } from "lucide-react";

interface MessageComposerProps {
  onSend: (text: string) => void;
  systemWarningMode?: boolean;
}

export function MessageComposer({
  onSend,
  systemWarningMode = false,
}: MessageComposerProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  };

  if (systemWarningMode) {
    return (
      <div className='border rounded-xl bg-amber-50 border-amber-200'>
        <div className='px-4 py-2 text-amber-700 text-sm flex items-center gap-2'>
          <AlertTriangle className='w-4 h-4' />
          <span>Send System Warning Message</span>
        </div>
        <div className='p-3'>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='Enter warning message...'
            className='w-full px-4 py-3 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white'
          />
        </div>
      </div>
    );
  }

  return (
    <div className='flex items-center gap-2 p-3 border border-gray-200 rounded-xl bg-white'>
      <button className='h-9 w-9 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center'>
        <Paperclip className='w-4 h-4' />
      </button>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='Type a message...'
        className='flex-1 px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600'
      />
      <button
        onClick={handleSend}
        className='h-9 px-4 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700'
      >
        <Send className='w-4 h-4' />
      </button>
    </div>
  );
}
