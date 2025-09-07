import { useEffect, useRef } from "react";

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface BarChartProps {
  data: ChartData[];
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

    // Calculate max value for scaling with some headroom
    const maxValue = 80; // Fixed max value to match design

    // Chart dimensions
    const chartHeight = canvas.height - 40; // Leave space for labels and values
    const barSpacing = 20; // Space between bars - adjusted to match Figma
    const barWidth = 60; // Fixed bar width to match Figma design

    // Draw y-axis labels/grid lines
    const yLabels = [0, 20, 40, 60, 80]; // Fixed labels to match design

    ctx.strokeStyle = "#f3f4f6"; // Very light gray
    ctx.fillStyle = "#9ca3af"; // Text color
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";

    yLabels.forEach((value) => {
      const y = canvas.height - (value / maxValue) * chartHeight - 20;

      // Draw y-axis label
      ctx.fillText(value.toString(), 0, y + 3);
    });

    // Draw bars
    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * chartHeight;
      const x = 30 + (barWidth + barSpacing) * index; // Adjusted to match Figma spacing
      const y = canvas.height - barHeight - 20; // Leave space at bottom

      // Draw bar
      ctx.fillStyle = item.color;
      ctx.fillRect(x, y, barWidth, barHeight);
    });
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={170}
      className='w-full h-full'
    ></canvas>
  );
}
