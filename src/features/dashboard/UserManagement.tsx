import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { DonutChart } from "./charts/DonutChart";

interface UserData {
  label: string;
  value: number;
  color: string;
}

interface UserManagementProps {
  userData: UserData[];
}

export function UserManagement({ userData }: UserManagementProps) {
  return (
    <Card className="p-4 h-full flex flex-col justify-between">
      <CardHeader className='p-0 pb-4'>
        <CardTitle className='text-base font-semibold'>User Management</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex h-full flex-col justify-between">
        <div className='space-y-6'>
          <div className='w-48 h-48 mx-auto my-3'>
            <DonutChart data={userData} />
          </div>
          <div className='w-full space-y-6'>
            {userData.map((item, index) => (
              <div key={index} className='flex items-center justify-between'>
                <div className='flex items-center'>
                  <div
                    className='w-3 h-3 rounded-full mr-2'
                    style={{ backgroundColor: item.color }}
                  />
                  <span className='text-sm text-gray-700'>{item.label}</span>
                </div>
                <span className='text-sm font-medium'>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
