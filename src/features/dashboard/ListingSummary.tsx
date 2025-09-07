import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { BarChart } from "./charts/BarChart";

interface ListingData {
  label: string;
  value: number;
  color: string;
}

interface ListingSummaryProps {
  listingData: ListingData[];
}

export function ListingSummary({ listingData }: ListingSummaryProps) {
  return (
    <Card className='h-full'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base font-medium'>Listing Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='h-48 mb-6'>
          <BarChart data={listingData} />
        </div>
        <div className='space-y-4 mt-2'>
          {listingData.map((item, index) => (
            <div key={index} className='flex items-center justify-between'>
              <div className='flex items-center'>
                <div
                  className='w-2 h-2 rounded-full mr-2'
                  style={{ backgroundColor: item.color }}
                />
                <span className='text-sm text-gray-700'>{item.label}</span>
              </div>
              <span className='text-sm font-medium'>{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
