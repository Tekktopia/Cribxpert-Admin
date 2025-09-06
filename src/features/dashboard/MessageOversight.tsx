import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

interface MessageInsight {
  sent: number;
  unread: number;
  flaggedConversations: number;
}

interface MessageOversightProps {
  insights: MessageInsight;
}

export function MessageOversight({ insights }: MessageOversightProps) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle className='text-lg'>Message Oversight</CardTitle>
        <a href='#' className='text-sm text-primary-600 hover:text-primary-700'>
          View all
        </a>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 gap-6'>
          {/* Sent Messages */}
          <div className='text-center'>
            <div className='text-3xl font-bold text-blue-600 mb-2'>
              {insights.sent}
            </div>
            <div className='text-sm text-gray-600'>Sent</div>
            <div className='text-xs text-green-600'>+5% vs last month</div>
          </div>

          {/* Unread Messages */}
          <div className='text-center'>
            <div className='text-3xl font-bold text-red-600 mb-2'>
              {insights.unread}
            </div>
            <div className='text-sm text-gray-600'>Unread</div>
            <div className='text-xs text-red-600'>High Priority</div>
          </div>
        </div>

        <div className='mt-6 space-y-3'>
          <div className='flex items-center justify-between p-3 bg-blue-50 rounded-lg'>
            <div>
              <p className='font-medium text-blue-900'>Flagged Conversations</p>
              <p className='text-sm text-blue-700'>
                Review flagged chats for policy violations
              </p>
            </div>
            <Badge variant='warning'>{insights.flaggedConversations}</Badge>
          </div>

          <div className='flex items-center justify-between p-3 bg-red-50 rounded-lg'>
            <div>
              <p className='font-medium text-red-900'>High Cens Filtered</p>
              <p className='text-sm text-red-700'>
                Content has been automatically filtered
              </p>
            </div>
            <Badge variant='destructive'>0</Badge>
          </div>

          <div className='flex items-center justify-between p-3 bg-yellow-50 rounded-lg'>
            <div>
              <p className='font-medium text-yellow-900'>
                Mark User's Prohibited
              </p>
              <p className='text-sm text-yellow-700'>
                Take action on users with policy violations
              </p>
            </div>
            <Badge variant='warning'>1</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
