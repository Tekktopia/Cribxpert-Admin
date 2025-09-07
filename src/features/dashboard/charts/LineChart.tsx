import { useEffect, useRef } from "react";

interface ChartData {
  day: string;
  value: number;
}

interface LineChartProps {
  data: ChartData[];
}

export function LineChart({ data }: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate max value for scaling
    const maxValue = Math.max(...data.map((item) => item.value));
    const minValue = Math.min(...data.map((item) => item.value));
    const padding = 10;

    // Chart dimensions
    const chartWidth = canvas.width;
    const chartHeight = canvas.height - padding * 2;

    // Draw line
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#3b82f6";

    data.forEach((item, index) => {
      // Calculate x and y coordinates
      const x = (index / (data.length - 1)) * chartWidth;
      const normalizedValue =
        (item.value - minValue) / (maxValue - minValue || 1);
      const y = chartHeight - normalizedValue * chartHeight + padding;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Add a light blue fill below the line
    ctx.lineTo(chartWidth, chartHeight + padding);
    ctx.lineTo(0, chartHeight + padding);
    ctx.closePath();
    ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
    ctx.fill();

    // Draw points
    data.forEach((item, index) => {
      const x = (index / (data.length - 1)) * chartWidth;
      const normalizedValue =
        (item.value - minValue) / (maxValue - minValue || 1);
      const y = chartHeight - normalizedValue * chartHeight + padding;

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "#3b82f6";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={100}
      className='w-full h-full'
    ></canvas>
  );
}
