type Props = { values: number[]; up: boolean; w?: number; h?: number };

/* Intraday tape: no smoothing, every print kept, and a dot on the last one. */
export default function Sparkline({ values, up, w = 74, h = 26 }: Props) {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || 1;
  const px = (i: number) => (i / (values.length - 1)) * (w - 6) + 1;
  const py = (v: number) => h - 3 - ((v - lo) / span) * (h - 6);

  const d = values.map((v, i) => `${i ? 'L' : 'M'} ${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(' ');
  const tone = up ? 'var(--up)' : 'var(--down)';
  const last = values.length - 1;

  return (
    <svg className="spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <path d={d} fill="none" stroke={tone} strokeWidth="1.05" strokeLinejoin="round" shapeRendering="geometricPrecision" />
      <circle cx={px(last)} cy={py(values[last])} r="2.1" fill={tone} />
    </svg>
  );
}
