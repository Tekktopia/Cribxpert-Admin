import { Card, CardContent } from "@/components/ui/card";
import { SvgIcon } from "@/components/ui/SvgIcon";
import { formatCurrencyNGN } from "@/data/financialsData";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export interface SummaryItemProps {
  id: string;
  title: string;
  value: number;
  changePct?: number;
  changeLabel?: string;
  icon: string;
}

function Trend({ pct, label }: { pct?: number; label?: string }) {
  if (pct === undefined) return null;
  const isUp = pct >= 0;
  return (
    <div className='text-xs mt-2 flex items-center gap-2'>
      <span
        className={`inline-flex items-center gap-1 font-medium ${
          isUp ? "text-green-600" : "text-red-600"
        }`}
      >
        {isUp ? (
          <ArrowUpRight className='w-3.5 h-3.5' />
        ) : (
          <ArrowDownRight className='w-3.5 h-3.5' />
        )}
        {Math.abs(pct).toFixed(1)}%
      </span>
      {label && <span className='text-gray-500'>{label}</span>}
    </div>
  );
}

export function SummaryCards({ items }: { items: SummaryItemProps[] }) {
  // Accent colors per card id to match Figma chips
  const getAccent = (id: string) => {
    switch (id) {
      case "commission":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-100",
          color: "#059669", // emerald-600
        };
      case "hostEarnings":
        return {
          bg: "bg-amber-50",
          border: "border-amber-100",
          color: "#D97706",
        };
      case "refunds":
        return {
          bg: "bg-rose-50",
          border: "border-rose-100",
          color: "#DC2626",
        };
      case "escrow":
      default:
        return {
          bg: "bg-green-50",
          border: "border-green-100",
          color: "#16A34A",
        };
    }
  };

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
      {items.map((item) => (
        <Card key={item.id} className='border-[#EDEDED]'>
          <CardContent className='p-5 flex items-start gap-4'>
            <div
              className={`shrink-0 rounded-full border ${
                getAccent(item.id).border
              } ${getAccent(item.id).bg} w-10 h-10 grid place-items-center`}
            >
              <SvgIcon
                src={item.icon}
                width={20}
                height={20}
                className='shrink-0'
                color={getAccent(item.id).color}
              />
            </div>
            <div className='flex-1'>
              <div className='text-[13px] leading-5 text-gray-600 font-medium'>
                {item.title}
              </div>
              <div className='text-[20px] leading-7 font-semibold text-gray-900 mt-1'>
                {formatCurrencyNGN(item.value)}
              </div>
              <Trend pct={item.changePct} label={item.changeLabel} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
