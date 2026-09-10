import { useEffect, useRef } from 'react';
import {
  CategoryScale,
  Chart,
  Filler,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import type { ChartDataset } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

export type Series = {
  key: string;
  label: string;
  data: number[];
  color: string;
  dashed?: boolean;
  fill?: boolean;
};

type Props = {
  labels: string[];
  series: Series[];
  height?: number;
  /* how a value is written in the axis and the tooltip */
  format: (v: number) => string;
  /* axis ticks can be terser than the tooltip */
  formatAxis?: (v: number) => string;
  xTicks?: number;
};

export default function LineChart({ labels, series, height = 250, format, formatAxis, xTicks = 7 }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const chart = useRef<Chart | null>(null);
  const fmt = useRef(format);
  fmt.current = format;
  const axisFmt = useRef(formatAxis ?? format);
  axisFmt.current = formatAxis ?? format;

  useEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return;

    chart.current = new Chart(ctx, {
      type: 'line',
      data: { labels: [], datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 240 },
        interaction: { mode: 'index', intersect: false },
        layout: { padding: { top: 8, right: 6, bottom: 0, left: 2 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1c1e20',
            padding: 10,
            cornerRadius: 10,
            displayColors: true,
            boxWidth: 8,
            boxHeight: 2,
            boxPadding: 5,
            titleFont: { family: 'Inter', size: 10, weight: 400 },
            titleColor: 'rgba(255,255,255,0.55)',
            bodyFont: { family: 'Inter', size: 11.5, weight: 500 },
            bodyColor: '#fff',
            callbacks: {
              label: (c) => `  ${c.dataset.label}   ${fmt.current(c.parsed.y)}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: '#b3b9c0',
              font: { family: 'Inter', size: 10 },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: xTicks,
            },
          },
          y: {
            position: 'left',
            grid: { color: '#f1f2f3' },
            border: { display: false },
            ticks: {
              color: '#b3b9c0',
              font: { family: 'Inter', size: 10 },
              maxTicksLimit: 5,
              callback: (v) => axisFmt.current(Number(v)),
            },
          },
        },
      },
    });

    return () => {
      chart.current?.destroy();
      chart.current = null;
    };
  }, [xTicks]);

  useEffect(() => {
    const c = chart.current;
    if (!c) return;

    c.data.labels = labels;
    c.data.datasets = series.map((s): ChartDataset<'line'> => {
      const ds: ChartDataset<'line'> = {
        label: s.label,
        data: s.data,
        borderColor: s.color,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: s.color,
        pointHoverBorderWidth: 2,
        tension: 0.15,
        fill: false,
      };
      if (s.dashed) ds.borderDash = [6, 4];
      if (s.fill) {
        ds.fill = 'origin';
        ds.backgroundColor = (context) => {
          const { ctx, chartArea } = context.chart;
          if (!chartArea) return 'transparent';
          const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          g.addColorStop(0, `${s.color}26`);
          g.addColorStop(1, `${s.color}00`);
          return g;
        };
      }
      return ds;
    });
    c.update();
  }, [labels, series]);

  return (
    <div className="chart" style={{ height }}>
      <canvas ref={canvas} />
    </div>
  );
}
