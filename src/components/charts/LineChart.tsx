// File: src/components/charts/LineChart.tsx
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
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ✅ Guard: no points
    if (!Array.isArray(data) || data.length === 0) return;

    const padding = 15;
    const chartWidth = canvas.width;
    const chartHeight = canvas.height - padding * 2;

    const values = data.map((d) => Number(d.value ?? 0));
    const rawMax = Math.max(...values);
    const rawMin = Math.min(...values);

    const maxValue = rawMax * 1.2; // headroom
    const minValue = rawMin * 0.8; // bottom space

    const valueRange = maxValue - minValue;
    const denom = valueRange === 0 ? 1 : valueRange;

    const toY = (v: number) => {
      const normalized = (v - minValue) / denom;
      return chartHeight - normalized * chartHeight + padding;
    };

    // ✅ Special-case: single point (avoid division by 0 for X)
    if (data.length === 1) {
      const x = chartWidth / 2;
      const y = toY(values[0]);

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = "#2D9CDB";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      return;
    }

    const getControlPoints = (points: { x: number; y: number }[], tension = 0.3) => {
      const result: { cp1x: number; cp1y: number; cp2x: number; cp2y: number }[] = [];

      for (let i = 0; i < points.length; i++) {
        const prev = i > 0 ? points[i - 1] : points[0];
        const curr = points[i];
        const next = i < points.length - 1 ? points[i + 1] : points[points.length - 1];

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

    // Build points (safe because data.length >= 2 here)
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * chartWidth;
      const y = toY(Number(item.value ?? 0));
      return { x, y };
    });

    const controlPoints = getControlPoints(points, 0.35);

    // Draw smooth curve
    ctx.beginPath();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#38bdf8";

    ctx.moveTo(points[0].x, points[0].y);

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

    // Fill under the curve
    ctx.lineTo(chartWidth, chartHeight + padding);
    ctx.lineTo(0, chartHeight + padding);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, chartHeight + padding);
    gradient.addColorStop(0, "rgba(56, 189, 248, 0.2)");
    gradient.addColorStop(1, "rgba(56, 189, 248, 0.05)");
    ctx.fillStyle = gradient;
    ctx.fill();

    // Points (only specific indices)
    const pointsToShow = [0, 2, 4, 6];

    points.forEach((point, index) => {
      if (!pointsToShow.includes(index)) return;

      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = "#2D9CDB";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={90}
      className="w-full h-full"
    />
  );
}
