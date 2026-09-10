import { useMemo, useState } from 'react';
import LineChart from './LineChart';
import Picker from './Picker';
import {
  ACTIVITY,
  EVAL_ROWS,
  EVAL_STEPS,
  EXPOSURES,
  PROTECTION,
  RISK_ATTENTION,
  RISK_METRICS,
  RISK_STATS,
  SIM_BUCKETS,
  SIM_MEASURES,
  simSeries,
} from '../data/risk';
import type { RiskItem } from '../data/risk';
import { Alert, ArrowOut, Check, Chevron, Pencil, Send, Spark, X } from './Icons';

export default function RiskWorkspace() {
  return (
    <main className="risk">
      <StatStrip />

      <div className="risk-row">
        <Attention />
        <RiskState />
        <Protection />
      </div>

      <div className="risk-row">
        <RecentActivity />
        <Evaluation />
        <Simulation />
      </div>
    </main>
  );
}

/* ---------------- stats ---------------- */

function StatStrip() {
  return (
    <section className="card rstats">
      {RISK_STATS.map((s) => (
        <div className="rstat" key={s.label}>
          <div className="rstat-v">{s.value}</div>
          <div className="rstat-l">{s.label}</div>
          {s.delta && <div className="rstat-d up">{s.delta}</div>}
          {s.bar !== undefined && (
            <div className={`rstat-bar ${s.tone}`}>
              <i style={{ width: `${s.bar}%` }} />
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

/* ---------------- what needs your attention ---------------- */

function Attention() {
  const [done, setDone] = useState<string[]>([]);
  const items = RISK_ATTENTION.filter((i) => !done.includes(i.id));

  return (
    <section className="card attn">
      <header className="card-head">
        <div className="card-title with-count">
          What needs your attention
          <em>{items.length}</em>
        </div>
        <button className="view-all">
          View all
          <ArrowOut size={12} />
        </button>
      </header>

      <div className="attn-list">
        {items.map((it) => (
          <AttnItem key={it.id} item={it} onClose={() => setDone([...done, it.id])} />
        ))}
        {items.length === 0 && (
          <div className="empty">
            <strong>Nothing is waiting on you.</strong>
            <span>The agent is operating inside policy.</span>
          </div>
        )}
      </div>
    </section>
  );
}

function AttnItem({ item, onClose }: { item: RiskItem; onClose: () => void }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');

  return (
    <article className={`attn-item l-${item.level}`}>
      <header>
        <span className="attn-ic">
          <Alert size={13} />
        </span>
        <span className="attn-title">{item.title}</span>
        <span className={`attn-tag t-${item.level}`}>{item.tag}</span>
        <span className="attn-age">{item.age}</span>
      </header>

      <p className="attn-body">{item.body}</p>

      <dl className="attn-facts">
        {item.facts.map((f) => (
          <div key={f.k}>
            <dt>{f.k}</dt>
            <dd>
              {f.arrow && <em className="to">to</em>}
              {f.v}
            </dd>
          </div>
        ))}
      </dl>

      {editing ? (
        <div className="attn-edit">
          <div className="block-h as-label">Edit with AI</div>
          <ul className="attn-sugg">
            {item.suggestions.map((s) => (
              <li key={s}>
                <button onClick={() => setText(s)}>{s}</button>
              </li>
            ))}
          </ul>
          <div className="attn-field">
            <Spark size={14} />
            <input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && text.trim() && onClose()}
              placeholder="Describe the change you want"
            />
            <button className="attn-send" disabled={!text.trim()} onClick={() => text.trim() && onClose()} title="Send the edit">
              <Send size={14} />
            </button>
          </div>
          <button className="attn-cancel" onClick={() => setEditing(false)}>
            <X size={11} />
            Cancel
          </button>
        </div>
      ) : (
        <div className="attn-actions">
          <button className="btn-dark" onClick={onClose}>
            {item.approve}
          </button>
          <button className="btn-quiet" onClick={onClose}>
            Reject
          </button>
          <button className="btn-quiet" onClick={() => setEditing(true)}>
            <Pencil size={12} />
            Edit
          </button>
        </div>
      )}
    </article>
  );
}

/* ---------------- risk state ---------------- */

function RiskState() {
  const max = Math.max(...EXPOSURES.map((e) => e.limit));

  return (
    <section className="card rstate">
      <header className="card-head">
        <div>
          <div className="card-title">Risk state</div>
          <div className="card-sub">Current against limits</div>
        </div>
        <button className="view-all">
          View details
          <ArrowOut size={12} />
        </button>
      </header>

      <div className="rmetrics">
        {RISK_METRICS.map((m) => (
          <div className="rmetric" key={m.label}>
            <span className="rmetric-l">{m.label}</span>
            <span className="rmetric-v">{m.value}</span>
            <span className="rmetric-x">
              {m.limit}
              <i className="ok">
                <Check size={10} />
              </i>
            </span>
          </div>
        ))}
      </div>

      <div className="exp-head">
        <span className="block-h as-label">Exposure limits, % of NAV</span>
        <span className="exp-key">
          <em className="k-cur" /> Current
          <em className="k-lim" /> Limit
          <em className="k-tar" /> Target
        </span>
      </div>

      <ul className="exposures">
        {EXPOSURES.map((e) => (
          <li key={e.name}>
            <span className="exp-n">{e.name}</span>
            <span className="exp-track">
              <i className="exp-fill" style={{ width: `${(e.current / max) * 100}%` }} />
              <i className="exp-target" style={{ left: `${(e.target / max) * 100}%` }} />
              <i className="exp-limit" style={{ left: `${(e.limit / max) * 100}%` }} />
            </span>
            <span className="exp-v">{e.current}%</span>
            <span className="exp-l">{e.limit}%</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------- protection ---------------- */

function Protection() {
  const R = 52;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <section className="card protect">
      <header className="card-head">
        <div className="card-title">Risk protection today</div>
        <span className="chip">Today</span>
      </header>

      <div className="protect-figs">
        <div>
          <div className="rstat-v">1,284</div>
          <div className="rstat-l">Interventions</div>
        </div>
        <div>
          <div className="rstat-v">$18.4M</div>
          <div className="rstat-l">Estimated risk prevented</div>
        </div>
      </div>

      <div className="protect-body">
        <div className="donut">
          <svg viewBox="0 0 140 140" width="140" height="140">
            {PROTECTION.map((s) => {
              const len = (s.pct / 100) * C;
              const el = (
                <circle
                  key={s.label}
                  cx="70"
                  cy="70"
                  r={R}
                  fill="none"
                  stroke={s.tone}
                  strokeWidth="16"
                  strokeDasharray={`${len - 2} ${C - len + 2}`}
                  strokeDashoffset={-offset}
                  transform="rotate(-90 70 70)"
                />
              );
              offset += len;
              return el;
            })}
          </svg>
          <div className="donut-mid">
            <strong>1,284</strong>
            <span>Actions</span>
          </div>
        </div>

        <ul className="protect-key">
          {PROTECTION.map((s) => (
            <li key={s.label}>
              <i style={{ background: s.tone }} />
              <span className="pk-l">{s.label}</span>
              <span className="pk-v">
                {s.count} <em>({s.pct}%)</em>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <footer className="protect-foot">
        <strong>97.8% of potential breaches resolved autonomously</strong>
        <span>Keeping the portfolio within its risk limits</span>
      </footer>
    </section>
  );
}

/* ---------------- recent activity ---------------- */

function RecentActivity() {
  return (
    <section className="card ractivity">
      <header className="card-head">
        <div className="card-title">Recent agent activity</div>
        <button className="view-all">
          View all
          <ArrowOut size={12} />
        </button>
      </header>

      <ul className="ract-list">
        {ACTIVITY.map((a) => (
          <li key={a.time + a.title}>
            <span className="ract-t">{a.time}</span>
            <span className={`ract-ic s-${a.state}`}>{a.state === 'resolved' ? <Check size={11} /> : <Alert size={11} />}</span>
            <span className="ract-c">
              <span className="ract-n">{a.title}</span>
              <span className="ract-s">{a.sub}</span>
            </span>
            <span className={`ract-tag s-${a.state}`}>{a.state === 'resolved' ? 'Auto-resolved' : 'Needs review'}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------- evaluation ---------------- */

function Evaluation() {
  return (
    <section className="card reval">
      <header className="card-head">
        <div className="card-title with-mark">
          AI risk evaluation
          <span className="chip">Auto-resized</span>
        </div>
        <button className="view-all">
          View details
          <ArrowOut size={12} />
        </button>
      </header>

      <div className="reval-order">
        <span className="tick">AAPL</span>
        <span className="reval-buy">Buy 3.0%</span>
      </div>

      <ol className="reval-steps">
        {EVAL_STEPS.map((s, i) => (
          <li key={s}>
            <i>{i + 1}</i>
            {s}
          </li>
        ))}
      </ol>

      <table className="lite-table reval-table">
        <thead>
          <tr>
            <th>Risk metric</th>
            <th className="n">Before</th>
            <th className="n">Proposed</th>
            <th className="n">Adjusted</th>
            <th className="n">Limit</th>
            <th className="n" />
          </tr>
        </thead>
        <tbody>
          {EVAL_ROWS.map((r) => (
            <tr key={r.metric}>
              <td>{r.metric}</td>
              <td className="n">{r.before}</td>
              <td className="n down">{r.proposed}</td>
              <td className="n">{r.adjusted}</td>
              <td className="n muted">{r.limit}</td>
              <td className="n">
                <i className="ok">
                  <Check size={10} />
                </i>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer className="reval-rec">
        <span className="ai-mark">
          <Spark size={11} />
        </span>
        <span className="rec-t">
          <strong>Recommendation</strong>
          <span>Resize the order from 3.0% to 2.5% to stay inside the sector limit. Every risk metric then sits within tolerance.</span>
        </span>
        <span className="rec-c">
          <em>Confidence</em>
          96%
        </span>
      </footer>
    </section>
  );
}

/* ---------------- simulation ---------------- */

function Simulation() {
  const [measure, setMeasure] = useState('var');
  const [picking, setPicking] = useState(false);
  const { labels, data } = useMemo(() => simSeries(), []);
  const m = SIM_MEASURES.find((x) => x.id === measure)!;

  return (
    <section className="card rsim">
      <header className="card-head">
        <div className="card-title">Continuous risk simulation</div>
        <span className="live">
          <i />
          Live
        </span>
      </header>

      <div className="sim-top">
        <div>
          <div className="rstat-v">4,820</div>
          <div className="rstat-l">Scenarios evaluated today</div>
        </div>
        <ul className="sim-key">
          {SIM_BUCKETS.map((b) => (
            <li key={b.label}>
              <i style={{ background: b.tone }} />
              <strong>{b.count}</strong>
              {b.label} <em>({b.pct})</em>
            </li>
          ))}
        </ul>
      </div>

      <div className="sim-measure">
        <button className="src-pill" onClick={() => setPicking(!picking)}>
          {m.label}
          <em>{m.sub}</em>
          <Chevron size={12} className={picking ? '' : 'is-shut'} />
        </button>
        {picking && (
          <Picker
            items={SIM_MEASURES}
            active={measure}
            placeholder="Search measures"
            align="right"
            onPick={(id) => {
              setMeasure(id);
              setPicking(false);
            }}
            onClose={() => setPicking(false)}
          />
        )}
      </div>

      <LineChart
        labels={labels}
        series={[{ key: 'var', label: m.label, data, color: '#1d7de0', fill: true }]}
        height={148}
        format={(v) => `${v.toFixed(2)}%`}
        formatAxis={(v) => `${v.toFixed(1)}%`}
        xTicks={5}
      />
    </section>
  );
}
