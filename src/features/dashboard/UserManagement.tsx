// src/features/dashboard/UserManagement.tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { DonutChart } from "../../components/charts/DonutChart";

interface UserData {
  label: string;
  value: number;
  color: string;
}

interface UserManagementProps {
  userData: UserData[];
}

export function UserManagement({ userData }: UserManagementProps) {
  const total = userData.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="p-5 h-full rounded-2xl">
      <CardHeader className="p-0 pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold">
            User Management
          </CardTitle>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 leading-tight">
              {total.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">total users</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Donut chart */}
        <div className="w-36 h-36 mx-auto mb-5">
          <DonutChart data={userData} />
        </div>

        {/* Legend with progress bars */}
        <div className="space-y-3">
          {userData.map((item) => {
            const pct =
              total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: item.color }}
                    />
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400">{pct}%</span>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                      {item.value.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: `${pct}%`, background: item.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
