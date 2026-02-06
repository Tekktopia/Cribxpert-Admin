import { useEffect, useRef } from "react";

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface BarChartProps {
  data: ChartData[];
}

// Helper function to adjust color brightness
function adjustBrightness(color: string, percent: number): string {
  const num = parseInt(color.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export function BarChart({ data }: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate max value dynamically with padding
    const maxDataValue = Math.max(...data.map((item) => item.value), 1);
    // Round up to nearest nice number (10, 20, 50, 100, etc.)
    const getNiceMax = (value: number): number => {
      if (value === 0) return 10;
      const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
      const normalized = value / magnitude;
      let niceValue;
      if (normalized <= 1) niceValue = 1;
      else if (normalized <= 2) niceValue = 2;
      else if (normalized <= 5) niceValue = 5;
      else niceValue = 10;
      return niceValue * magnitude;
    };
    const maxValue = Math.max(getNiceMax(maxDataValue * 1.2), 10); // Add 20% padding, minimum 10

    // Chart dimensions
    const paddingTop = 10;
    const paddingBottom = 30;
    const paddingLeft = 40;
    const paddingRight = 20;
    const chartHeight = canvas.height - paddingTop - paddingBottom;
    const chartWidth = canvas.width - paddingLeft - paddingRight;
    const barSpacing = 16;
    const barWidth = Math.max(40, (chartWidth - barSpacing * (data.length - 1)) / data.length);

    // Draw y-axis grid lines and labels
    const ySteps = 5;
    const stepValue = maxValue / ySteps;
    const gridLines: number[] = [];
    for (let i = 0; i <= ySteps; i++) {
      gridLines.push(i * stepValue);
    }

    ctx.strokeStyle = "#e5e7eb"; // Light gray for grid lines
    ctx.fillStyle = "#6b7280"; // Gray for text
    ctx.font = "11px Inter, system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    gridLines.forEach((value) => {
      const y = paddingTop + chartHeight - (value / maxValue) * chartHeight;
      
      // Draw grid line
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(canvas.width - paddingRight, y);
      ctx.stroke();

      // Draw y-axis label
      ctx.fillText(Math.round(value).toString(), paddingLeft - 8, y);
    });

    // Draw bars with rounded corners
    data.forEach((item, index) => {
      // Calculate bar height with minimum visibility threshold
      const calculatedHeight = (item.value / maxValue) * chartHeight;
      const barHeight = item.value > 0 
        ? Math.max(calculatedHeight, 8) // Minimum 8px height for better visibility
        : 0;
      const x = paddingLeft + (barWidth + barSpacing) * index;
      const y = paddingTop + chartHeight - barHeight;

      if (item.value === 0) {
        // Draw a subtle line for zero values
        ctx.strokeStyle = "#d1d5db";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + barWidth, y);
        ctx.stroke();
        ctx.strokeStyle = "#e5e7eb"; // Reset
      } else {
        // Draw bar with rounded top corners only (bars grow from bottom)
        const radius = Math.min(4, barWidth / 2, barHeight / 2); // Don't exceed bar dimensions
        
        // Create rounded rectangle path (only top corners rounded)
        ctx.beginPath();
        // Start from top-left (after curve)
        ctx.moveTo(x + radius, y);
        // Top edge
        ctx.lineTo(x + barWidth - radius, y);
        // Top-right corner
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        // Right edge
        ctx.lineTo(x + barWidth, y + barHeight);
        // Bottom edge (sharp corners)
        ctx.lineTo(x, y + barHeight);
        // Left edge
        ctx.lineTo(x, y + radius);
        // Top-left corner
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        
        // Add subtle gradient for depth
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, item.color);
        gradient.addColorStop(1, adjustBrightness(item.color, -15));
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    });
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={192}
      className='w-full h-full'
      style={{ display: "block" }}
    ></canvas>
  );
}
