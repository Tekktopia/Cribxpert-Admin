import { useEffect, useRef } from "react";

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: ChartData[];
}

export function DonutChart({ data }: DonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate total value
    const total = data.reduce((sum, item) => sum + item.value, 0);

    // Draw the donut chart
    let startAngle = -0.5 * Math.PI; // Start from the top
    const radius = Math.min(canvas.width, canvas.height) / 2.2;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw shadow for depth
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 6;
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)";

    data.forEach((item) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();

      ctx.fillStyle = item.color;
      ctx.fill();

      startAngle += sliceAngle;
    });

    // Reset shadow for the hole
    ctx.shadowColor = "rgba(0, 0, 0, 0)";

    // Create the donut hole
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      className='w-full h-full'
    ></canvas>
  );
}
