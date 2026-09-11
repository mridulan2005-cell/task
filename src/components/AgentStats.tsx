import { useState } from 'react';
import { AGENTS, LOAD, deskPerf, perfOf, OUTCOME_LABEL, OUTCOME_NOTE, OUTCOME_SHORT } from '../data/agents';
import type { Agent, Outcome } from '../data/agents';

/* The three figures the desk actually asks of a page of agents: how many it
   runs, how many are working this second, and whether the work is coming out
   clean. Each one is a number with the shape of its own history under it, and
   each shape is a filter rather than a decoration: what you point at, the
   list and the log below narrow to. */

type Props = {
  /* null on the index, an agent when one is open: the same three cards,
     scoped to whatever is being read */
  agent: Agent | null;
  /* runs in flight right now, counted off the log so the two agree */
  live: number;
  /* runs logged in the window the activity filters are showing */
  logged: number;
  outcome: Outcome | null;
  onOutcome: (o: Outcome | null) => void;
  autonomy: string | null;
  onAutonomy: (a: string | null) => void;
};

const AUTONOMY: { id: string; label: string; note: string }[] = [
  { id: 'Bounded', label: 'Bounded', note: 'Acts inside a limit it cannot widen' },
  { id: 'Supervised', label: 'Supervised', note: 'Proposes, and waits for a person' },
  { id: 'Manual', label: 'Manual', note: 'Only a person can release what it holds' },
];

export default function AgentStats({ agent, live, logged, outcome, onOutcome, autonomy, onAutonomy }: Props) {
  const scope = agent ? [agent.id] : AGENTS.map((a) => a.id);
  const perf = deskPerf(scope);

  return (
    <div className="ag-stats">
      <CountCard agent={agent} autonomy={autonomy} onAutonomy={onAutonomy} />
      <LiveCard live={live} logged={logged} agent={agent} />
      <PerfCard perf={perf} outcome={outcome} onOutcome={onOutcome} agent={agent} />
    </div>
  );
}

/* ---------------- how many there are ---------------- */

function CountCard({
  agent,
  autonomy,
  onAutonomy,
}: {
  agent: Agent | null;
  autonomy: string | null;
  onAutonomy: (a: string | null) => void;
}) {
  const [hover, setHover] = useState<string | null>(null);

  /* An agent on its own has no mix to show, so the card says what that one
     agent is allowed to do instead. */
  const mix = AUTONOMY.map((a) => ({
    ...a,
    n: AGENTS.filter((x) => x.autonomy === a.id).length,
  }));
  const total = AGENTS.length;
  const shown = hover ?? autonomy;
  const row = mix.find((m) => m.id === shown);

  if (agent) {
    const own = AUTONOMY.find((a) => a.id === agent.autonomy)!;
    return (
      <section className="ag-stat">
        <div className="ag-stat-k">Autonomy</div>
        <div className="ag-stat-v">{agent.autonomy}</div>
        <div className="ag-stat-s">{own.note}</div>
        <div className="ag-stat-viz">
          <div className="ag-mix is-single">
            {AUTONOMY.map((a) => (
              <span key={a.id} className={`ag-mix-seg m-${a.id.toLowerCase()} ${a.id === agent.autonomy ? '' : 'is-off'}`} style={{ flex: 1 }} />
            ))}
          </div>
          <div className="ag-stat-note">{agent.files.length} files · {agent.steps.length} instructions</div>
        </div>
      </section>
    );
  }

  return (
    <section className="ag-stat">
      <div className="ag-stat-k">Agents on the desk</div>
      <div className="ag-stat-v">{total}</div>
      <div className="ag-stat-s">
        {autonomy ? `Showing the ${autonomy.toLowerCase()} ones` : 'Every one of them ran today'}
      </div>

      {/* The mix is the filter. Pointing at a band names it; taking it holds
          the list below to those agents. */}
      <div className="ag-stat-viz">
        <div className="ag-mix" onMouseLeave={() => setHover(null)}>
          {mix.map((m) => (
            <button
              key={m.id}
              className={`ag-mix-seg m-${m.id.toLowerCase()} ${autonomy && autonomy !== m.id ? 'is-off' : ''}`}
              style={{ flex: m.n }}
              onMouseEnter={() => setHover(m.id)}
              onClick={() => onAutonomy(autonomy === m.id ? null : m.id)}
              aria-label={`${m.n} ${m.label.toLowerCase()} agents`}
            />
          ))}
        </div>
        <div className="ag-stat-note">
          {row ? (
            <>
              <b>{row.n} {row.label.toLowerCase()}</b> · {row.note}
            </>
          ) : (
            mix.map((m) => `${m.n} ${m.label.toLowerCase()}`).join(' · ')
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------- how many are working ---------------- */

const W = 210;
const H = 46;

function LiveCard({ live, logged, agent }: { live: number; logged: number; agent: Agent | null }) {
  const [at, setAt] = useState<number | null>(null);

  const hi = Math.max(...LOAD.map((l) => l.n));
  const px = (i: number) => (i / (LOAD.length - 1)) * (W - 4) + 2;
  const py = (n: number) => H - 4 - (n / hi) * (H - 12);

  const line = LOAD.map((l, i) => `${i ? 'L' : 'M'} ${px(i).toFixed(1)} ${py(l.n).toFixed(1)}`).join(' ');
  const area = `${line} L ${px(LOAD.length - 1).toFixed(1)} ${H} L ${px(0).toFixed(1)} ${H} Z`;
  const point = at === null ? LOAD.length - 1 : at;

  function track(e: React.MouseEvent<SVGSVGElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * W;
    setAt(Math.max(0, Math.min(LOAD.length - 1, Math.round(((x - 2) / (W - 4)) * (LOAD.length - 1)))));
  }

  return (
    <section className="ag-stat">
      <div className="ag-stat-k">Working right now</div>
      <div className="ag-stat-v">
        {live}
        {/* the light is on only when something is actually running */}
        {live > 0 && <span className="ag-stat-live" aria-hidden="true" />}
      </div>
      <div className="ag-stat-s">
        {agent ? `${logged} runs in this window` : `${logged} runs in the window below`}
      </div>

      {/* How stacked the desk has been through the session. Reading it is
          pointing at it: the line under the chart says the hour and the count
          rather than an axis costing four lines of height. */}
      <div className="ag-stat-viz">
        <svg
          className="ag-load"
          viewBox={`0 0 ${W} ${H}`}
          onMouseMove={track}
          onMouseLeave={() => setAt(null)}
          role="img"
          aria-label="Agents running at once, through the session"
        >
          <defs>
            <linearGradient id="ag-load-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.20" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#ag-load-fill)" />
          <path d={line} fill="none" stroke="var(--accent)" strokeWidth="1.4" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          {at !== null && (
            <line x1={px(point)} y1="2" x2={px(point)} y2={H} stroke="var(--line-strong)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          )}
          <circle cx={px(point)} cy={py(LOAD[point].n)} r="2.6" fill="var(--accent)" stroke="var(--panel)" strokeWidth="1.5" />
        </svg>
        <div className="ag-stat-note">
          {at === null ? (
            <>Peak of {hi} at once, around 11:00 and 14:00</>
          ) : (
            <>
              <b>{LOAD[point].n} at once</b> · {LOAD[point].at}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------- whether the work comes out clean ---------------- */

const R = 30;
const C = 2 * Math.PI * R;
const ORDER: Outcome[] = ['clean', 'escalated', 'failed'];

function PerfCard({
  perf,
  outcome,
  onOutcome,
  agent,
}: {
  perf: ReturnType<typeof deskPerf>;
  outcome: Outcome | null;
  onOutcome: (o: Outcome | null) => void;
  agent: Agent | null;
}) {
  const [hover, setHover] = useState<Outcome | null>(null);
  const shown = hover ?? outcome;

  const total = ORDER.reduce((s, o) => s + perf.counts[o], 0) || 1;
  /* Where each arc starts is everything before it, so the three read as one
     ring rather than three circles.*/
  const slices = ORDER.map((o, i) => ({
    o,
    share: perf.counts[o] / total,
    offset: ORDER.slice(0, i).reduce((sum, k) => sum + perf.counts[k] / total, 0),
  }));

  const delta = agent ? perfOf(agent.id).delta : perf.delta;
  const centreV = shown ? `${Math.round((perf.counts[shown] / total) * 100)}%` : `${perf.rate.toFixed(1)}%`;
  const centreK = shown ? OUTCOME_SHORT[shown] : 'clean';

  return (
    <section className="ag-stat is-perf">
      <div className="ag-perf-ring">
        <svg viewBox="0 0 76 76" role="img" aria-label={`${perf.rate.toFixed(1)} percent of runs finished clean`}>
          <circle className="ag-ring-track" cx="38" cy="38" r={R} />
          {/* A zero share draws nothing rather than a dot with a round cap. */}
          {slices.filter((x) => x.share > 0).map(({ o, share, offset }) => (
            <circle
              key={o}
              className={`ag-ring-arc o-${o} ${shown && shown !== o ? 'is-dim' : ''}`}
              cx="38"
              cy="38"
              r={R}
              strokeDasharray={`${Math.max(share * C - 3, 0.01)} ${C}`}
              strokeDashoffset={-offset * C}
              onMouseEnter={() => setHover(o)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onOutcome(outcome === o ? null : o)}
            />
          ))}
        </svg>
        <div className="ag-ring-mid">
          <b>{centreV}</b>
          <span>{centreK}</span>
        </div>
      </div>

      <div className="ag-perf-read">
        <div className="ag-stat-k">Runs that finished clean</div>
        <div className="ag-stat-s">
          {total.toLocaleString()} runs last session
          <em className={delta >= 0 ? 'up' : 'down'}>
            {delta >= 0 ? '+' : ''}
            {delta.toFixed(1)} pts
          </em>
        </div>

        {/* The legend is the control. Three outcomes, and taking one holds
            the log below to the runs that ended that way. */}
        <ul className="ag-legend">
          {ORDER.map((o) => (
            <li key={o}>
              <button
                className={`${outcome === o ? 'is-on' : ''} ${shown && shown !== o ? 'is-dim' : ''}`}
                onMouseEnter={() => setHover(o)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onOutcome(outcome === o ? null : o)}
                title={OUTCOME_NOTE[o]}
              >
                <i className={`o-${o}`} />
                <span>{OUTCOME_LABEL[o]}</span>
                <em>{perf.counts[o].toLocaleString()}</em>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
