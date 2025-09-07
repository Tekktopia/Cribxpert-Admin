import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

interface FlaggedConversation {
  id: string;
  participants: string;
  message: string;
  reason: string;
  timestamp: string;
  priority: "High" | "Medium" | "Low";
}

interface MessageOversightProps {
  messages: {
    todayCount: number;
    unreadReports: number;
    flaggedConversations: FlaggedConversation[];
  };
}

export function MessageOversight({ messages }: MessageOversightProps) {
  return (
    <Card className='p-4'>
      <CardHeader className='pb-4 p-0'>
        <div className='flex justify-between items-center'>
          <CardTitle className='text-base font-semibold pb-4'>
            Message Oversight
          </CardTitle>
          <a href='#' className='text-sm text-green-600 pb-4 font-medium'>
            View all
          </a>
        </div>
      </CardHeader>
      <CardContent className='p-0'>
        <div className='grid grid-cols-2 gap-4 mb-6'>
          {/* Messages Today */}
          <div className='bg-blue-50 rounded-xl p-4 text-center'>
            <div className='text-blue-600 text-base font-semibold'>
              {messages.todayCount}
            </div>
            <div className='text-gray-600 text-[10px]'>Messages Today</div>
          </div>

          {/* Unread Reports */}
          <div className='bg-red-50 rounded-xl p-4 text-center'>
            <div className='text-red-500 text-base font-semibold'>
              {messages.unreadReports}
            </div>
            <div className='text-gray-600 text-[10px]'>Unread Reports</div>
          </div>
        </div>

        <div className='mt-4'>
          <h3 className='font-medium text-sm text-gray-900 mb-2'>
            Flagged Conversations
          </h3>
          <div className='space-y-2'>
            {messages.flaggedConversations.map((conversation) => (
              <Card key={conversation.id} className='text-[10px] p-4 py-2'>
                <div className='flex justify-between items-center'>
                  <span className='font-medium text-gray-900 text-sm'>
                    {conversation.participants}
                  </span>
                  <Badge
                    className={`${
                      conversation.priority === "High"
                        ? "bg-red-50 text-red-600"
                        : conversation.priority === "Medium"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-green-50 text-green-600"
                    } border-0 hover:bg-opacity-100 px-4 py-1 rounded-md font-normal`}
                  >
                    {conversation.priority}
                  </Badge>
                </div>
                <p className='text-gray-600 text-sm'>
                  "{conversation.message}"
                </p>
                <div className='flex justify-between items-center'>
                  <span className='text-xs text-gray-500'>
                    {conversation.reason}
                  </span>
                  <span className='text-xs text-gray-500'>
                    {conversation.timestamp}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
