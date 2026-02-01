// features/finance-admin/FinanceMetricsCards.jsx
import { DollarSign, Wallet, RefreshCcw, ArrowUp, ArrowDown } from "lucide-react";

export function FinanceMetricsCards({ metrics }) {
  // Add a safety check
  if (!metrics || metrics.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => {
        // Extract the icon component from the metric
        const Icon = metric.icon;
        
        return (
          <div key={metric.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {/* Render the Icon component */}
                    {Icon && <Icon className="w-5 h-5 text-gray-600" />}
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">{metric.title}</h3>
                </div>
                
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.format === "currency" 
                      ? `$${typeof metric.value === 'number' ? metric.value.toFixed(2) : metric.value}`
                      : metric.value}
                  </p>
                  <div className={`flex items-center mt-1 ${metric.trend === "up" ? 'text-green-600' : metric.trend === "down" ? 'text-red-600' : 'text-gray-600'}`}>
                    {metric.trend === "up" && <ArrowUp className="w-4 h-4 mr-1" />}
                    {metric.trend === "down" && <ArrowDown className="w-4 h-4 mr-1" />}
                    <span className="text-sm font-medium">{metric.change}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}