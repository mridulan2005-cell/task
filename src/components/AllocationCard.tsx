import { useState } from 'react';
import { ALLOCATION } from '../data/fund';

const VIEWS = ['Sector', 'Agent', 'Region'] as const;

const BY_AGENT = [
  { label: 'Momentum', pct: 34.2, delta: 3.1, tone: '#111213' },
  { label: 'Quality', pct: 26.4, delta: -0.4, tone: '#4a5055' },
  { label: 'Value', pct: 21.7, delta: -2.2, tone: '#7d838a' },
  { label: 'Event driven', pct: 11.5, delta: 0.6, tone: '#b6bbc0' },
  { label: 'Cash', pct: 6.2, delta: 0.2, tone: '#eef0f1' },
];

const BY_REGION = [
  { label: 'North America', pct: 61.8, delta: 1.2, tone: '#111213' },
  { label: 'Europe', pct: 18.4, delta: -0.7, tone: '#5b6167' },
  { label: 'Asia ex-Japan', pct: 9.9, delta: 0.9, tone: '#969ba1' },
  { label: 'Japan', pct: 3.7, delta: -0.2, tone: '#c9cdd1' },
  { label: 'Cash', pct: 6.2, delta: 0.2, tone: '#eef0f1' },
];

export default function AllocationCard() {
  const [view, setView] = useState<(typeof VIEWS)[number]>('Sector');
  const rows = view === 'Sector' ? ALLOCATION : view === 'Agent' ? BY_AGENT : BY_REGION;

  return (
    <section className="card allocation">
      <header className="card-head">
        <div>
          <div className="card-title">Asset allocation</div>
          <div className="card-sub">Drift measured against the mandate</div>
        </div>
        <div className="seg">
          {VIEWS.map((v) => (
            <button key={v} className={`seg-b ${v === view ? 'is-on' : ''}`} onClick={() => setView(v)}>
              {v}
            </button>
          ))}
        </div>
      </header>

      <div className="alloc-bar">
        {rows.map((r) => (
          <span key={r.label} style={{ width: `${r.pct}%`, background: r.tone }} title={`${r.label} ${r.pct}%`} />
        ))}
      </div>

      <ul className="alloc-list">
        {rows.map((r) => (
          <li key={r.label}>
            <span className="dot" style={{ background: r.tone }} />
            <span className="alloc-name">{r.label}</span>
            <span className="alloc-pct">{r.pct.toFixed(1)}%</span>
            <span className={`alloc-delta ${r.delta >= 0 ? 'up' : 'down'}`}>
              {r.delta >= 0 ? '+' : ''}
              {r.delta.toFixed(1)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
