import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

interface HealthMetric {
  label: string;
  value: string;
  change: number;
  status: "good" | "warning" | "critical";
}

interface PlatformHealthProps {
  metrics: HealthMetric[];
}

export function PlatformHealth({ metrics }: PlatformHealthProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Platform Health & Logs</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {metrics.map((metric, index) => (
          <div
            key={index}
            className='flex items-center justify-between p-3 rounded-lg border'
          >
            <div>
              <p className='font-medium text-gray-900'>{metric.label}</p>
              <p className='text-sm text-gray-500'>
                {metric.change > 0 ? "+" : ""}
                {metric.change}% this session
              </p>
            </div>
            <div className='text-right'>
              <p
                className={`text-lg font-bold ${getStatusColor(metric.status)}`}
              >
                {metric.value}
              </p>
            </div>
          </div>
        ))}

        <div className='grid grid-cols-2 gap-4 pt-4 border-t'>
          <div className='text-center p-3 bg-green-50 rounded-lg'>
            <p className='text-2xl font-bold text-green-600'>99.9%</p>
            <p className='text-sm text-green-700'>Uptime</p>
          </div>
          <div className='text-center p-3 bg-blue-50 rounded-lg'>
            <p className='text-2xl font-bold text-blue-600'>1.2s</p>
            <p className='text-sm text-blue-700'>Avg Response</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
