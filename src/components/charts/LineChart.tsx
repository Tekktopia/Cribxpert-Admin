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
    const maxValue = Math.max(...data.map((item) => item.value)) * 1.2; // Add headroom
    const minValue = Math.min(...data.map((item) => item.value)) * 0.8; // Add some bottom space
    const padding = 15; // Increased padding to match Figma

    // Chart dimensions
    const chartWidth = canvas.width;
    const chartHeight = canvas.height - padding * 2;

    // Create control points for smooth curve
    const getControlPoints = (
      points: { x: number; y: number }[],
      tension = 0.3
    ) => {
      const result = [];

      for (let i = 0; i < points.length; i++) {
        const prev = i > 0 ? points[i - 1] : points[0];
        const curr = points[i];
        const next =
          i < points.length - 1 ? points[i + 1] : points[points.length - 1];

        const dx = next.x - prev.x;
        const dy = next.y - prev.y;

        result.push({
          cp1x: curr.x - dx * tension,
          cp1y: curr.y - dy * tension,
          cp2x: curr.x + dx * tension,
          cp2y: curr.y + dy * tension,
        });
      }

      return result;
    };

    // Create points array for the curve
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * chartWidth;
      const normalizedValue =
        (item.value - minValue) / (maxValue - minValue || 1);
      const y = chartHeight - normalizedValue * chartHeight + padding;
      return { x, y };
    });

    const controlPoints = getControlPoints(points, 0.35); // Increased tension for smoother curves like in Figma

    // Draw smooth curve
    ctx.beginPath();
    ctx.lineWidth = 2.5; // Slightly thicker line to match Figma
    ctx.strokeStyle = "#38bdf8"; // Exact light blue color from Figma

    // Start from the first point
    ctx.moveTo(points[0].x, points[0].y);

    // Draw smooth curve through all points
    for (let i = 0; i < points.length - 1; i++) {
      ctx.bezierCurveTo(
        controlPoints[i].cp2x,
        controlPoints[i].cp2y,
        controlPoints[i + 1].cp1x,
        controlPoints[i + 1].cp1y,
        points[i + 1].x,
        points[i + 1].y
      );
    }

    ctx.stroke();

    // Add a light blue fill below the line
    // Continue the path to create a closed shape
    ctx.lineTo(chartWidth, chartHeight + padding);
    ctx.lineTo(0, chartHeight + padding);
    ctx.closePath();

    // Create gradient fill to match Figma
    const gradient = ctx.createLinearGradient(0, 0, 0, chartHeight + padding);
    gradient.addColorStop(0, "rgba(56, 189, 248, 0.2)"); // Light blue with opacity at top
    gradient.addColorStop(1, "rgba(56, 189, 248, 0.05)"); // Very light blue at bottom
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw points - only draw points at peaks and valleys to match Figma
    const pointsToShow = [0, 2, 4, 6]; // Show only specific points (Sunday, Tuesday, Thursday, Saturday) to match Figma

    points.forEach((point, index) => {
      if (pointsToShow.includes(index)) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI); // Point circle
        ctx.fillStyle = "#2D9CDB"; // Match exact line color
        ctx.fill();
        ctx.strokeStyle = "#ffffff"; // White border
        ctx.lineWidth = 2; // Slightly thicker border for better visibility
        ctx.stroke();
      }
    });
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={90} // Adjusted height to match Figma's proportion
      className='w-full h-full'
    ></canvas>
  );
}
