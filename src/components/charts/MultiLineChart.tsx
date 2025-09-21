import { useEffect, useRef } from "react";

export interface SeriesPoint {
  x: string;
  y: number;
}

export interface LineSeries {
  name: string;
  color: string;
  data: SeriesPoint[];
}

interface MultiLineChartProps {
  series: LineSeries[];
  height?: number;
}

// Simple multi-line canvas chart: thin lines only (no fill, no points)
export function MultiLineChart({ series, height = 220 }: MultiLineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || series.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.clientWidth || 800;
    const cssHeight = height;
    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

  // Layout (extra space for axis labels)
  const padding = { top: 10, right: 10, bottom: 34, left: 44 };
    const w = cssWidth - padding.left - padding.right;
    const h = cssHeight - padding.top - padding.bottom;

    // Derive domain
    const pointsCount = series[0].data.length;
    let minY = 0;
    let maxY = 0;
    for (const s of series) {
      for (const p of s.data) {
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      }
    }
    // Clamp bottom to zero for bookings and add headroom
    const range = Math.max(1, maxY - Math.min(0, minY));
    const topY = maxY + range * 0.1;
    const bottomY = 0;

    const xAt = (i: number) =>
      padding.left + (i / Math.max(1, pointsCount - 1)) * w;
    const yAt = (v: number) =>
      padding.top + (1 - (v - bottomY) / (topY - bottomY)) * h;

    ctx.clearRect(0, 0, cssWidth, cssHeight);

    // Draw axes and ticks to match Figma style
    const axisColor = "#9b8afc"; // violet-ish
    const labelColor = "#6b7280"; // gray-500
    ctx.font = "12px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    // Y-axis ticks (0..niceMax)
    const niceMax = Math.ceil(topY / 10) * 10;
    const yTicks: number[] = [];
    for (let v = 10; v <= niceMax; v += 10) yTicks.push(v);

    // Y axis line
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + h);
    ctx.stroke();

    // Y ticks and labels
    yTicks.forEach((v) => {
      const y = padding.top + (1 - (v - bottomY) / (niceMax - bottomY)) * h;
      // small tick
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + 8, y);
      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      // label
      ctx.fillStyle = labelColor;
      ctx.fillText(String(v), padding.left - 10, y);
    });

    // X-axis ticks using labels from first series
    const labels = series[0].data.map((d) => d.x);
    const tickEvery = Math.max(1, Math.floor(labels.length / 10));
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    labels.forEach((lbl, i) => {
      if (i % tickEvery !== 0 && i !== labels.length - 1) return;
      const x = padding.left + (i / Math.max(1, labels.length - 1)) * w;
      const yBottom = padding.top + h;
      // bottom tick
      ctx.beginPath();
      ctx.moveTo(x, yBottom);
      ctx.lineTo(x, yBottom - 10);
      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      // label slightly below
      ctx.fillStyle = labelColor;
      ctx.fillText(lbl, x, yBottom + 18);
    });

    // Draw each series as a thin line
    for (const s of series) {
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = s.color;
      s.data.forEach((p, i) => {
        const x = xAt(i);
        const y = yAt(p.y);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
  }, [series, height]);

  return <canvas ref={canvasRef} className='w-full block' style={{ height }} />;
}
