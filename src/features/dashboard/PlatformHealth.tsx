import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

interface PlatformMetric {
  label: string;
  value: string;
  color: string;
}

interface PlatformEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

interface PlatformHealthProps {
  metrics: PlatformMetric[];
  events: PlatformEvent[];
}

export function PlatformHealth({ metrics, events }: PlatformHealthProps) {
  return (
    <Card className='p-4 h-full'>
      <CardHeader className='pb-4 p-0'>
        <CardTitle className='text-base font-semibold'>
          Platform Health & Logs
        </CardTitle>
      </CardHeader>
      <CardContent className='p-0 mt-4'>
        {/* Metrics */}
        <div className='grid grid-cols-3 gap-4 mb-6'>
          {metrics.map((metric, index) => (
            <div
              key={index}
              className='text-center py-2 px-4 rounded-xl'
              style={{ backgroundColor: `${metric.color}20` }}
            >
              <div
                className='text-base font-semibold mb-1'
                style={{ color: metric.color }}
              >
                {metric.value}
              </div>
              <div className='text-gray-600 text-[10px]'>{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Flagged Conversations */}
        <div>
          <h3 className='font-medium text-sm text-gray-900 mb-4'>
            Flagged Conversations
          </h3>
          <div className='space-y-3'>
            {events.map((event) => (
              <div
                key={event.id}
                className='flex justify-between items-center p-4 border border-gray-100 rounded-2xl'
              >
                <div>
                  <h4 className='font-medium text-gray-900 text-sm mb-1'>
                    {event.title}
                  </h4>
                  <p className='text-gray-600 text-sm'>{event.description}</p>
                </div>
                <span className='text-xs text-gray-500'>{event.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
