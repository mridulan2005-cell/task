import { useState } from 'react';
import type { Figure, LimitRow } from '../data/figures';

/* The shape that comes back with an answer.

   It lives in a 320 pixel column beside the book, which rules out most of
   what a chart usually carries: there is no room for an axis on two sides, a
   legend in a box and a title that repeats the question. So the labels sit in
   their own column on the left, every value is printed once at the right, and
   the only moving part is the line under the chart, which says what the
   pointer is on. Four forms, one geometry between them. */

const W = 300;
const PLOT_L = 94;
const PLOT_R = 248;
const PLOT_W = PLOT_R - PLOT_L;
const ROW = 24;
const BAR = 11;

export default function AiFigure({ figure }: { figure: Figure }) {
  const [at, setAt] = useState<number | null>(null);

  return (
    <figure className="fig">
      <figcaption className="fig-h">
        <b>{figure.title}</b>
        <span>{figure.note}</span>
      </figcaption>

      {figure.kind === 'waterfall' && <Waterfall figure={figure} at={at} onAt={setAt} />}
      {figure.kind === 'spread' && <Spread figure={figure} at={at} onAt={setAt} />}
      {figure.kind === 'limits' && <Limits figure={figure} at={at} onAt={setAt} />}
      {figure.kind === 'line' && <Line figure={figure} at={at} onAt={setAt} />}

      <div className="fig-read">{readOut(figure, at)}</div>
    </figure>
  );
}

/* One line of prose per chart, which is the only thing that moves. */
function readOut(f: Figure, at: number | null) {
  if (f.kind === 'waterfall') {
    if (at === null) return `${f.steps.length - 1} drivers, ${sign(total(f.steps))} ${f.unit} between them.`;
    const s = f.steps[at];
    return s.total
      ? `${s.label}: ${sign(s.value)} ${f.unit}, everything above it added up.`
      : `${s.label} is worth ${sign(s.value)} ${f.unit} of the move, ${share(s.value, total(f.steps))} of it.`;
  }

  if (f.kind === 'spread') {
    if (at === null) return 'Ahead to the right of the line, behind to the left.';
    const r = f.rows[at];
    return `${r.value >= 0 ? 'Ahead of' : 'Behind'} ${r.label} by ${Math.abs(r.value).toFixed(1)} ${f.unit}.`;
  }

  if (f.kind === 'limits') {
    if (at === null) return `Solid is where it stands, hollow is ${f.after}. The rule is the upright mark.`;
    const r = f.rows[at];
    const over = r.now > r.cap;
    return `${r.label}: ${r.now}${f.unit} against a ${r.cap}${f.unit} rule, ${over ? 'over it now' : 'inside it'}, ${r.after}${f.unit} ${f.after}.`;
  }

  if (at === null) return `${f.points.length} marks through the session, against ${f.ref.label.toLowerCase()}.`;
  const p = f.points[at];
  return `${p.value.toFixed(1)} ${f.unit} at ${p.at}, ${(p.value - f.ref.value).toFixed(1)} above ${f.ref.label.toLowerCase()}.`;
}

const total = (steps: { value: number; total?: boolean }[]) => steps.find((s) => s.total)?.value ?? 0;
const sign = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}`;
const share = (v: number, t: number) => `${Math.round((v / t) * 100)}%`;

/* ---------------- what a move was made of ---------------- */

function Waterfall({ figure, at, onAt }: Bound<Extract<Figure, { kind: 'waterfall' }>>) {
  const t = total(figure.steps);
  const hi = t * 1.06;
  const x = (v: number) => PLOT_L + (v / hi) * PLOT_W;
  const h = figure.steps.length * ROW + 6;

  /* Each step starts where the one before it finished, which is what makes a
     waterfall read as a sum rather than as four separate bars. */
  const bars = figure.steps.map((s, i) => {
    const from = s.total
      ? 0
      : figure.steps.slice(0, i).reduce((sum, p) => (p.total ? sum : sum + p.value), 0);
    return { s, from, to: from + s.value };
  });

  return (
    <svg className="fig-svg" viewBox={`0 0 ${W} ${h}`} role="img" aria-label={figure.title}>
      {bars.map(({ s, from, to }, i) => {
        const y = i * ROW + 4;
        const on = at === i;
        const next = bars[i + 1];
        return (
          <g key={s.label} className={`fig-row ${on ? 'is-on' : ''} ${at !== null && !on ? 'is-dim' : ''}`}>
            <text className="fig-label" x="0" y={y + BAR - 1.5}>
              {s.label}
            </text>
            <rect
              className={s.total ? 'fig-bar is-total' : 'fig-bar'}
              x={x(from)}
              y={y}
              width={Math.max(x(to) - x(from), 1.5)}
              height={BAR}
              rx="2"
            />
            {next && !next.s.total && (
              <line className="fig-link" x1={x(to)} y1={y} x2={x(to)} y2={y + ROW} />
            )}
            <text className="fig-val" x={W} y={y + BAR - 1.5}>
              {sign(s.value)}
            </text>
            <rect className="fig-hit" x="0" y={y - 4} width={W} height={ROW} onMouseEnter={() => onAt(i)} onMouseLeave={() => onAt(null)} />
          </g>
        );
      })}
    </svg>
  );
}

/* ---------------- ahead of one thing, behind another ---------------- */

function Spread({ figure, at, onAt }: Bound<Extract<Figure, { kind: 'spread' }>>) {
  const hi = Math.max(...figure.rows.map((r) => Math.abs(r.value))) * 1.25;
  const mid = PLOT_L + PLOT_W / 2;
  const x = (v: number) => mid + (v / hi) * (PLOT_W / 2);
  const h = figure.rows.length * ROW + 6;

  return (
    <svg className="fig-svg" viewBox={`0 0 ${W} ${h}`} role="img" aria-label={figure.title}>
      <line className="fig-zero" x1={mid} y1="2" x2={mid} y2={h - 4} />
      {figure.rows.map((r, i) => {
        const y = i * ROW + 4;
        const on = at === i;
        const up = r.value >= 0;
        return (
          <g key={r.label} className={`fig-row ${on ? 'is-on' : ''} ${at !== null && !on ? 'is-dim' : ''}`}>
            <text className="fig-label" x="0" y={y + BAR - 1.5}>
              {r.label}
            </text>
            <rect
              className={`fig-bar ${up ? 'is-up' : 'is-down'}`}
              x={up ? mid : x(r.value)}
              y={y}
              width={Math.max(Math.abs(x(r.value) - mid), 1.5)}
              height={BAR}
              rx="2"
            />
            <text className={`fig-val ${up ? 'is-up' : 'is-down'}`} x={W} y={y + BAR - 1.5}>
              {sign(r.value)}
            </text>
            <rect className="fig-hit" x="0" y={y - 4} width={W} height={ROW} onMouseEnter={() => onAt(i)} onMouseLeave={() => onAt(null)} />
          </g>
        );
      })}
    </svg>
  );
}

/* ---------------- where a limit stands, and where it would ---------------- */

const LIMIT_ROW = 30;

/* A sector weight, a single name and a tracking error do not share an axis:
   put them on one and the smallest of them is a stub against the largest.
   What the question actually asks is how close each one is to its own rule,
   so each row is measured against its own cap and the caps line up. One
   upright mark then stands for every limit on the chart. */
const HEAD = 1.35;

function Limits({ figure, at, onAt }: Bound<Extract<Figure, { kind: 'limits' }>>) {
  const x = (v: number, cap: number) => PLOT_L + Math.min(v / (cap * HEAD), 1) * PLOT_W;
  const rule = PLOT_L + (1 / HEAD) * PLOT_W;
  const h = figure.rows.length * LIMIT_ROW + 12;

  return (
    <svg className="fig-svg" viewBox={`0 0 ${W} ${h}`} role="img" aria-label={figure.title}>
      {figure.rows.map((r: LimitRow, i) => {
        const y = i * LIMIT_ROW + 4;
        const on = at === i;
        const over = r.now > r.cap;
        return (
          <g key={r.label} className={`fig-row ${on ? 'is-on' : ''} ${at !== null && !on ? 'is-dim' : ''}`}>
            <text className="fig-label" x="0" y={y + 12}>
              {r.label}
            </text>

            <rect className="fig-track" x={PLOT_L} y={y} width={PLOT_W} height="19" rx="3" />
            <rect
              className={`fig-bar ${over ? 'is-over' : 'is-under'}`}
              x={PLOT_L}
              y={y + 1.5}
              width={Math.max(x(r.now, r.cap) - PLOT_L, 2)}
              height="7.5"
              rx="2"
            />
            <rect
              className="fig-bar is-after"
              x={PLOT_L}
              y={y + 10.5}
              width={Math.max(x(r.after, r.cap) - PLOT_L, 2)}
              height="7.5"
              rx="2"
            />

            <text className={`fig-val ${over ? 'is-down' : ''}`} x={W} y={y + 12}>
              {r.now}
              {figure.unit}
            </text>
            <rect className="fig-hit" x="0" y={y - 4} width={W} height={LIMIT_ROW} onMouseEnter={() => onAt(i)} onMouseLeave={() => onAt(null)} />
          </g>
        );
      })}

      {/* every rule, drawn once */}
      <line className="fig-cap" x1={rule} y1="1" x2={rule} y2={h - 12} />
      <text className="fig-tick is-end" x={rule + 22} y={h - 2}>
        the rule
      </text>
    </svg>
  );
}

/* ---------------- a figure through the session ---------------- */

const LH = 104;

function Line({ figure, at, onAt }: Bound<Extract<Figure, { kind: 'line' }>>) {
  const vals = figure.points.map((p) => p.value);
  const hi = Math.max(...vals);
  /* The reference is the floor of the chart rather than one more value inside
     it, because the gap between the two is the whole answer. Padding is a
     share of that gap, so the band fills the plot however far apart they
     are. */
  const gap = hi - figure.ref.value || 1;
  const lo = figure.ref.value - gap * 0.12;
  const top = hi + gap * 0.12;

  const x = (i: number) => 6 + (i / (figure.points.length - 1)) * (W - 40);
  const y = (v: number) => LH - 16 - ((v - lo) / (top - lo)) * (LH - 28);

  const line = figure.points.map((p, i) => `${i ? 'L' : 'M'} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ');
  /* the band closes on the reference, so what is shaded is the difference */
  const base = y(figure.ref.value).toFixed(1);
  const area = `${line} L ${x(figure.points.length - 1).toFixed(1)} ${base} L ${x(0).toFixed(1)} ${base} Z`;

  function track(e: React.MouseEvent<SVGSVGElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * W;
    onAt(Math.max(0, Math.min(figure.points.length - 1, Math.round(((px - 6) / (W - 40)) * (figure.points.length - 1)))));
  }

  const i = at ?? figure.points.length - 1;

  return (
    <svg
      className="fig-svg is-line"
      viewBox={`0 0 ${W} ${LH}`}
      role="img"
      aria-label={figure.title}
      onMouseMove={track}
      onMouseLeave={() => onAt(null)}
    >
      <defs>
        <linearGradient id="fig-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* what the figure is being read against, drawn once and named */}
      <line className="fig-ref" x1="6" y1={y(figure.ref.value)} x2={W - 34} y2={y(figure.ref.value)} />
      <text className="fig-ref-t" x={W} y={y(figure.ref.value) + 3.5}>
        {figure.ref.label}
      </text>

      <path d={area} fill="url(#fig-fill)" />
      <path className="fig-line" d={line} />

      {at !== null && <line className="fig-guide" x1={x(i)} y1="4" x2={x(i)} y2={LH - 14} />}
      <circle className="fig-dot" cx={x(i)} cy={y(figure.points[i].value)} r="2.8" />

      <text className="fig-tick" x="6" y={LH - 3}>
        {figure.points[0].at}
      </text>
      <text className="fig-tick is-end" x={W - 34} y={LH - 3}>
        {figure.points[figure.points.length - 1].at}
      </text>
    </svg>
  );
}

type Bound<F> = { figure: F; at: number | null; onAt: (i: number | null) => void };
