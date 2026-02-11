import { useState } from "react";
import { ChevronDown, Download, FileText } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";
import { FinancePageWrapper } from "@/components/layout/FinancePageWrapper";

// --- MOCK DATA ---
const revenueData = [
  { name: 'Jan', revenue: 45000 }, { name: 'Feb', revenue: 75000 },
  { name: 'Mar', revenue: 55000 }, { name: 'Apr', revenue: 85000 },
  { name: 'May', revenue: 45000 }, { name: 'Jun', revenue: 65000 },
  { name: 'Jul', revenue: 55000 }, { name: 'Aug', revenue: 35000 },
  { name: 'Sep', revenue: 60000 }, { name: 'Oct', revenue: 80000 },
  { name: 'Nov', revenue: 40000 }, { name: 'Dec', revenue: 55000 },
];

const weeklyPayoutData = [
  { name: 'Week 1', value: 45000 },
  { name: 'Week 2', value: 60000 },
  { name: 'Week 3', value: 40000 },
  { name: 'Week 4', value: 60000 },
];

const commissionData = [
  { name: 'Week 1', value: 25000 },
  { name: 'Week 2', value: 45000 },
  { name: 'Week 3', value: 20000 },
  { name: 'Week 4', value: 45000 },
];

const annualCommissionData = [
  { name: 'Jan', value: 35000 }, { name: 'Feb', value: 28000 },
  { name: 'Mar', value: 28000 }, { name: 'Apr', value: 55000 },
  // ... clipped for UI demo
];

const refundData = [
  { name: 'Service Issue', value: 35, color: '#0F766E' }, // Dark Teal
  { name: 'Property Issue', value: 25, color: '#EC4899' }, // Pink
  { name: 'Host Cancellation', value: 20, color: '#EF4444' }, // Red
  { name: 'Guest Cancellation', value: 15, color: '#F59E0B' }, // Amber
  { name: 'Others', value: 5, color: '#3B82F6' }, // Blue
];

export default function FinanceReports() {
  const [period, setPeriod] = useState("This Month");

  return (
    <FinancePageWrapper 
      title="Reports" 
      isPopulated={true} 
      headerComponent={
        <div className="flex justify-between items-start mb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                <p className="text-gray-500 mt-2 text-sm">
                    Manage payouts, monitor transactions, and track platform revenue
                </p>
            </div>
            
            <div className="flex gap-3">
                <div className="relative">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
                        {period}
                        <ChevronDown size={16} className="text-gray-400" />
                    </button>
                </div>
                
                <button className="flex items-center gap-2 px-4 py-2 bg-[#004D40] hover:bg-[#003d33] text-white rounded-lg text-sm font-medium shadow-sm transition-colors">
                    <FileText size={16} />
                    Generate Report
                </button>
            </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        
        {/* 1. REVENUE BREAKDOWN */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Revenue Breakdown</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData} barSize={12}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} tickFormatter={(value) => `₦${value/1000}k`} />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                            {revenueData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0D9488' : '#FCD34D'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            {/* Summary Pills */}
            <div className="flex justify-center gap-4 mt-6">
                <SummaryPill label="Total Revenue" value="₦18.5M" bg="bg-blue-50" text="text-blue-700" />
                <SummaryPill label="Average Monthly" value="₦3.1M" bg="bg-orange-50" text="text-orange-700" />
                <SummaryPill label="Growth Rate" value="+12.5%" bg="bg-teal-50" text="text-teal-700" />
            </div>
        </div>

        {/* 2. WEEKLY PAYOUT TRENDS */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Weekly Payout Trends</h3>
            <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyPayoutData} barSize={30}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} tickFormatter={(value) => `₦${value/1000}k`} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="value" fill="#0D9488" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            <div className="flex justify-center gap-4 mt-6">
                <SummaryPill label="Total Payout" value="₦2.5M" bg="bg-blue-50" text="text-blue-700" />
                <SummaryPill label="Average Weekly" value="₦593k" bg="bg-orange-50" text="text-orange-700" />
                <SummaryPill label="Pending" value="₦456k" bg="bg-teal-50" text="text-teal-700" />
            </div>
        </div>

        {/* 3. PLATFORM COMMISSION (SMALL) */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Platform Commission Earned</h3>
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={commissionData} barSize={30}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} tickFormatter={(value) => `₦${value/1000}k`} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="value" fill="#004D40" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            <div className="flex justify-center gap-4 mt-6">
                 <SummaryPill label="Total Payout" value="₦2.5M" bg="bg-blue-50" text="text-blue-700" />
                 <SummaryPill label="Average Weekly" value="₦593k" bg="bg-orange-50" text="text-orange-700" />
                 <SummaryPill label="Pending" value="₦456k" bg="bg-teal-50" text="text-teal-700" />
            </div>
        </div>

        {/* 4. REFUND CATEGORIES */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <h3 className="font-bold text-gray-900 mb-6">Refund Categories Analysis</h3>
            <div className="h-60 w-full flex items-center justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={refundData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={0}
                            dataKey="value"
                        >
                            {refundData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                            ))}
                        </Pie>
                        <Legend 
                            layout="vertical" 
                            verticalAlign="middle" 
                            align="right"
                            iconType="circle"
                            iconSize={8}
                            formatter={(value) => (
                                <span className="text-xs text-gray-600 ml-1 font-medium">{value}</span>
                            )}
                        />
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* 5. PLATFORM COMMISSION (WIDE) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Platform Commission Earned</h3>
            <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={annualCommissionData} barSize={60}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} tickFormatter={(value) => `₦${value/1000}k`} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="value" fill="#004D40" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            <div className="flex justify-center gap-6 mt-8">
                 <SummaryPill label="Total Commission" value="₦1,695M" bg="bg-blue-50" text="text-blue-700" />
                 <SummaryPill label="Commission Rate" value="15%" bg="bg-pink-50" text="text-pink-700" />
                 <SummaryPill label="Monthly Average" value="₦424k" bg="bg-orange-50" text="text-orange-700" />
                 <SummaryPill label="Growth" value="+18%" bg="bg-teal-50" text="text-teal-700" />
            </div>
        </div>

      </div>
    </FinancePageWrapper>
  );
}

// --- SUB-COMPONENT: Summary Pill ---
// Matches the "Total Revenue", "Growth Rate" cards at the bottom of charts
const SummaryPill = ({ label, value, bg, text }: { label: string, value: string, bg: string, text: string }) => (
    <div className={`px-4 py-3 rounded-lg flex flex-col items-center justify-center min-w-[100px] ${bg}`}>
        <span className="text-[10px] font-semibold text-gray-500 mb-1">{label}</span>
        <span className={`text-sm font-bold ${text}`}>{value}</span>
    </div>
);