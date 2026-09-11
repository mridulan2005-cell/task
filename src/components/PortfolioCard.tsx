import { useMemo, useState } from 'react';
import LineChart from './LineChart';
import type { Series } from './LineChart';
import Picker from './Picker';
import { ArrowOut, Chevron, Filter, Plus } from './Icons';
import { BOOKS, COMPARANDS, MONITORS, NAV, POSITIONS, RANGES, RETURN, TXNS } from '../data/fund';
import type { Range } from '../data/fund';
import { CHARACTER, STEPS, labelsFor, marketPaths } from '../data/gbm';

const TABS = ['Positions', 'Transactions', 'Monitor'] as const;
type Tab = (typeof TABS)[number];

const BENCH_TONE = '#e3a008';
const COMP_TONES = ['#8a9099', '#b9bec4'];
const money = (v: number) => `$${(v / 1e6).toFixed(2)}M`;
const moneyAxis = (v: number) => `$${(v / 1e6).toFixed(0)}M`;
const MAX_COMPS = 3;

const cash = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const pct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

export default function PortfolioCard() {
  const [range, setRange] = useState<Range>('YTD');
  const [book, setBook] = useState('total');
  const [comps, setComps] = useState(['SPX', 'DJIA']);
  const [openSlot, setOpenSlot] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  /* One correlated market drives every line, all rebased to the same opening
     dollar value so the fund and its benchmarks are read on one scale. */
  const { labels, lines } = useMemo(() => {
    const years = STEPS[range] / 252;
    const start = NAV.value / (1 + RETURN[range] / 100);
    const ids = [book, ...comps];
    const targets: Record<string, number> = { [book]: RETURN[range] };
    comps.forEach((id) => (targets[id] = (CHARACTER[id]?.mu ?? 0.1) * years * 100));

    const paths = marketPaths(ids, range, start, targets);
    const b = BOOKS.find((x) => x.id === book)!;

    const out: Series[] = [{ key: b.id, label: b.label, data: paths[0], color: '#1d7de0', fill: true }];
    comps.forEach((id, i) => {
      const c = COMPARANDS.find((x) => x.id === id)!;
      out.push({ key: c.id, label: c.label, data: paths[i + 1], color: i === 0 ? BENCH_TONE : COMP_TONES[i - 1], dashed: true });
    });

    return { labels: labelsFor(range, paths[0].length), lines: out };
  }, [book, comps, range]);

  const ret = (s: Series) => (s.data[s.data.length - 1] / s.data[0] - 1) * 100;

  const free = COMPARANDS.filter((c) => !comps.includes(c.id));

  function swapComp(slot: number, id: string) {
    const next = [...comps];
    next[slot] = id;
    setComps(next);
    setOpenSlot(null);
  }

  function dropComp(slot: number) {
    setComps(comps.filter((_, i) => i !== slot));
    setOpenSlot(null);
  }

  return (
    <section className="card portfolio">
      <header className="card-head">
        <div>
          <div className="card-title">Portfolio Performance</div>
          <div className="card-sub">Rise Alpha I &middot; consolidated</div>
        </div>
        <div className="range">
          {RANGES.map((r) => (
            <button key={r} className={`range-b ${r === range ? 'is-on' : ''}`} onClick={() => setRange(r)}>
              {r}
            </button>
          ))}
        </div>
      </header>

      <div className="legend">
        <div className={`leg ${openSlot === -1 ? 'is-open' : ''}`}>
          <button className="leg-b" onClick={() => setOpenSlot(openSlot === -1 ? null : -1)}>
            <i style={{ background: lines[0].color }} />
            <span className="leg-n">{lines[0].label}</span>
            <span className={`leg-p ${ret(lines[0]) >= 0 ? 'up' : 'down'}`}>{pct(ret(lines[0]))}</span>
            <Chevron size={12} className="leg-c" />
          </button>
          {openSlot === -1 && (
            <Picker
              items={BOOKS.map((b) => ({ id: b.id, label: b.label, sub: b.sub }))}
              active={book}
              placeholder="Search books"
              onPick={(id) => {
                setBook(id);
                setOpenSlot(null);
              }}
              onClose={() => setOpenSlot(null)}
            />
          )}
        </div>

        {lines.slice(1).map((l, i) => (
          <div className={`leg ${openSlot === i ? 'is-open' : ''}`} key={l.key}>
            <button className="leg-b" onClick={() => setOpenSlot(openSlot === i ? null : i)}>
              <i className={`leg-dot ${l.dashed ? 'is-dashed' : ''}`} style={{ background: l.color }} />
              <span className="leg-n">{l.label}</span>
              <span className={`leg-p ${ret(l) >= 0 ? 'up' : 'down'}`}>{pct(ret(l))}</span>
              <Chevron size={12} className="leg-c" />
            </button>
            {openSlot === i && (
              <Picker
                items={free.map((c) => ({ id: c.id, label: c.label, sub: c.sub }))}
                active={l.key}
                placeholder="Search tickers"
                footer={{ label: 'Remove this comparison', onPick: () => dropComp(i) }}
                onPick={(id) => swapComp(i, id)}
                onClose={() => setOpenSlot(null)}
              />
            )}
          </div>
        ))}

        {comps.length < MAX_COMPS && (
          <div className={`leg leg-add ${adding ? 'is-open' : ''}`}>
            <button className="leg-b" onClick={() => setAdding(!adding)}>
              <Plus size={13} />
              Compare
            </button>
            {adding && (
              <Picker
                items={free.map((c) => ({ id: c.id, label: c.label, sub: c.sub }))}
                placeholder="Search tickers"
                onPick={(id) => {
                  setComps([...comps, id]);
                  setAdding(false);
                }}
                onClose={() => setAdding(false)}
              />
            )}
          </div>
        )}
      </div>

      <LineChart labels={labels} series={lines} height={252} format={money} formatAxis={moneyAxis} name="Portfolio performance" />

    </section>
  );
}

/* The tabs sit under the chart on the page ground, not inside the card. */
export function PortfolioTabs() {
  const [tab, setTab] = useState<Tab>('Positions');

  return (
    <section className="pm-tabs">
      <div className="tabbar">
        <div className="tabs">
          {TABS.map((t) => (
            <button key={t} className={`tab ${t === tab ? 'is-on' : ''}`} onClick={() => setTab(t)}>
              {t}
              <em>{t === 'Positions' ? POSITIONS.length : t === 'Transactions' ? TXNS.length : MONITORS.length}</em>
            </button>
          ))}
        </div>
        <div className="tabbar-tools">
          <button className="ghost-b">
            <Filter />
            Filter
          </button>
          <button className="ghost-b">
            Open full
            <ArrowOut />
          </button>
        </div>
      </div>

      <div className="tablewrap">
        {tab === 'Positions' && <Positions />}
        {tab === 'Transactions' && <Transactions />}
        {tab === 'Monitor' && <MonitorList />}
      </div>
    </section>
  );
}

function Positions() {
  return (
    <table className="grid-table">
      <thead>
        <tr>
          <th>Position</th>
          <th>Owner</th>
          <th className="n">Qty</th>
          <th className="n">Price</th>
          <th className="n">Weight</th>
          <th className="n">Day</th>
          <th className="n">Unrealised</th>
        </tr>
      </thead>
      <tbody>
        {POSITIONS.map((p) => (
          <tr key={p.ticker}>
            <td>
              <div className="tick">{p.ticker}</div>
              <div className="sub">{p.name}</div>
            </td>
            <td>
              <span className="chip">{p.agent}</span>
            </td>
            <td className="n">{p.qty.toLocaleString()}</td>
            <td className="n">{p.price.toFixed(2)}</td>
            <td className="n">
              <div className="wcell">
                <span>{p.weight.toFixed(1)}%</span>
                <i style={{ width: `${(p.weight / 10) * 100}%` }} />
              </div>
            </td>
            <td className={`n ${p.dayPct >= 0 ? 'up' : 'down'}`}>{pct(p.dayPct)}</td>
            <td className={`n ${p.pnl >= 0 ? 'up' : 'down'}`}>
              {p.pnl >= 0 ? '+' : '-'}
              {cash(Math.abs(p.pnl))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Transactions() {
  return (
    <table className="grid-table">
      <thead>
        <tr>
          <th>Time</th>
          <th>Order</th>
          <th>Raised by</th>
          <th className="n">Qty</th>
          <th className="n">Price</th>
          <th className="n">Notional</th>
          <th className="n">Status</th>
        </tr>
      </thead>
      <tbody>
        {TXNS.map((t) => (
          <tr key={t.id}>
            <td>
              <div className="tick mono">{t.time}</div>
              <div className="sub">{t.id}</div>
            </td>
            <td>
              <span className={`side ${t.side === 'BUY' ? 'buy' : 'sell'}`}>{t.side}</span>
              <span className="tick inline">{t.ticker}</span>
            </td>
            <td>
              <span className="chip">{t.agent}</span>
            </td>
            <td className="n">{t.qty.toLocaleString()}</td>
            <td className="n">{t.price.toFixed(2)}</td>
            <td className="n">{cash(t.qty * t.price)}</td>
            <td className="n">
              <span className={`status s-${t.status.toLowerCase()}`}>{t.status}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MonitorList() {
  return (
    <ul className="monitors">
      {MONITORS.map((m) => (
        <li key={m.name} className={`monitor m-${m.state}`}>
          <div className="monitor-l">
            <span className="monitor-name">{m.name}</span>
            <span className="chip">{m.agent}</span>
          </div>
          <div className="monitor-bar">
            <i style={{ width: `${Math.min(m.pct, 100)}%` }} />
          </div>
          <div className="monitor-r">
            <span className="monitor-v">{m.value}</span>
            <span className="monitor-lim">of {m.limit}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
