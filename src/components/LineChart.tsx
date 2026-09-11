import { useEffect, useRef, useState } from 'react';
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
import { useRegions } from './Regions';
import { X } from './Icons';

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
  /* naming the chart turns on dragging a section out of it to ask about */
  name?: string;
};

const MIN_DRAG = 8;
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

export default function LineChart({ labels, series, height = 250, format, formatAxis, xTicks = 7, name }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const chart = useRef<Chart | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const live = useRef<{ a: number; b: number } | null>(null);
  const [drag, setDrag] = useState<{ a: number; b: number } | null>(null);
  /* bands are measured off the chart, so anything that moves it redraws them */
  const [, setTick] = useState(0);
  const { regions, add, remove } = useRegions();
  const mine = name ? regions.filter((r) => r.chart === name) : [];
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
              label: (c) => `  ${c.dataset.label}   ${fmt.current(c.parsed.y ?? 0)}`,
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
    setTick((t) => t + 1);
  }, [labels, series]);

  /* The band is drawn in the wrapper, so it has to follow the plot when the
     column is resized rather than the data changing. */
  useEffect(() => {
    if (!name || !wrap.current || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setTick((t) => t + 1));
    ro.observe(wrap.current);
    return () => ro.disconnect();
  }, [name]);

  /* Everything measured in one place: x is canvas-relative, which is the
     space Chart.js reports its plot area and its scales in. */
  function geom() {
    const c = chart.current;
    const cv = canvas.current;
    const w = wrap.current;
    if (!c || !cv || !w || !c.chartArea) return null;
    const cr = cv.getBoundingClientRect();
    const wr = w.getBoundingClientRect();
    return { scale: c.scales.x, area: c.chartArea, dx: cr.left - wr.left, wr };
  }

  function down(e: React.MouseEvent) {
    if (!name || e.button !== 0) return;
    const g = geom();
    if (!g) return;
    e.preventDefault();

    const at = (clientX: number) => clamp(clientX - g.wr.left - g.dx, g.area.left, g.area.right);
    live.current = { a: at(e.clientX), b: at(e.clientX) };
    setDrag(live.current);

    const move = (ev: MouseEvent) => {
      if (!live.current) return;
      live.current = { a: live.current.a, b: at(ev.clientX) };
      setDrag(live.current);
    };

    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      const d = live.current;
      live.current = null;
      setDrag(null);
      if (!d || Math.abs(d.b - d.a) < MIN_DRAG) return;

      const lo = Math.min(d.a, d.b);
      const hi = Math.max(d.a, d.b);
      const last = labels.length - 1;
      const idx = (px: number) => clamp(Math.round(Number(g.scale.getValueForPixel(px) ?? 0)), 0, last);
      const a = idx(lo);
      const b = Math.max(idx(hi), a);

      add({
        chart: name!,
        from: labels[a],
        to: labels[b],
        points: b - a + 1,
        a,
        b,
        /* lifted clear of the band's own date label */
        anchor: { x: g.wr.left + g.dx + (lo + hi) / 2, y: g.wr.top + g.area.top - 14 },
      });
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }

  /* A stored section is kept as two indices, so it survives a resize and
     lands back over the same points. */
  function band(a: number, b: number) {
    const g = geom();
    if (!g) return null;
    const x1 = g.scale.getPixelForValue(a);
    const x2 = g.scale.getPixelForValue(b);
    const step = labels.length > 1 ? (g.area.right - g.area.left) / (labels.length - 1) : 0;
    const left = clamp(Math.min(x1, x2) - step / 2, g.area.left, g.area.right);
    const right = clamp(Math.max(x1, x2) + step / 2, g.area.left, g.area.right);
    return { left: left + g.dx, width: Math.max(right - left, 2), top: g.area.top, height: g.area.bottom - g.area.top };
  }

  const g = name ? geom() : null;

  return (
    <div className={`chart ${name ? 'is-selectable' : ''}`} style={{ height }} ref={wrap} onMouseDown={down}>
      <canvas ref={canvas} />

      {name && (
        /* Drawn over the plot but deaf to the pointer, so the tooltip still
           reads the line underneath while a section is being dragged. */
        <div className="chart-pick">
          {mine.map((r) => {
            const box = band(r.a, r.b);
            if (!box) return null;
            return (
              <div className="chart-band" key={r.id} style={box}>
                <span className="chart-band-l">
                  {r.from} – {r.to}
                </span>
                <button
                  className="chart-band-x"
                  title="Drop this section"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => remove(r.id)}
                >
                  <X size={9} />
                </button>
              </div>
            );
          })}

          {drag && g && (
            <div
              className="chart-band is-live"
              style={{
                left: Math.min(drag.a, drag.b) + g.dx,
                width: Math.abs(drag.b - drag.a),
                top: g.area.top,
                height: g.area.bottom - g.area.top,
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
