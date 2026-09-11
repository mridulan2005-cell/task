import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import {
  AGENTS,
  AGENT_EVENTS,
  DAYS,
  LIVE_RUNS,
  byNewest,
  agentOf,
  perfOf,
} from '../data/agents';
import type { Agent, AgentEvent, AgentIcon } from '../data/agents';
import { ArrowOut, Book, Chevron, FileDash, Fx, Left, Lock, Pause, Plus, Scales, Search, Send, SrcDoc, SrcSheet, Target } from './Icons';
import type { Role } from './TopBar';
import type { AiContext } from '../data/ai';
import AgentStats from './AgentStats';
import AgentActivity, { contextFor } from './AgentActivity';
import type { Filters } from './AgentActivity';

type Props = {
  context: AiContext | null;
  onContext: (c: AiContext | null) => void;
  /* jump to the surface the work is actually happening on */
  onGo: (role: Role, view?: 'testbox') => void;
};

/* One glyph per agent, picked for the work rather than for variety: the
   screener searches, compliance locks, the manager weighs. */
const AGENT_GLYPH: Record<AgentIcon, (p: { size?: number }) => ReactElement> = {
  decide: Scales,
  screen: Search,
  research: Book,
  model: Fx,
  risk: Target,
  compliance: Lock,
  execute: Send,
};

const WHOLE: Filters = { state: 'all', who: null, from: DAYS[DAYS.length - 1], to: DAYS[0], outcome: null };

export default function AgentsView({ context, onContext, onGo }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [autonomy, setAutonomy] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(WHOLE);

  const agent = open ? agentOf(open) : null;

  const rows = AGENTS.filter((a) => {
    const hit = `${a.name} ${a.sub}`.toLowerCase().includes(q.toLowerCase());
    return hit && (!autonomy || a.autonomy === autonomy);
  });

  /* Opening an agent pins the whole page to it: the figures, the log and the
     live work all narrow together rather than one of them lagging. */
  const scoped = useMemo(
    () => AGENT_EVENTS.filter((e) => (agent ? e.agent === agent.id : true)),
    [agent],
  );

  const logged = useMemo(
    () =>
      scoped
        .filter((e) => {
          if (filters.state !== 'all' && e.state !== filters.state) return false;
          if (!agent && filters.who && e.agent !== filters.who) return false;
          if (filters.outcome && e.outcome !== filters.outcome) return false;
          return e.day >= filters.from && e.day <= filters.to;
        })
        .sort(byNewest),
    [scoped, filters, agent],
  );

  const live = scoped.filter((e) => e.state === 'doing');

  return (
    <main className="canvas agents">
      <div className="ag-search">
        <label className="ag-field">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={agent ? 'Search this agent' : 'Search agents'}
          />
          <Search size={15} />
        </label>
        {!agent && (
          <button className="btn-soft">
            <Plus size={13} />
            Add
          </button>
        )}
      </div>

      <AgentStats
        agent={agent}
        live={live.length}
        logged={logged.length}
        outcome={filters.outcome}
        onOutcome={(outcome) => setFilters({ ...filters, outcome })}
        autonomy={autonomy}
        onAutonomy={setAutonomy}
      />

      {agent ? (
        <AgentDetail agent={agent} live={live} onBack={() => setOpen(null)} onGo={onGo} onContext={onContext} />
      ) : (
        <section className="ag-roster">
          <header className="ag-roster-h">
            <h3>Agents</h3>
            <span>
              {rows.length === AGENTS.length ? `${AGENTS.length} on the desk` : `${rows.length} of ${AGENTS.length}`}
              {autonomy && ` · ${autonomy.toLowerCase()}`}
            </span>
          </header>

          <ul className="ag-list">
            {rows.map((a) => (
              <AgentRow
                key={a.id}
                agent={a}
                live={AGENT_EVENTS.filter((e) => e.agent === a.id && e.state === 'doing')}
                onOpen={() => setOpen(a.id)}
                onPause={(e) => onContext(contextFor(e))}
              />
            ))}
            {rows.length === 0 && (
              <li className="empty">
                <strong>No agent matches.</strong>
                <span>Try a different word, or clear the autonomy filter.</span>
              </li>
            )}
          </ul>
        </section>
      )}

      <AgentActivity
        agent={agent}
        scoped={scoped}
        rows={logged}
        filters={filters}
        onFilters={setFilters}
        context={context}
        onContext={onContext}
        onGo={onGo}
      />
    </main>
  );
}

/* ---------------- one line of the roster ---------------- */

function AgentRow({
  agent,
  live,
  onOpen,
  onPause,
}: {
  agent: Agent;
  live: AgentEvent[];
  onOpen: () => void;
  onPause: (e: AgentEvent) => void;
}) {
  const Glyph = AGENT_GLYPH[agent.icon];
  const perf = perfOf(agent.id);

  return (
    <li>
      {/* The row opens the agent, but the live tag carries a control of its
          own, so the click target is a layer under the row rather than the
          row itself: a button inside a button is not a thing. */}
      <div className="ag-card">
        <button className="ag-open" onClick={onOpen} aria-label={`Open ${agent.name}`} />

        <span className={`ag-ic i-${agent.icon}`}>
          <Glyph size={17} />
        </span>

        <span className="ag-c">
          <span className="ag-n">
            {agent.name}
            {live.length > 0 && (
              <span className="ag-now" tabIndex={0}>
                <i />
                {live.length} running
                <LiveTip agent={agent} live={live} onPause={onPause} />
              </span>
            )}
          </span>
          <span className="ag-s">{agent.sub}</span>
        </span>

        {/* Seven sessions of work and the rate it came out clean: enough to
            see a trend break from the roster, not enough to read as a chart
            asking to be studied. */}
        <span className="ag-trend" title={`Runs per session: ${perf.recent.join(', ')}`}>
          <Bars values={perf.recent} />
        </span>

        <span className="ag-rate">
          <b>{perf.clean}%</b>
          <span>clean</span>
        </span>

        <span className="ag-meta">
          <span className={`ag-auto a-${agent.autonomy.toLowerCase()}`}>{agent.autonomy}</span>
          <span className="ag-runs">{agent.runs}</span>
        </span>

        <Chevron size={14} className="ag-go" />
      </div>
    </li>
  );
}

/* What the agent is doing, without opening it. One card per run in flight:
   where the work is, which instruction it is on, and the one control worth
   having from a list, which is stopping it. */
function LiveTip({
  agent,
  live,
  onPause,
}: {
  agent: Agent;
  live: AgentEvent[];
  onPause: (e: AgentEvent) => void;
}) {
  return (
    <span className="ag-tip" role="tooltip">
      <span className="ag-tip-k">
        {agent.name} is on {live.length === 1 ? 'one run' : `${live.length} runs`}
      </span>

      {live.map((e) => {
        const run = LIVE_RUNS[e.id];
        return (
          <span className="ag-tip-row" key={e.id}>
            <span className="ag-tip-c">
              <b>{e.title}</b>
              <em>{run ? `Instruction ${run.at} of ${agent.steps.length} · ${run.note}` : e.sub}</em>
              <small>
                On {e.where.label} · {e.time}
              </small>
            </span>
            <button
              className="ag-pause"
              onClick={(ev) => {
                ev.stopPropagation();
                onPause(e);
              }}
              title={`Pause this run of ${agent.name}`}
              aria-label={`Pause ${e.title}`}
            >
              <Pause size={13} />
            </button>
          </span>
        );
      })}
    </span>
  );
}

function Bars({ values }: { values: number[] }) {
  const hi = Math.max(...values);
  return (
    <span className="ag-bars" aria-hidden="true">
      {values.map((v, i) => (
        <i key={i} style={{ height: `${Math.max((v / hi) * 100, 12)}%` }} className={i === values.length - 1 ? 'is-last' : ''} />
      ))}
    </span>
  );
}

/* ---------------- one agent ---------------- */

const FILE_ICON = {
  skill: FileDash,
  doc: SrcDoc,
  sheet: SrcSheet,
};

function AgentDetail({
  agent,
  live,
  onBack,
  onGo,
  onContext,
}: {
  agent: Agent;
  live: AgentEvent[];
  onBack: () => void;
  onGo: (role: Role, view?: 'testbox') => void;
  onContext: (c: AiContext | null) => void;
}) {
  const [tab, setTab] = useState<'steps' | 'files'>('steps');

  /* Which instruction the agent is on, so the list of instructions can say
     so itself rather than making someone hold a number in their head. */
  const onStep = live.map((e) => LIVE_RUNS[e.id]?.at).filter(Boolean) as number[];

  return (
    <section className="ag-detail">
      <button className="ag-back" onClick={onBack}>
        <Left size={14} />
        All agents
      </button>

      <div className="ag-head">
        <span className={`ag-ic i-${agent.icon}`}>{(() => {
          const Glyph = AGENT_GLYPH[agent.icon];
          return <Glyph size={17} />;
        })()}</span>
        <div>
          <h2>{agent.name}</h2>
          <p>{agent.sub}</p>
        </div>
        <span className={`ag-auto a-${agent.autonomy.toLowerCase()}`}>{agent.autonomy}</span>
      </div>

      <div className="block-h as-label">What it does</div>
      <p className="ag-does">{agent.does}</p>

      {/* What it is doing this second, directly under what it is for. The
          two questions arrive together, so the answers do. */}
      <div className="block-h as-label">
        Doing right now
        {live.length > 0 && <em className="ag-live-n">{live.length}</em>}
      </div>

      {live.length === 0 ? (
        <div className="ag-idle">
          <span className="ag-dot s-done" />
          Nothing in flight. {agent.name} last finished a run today and is waiting on its next trigger.
        </div>
      ) : (
        <ul className="ag-live">
          {live.map((e) => {
            const run = LIVE_RUNS[e.id];
            return (
              <li key={e.id} className="ag-live-card">
                <header>
                  <span className="spin tl-spin" />
                  <div>
                    <b>{e.title}</b>
                    <span>{e.sub}</span>
                  </div>
                  <span className="ag-live-t">{e.time}</span>
                </header>

                {run && (
                  <>
                    <div className="ag-live-step">
                      Instruction {run.at} of {agent.steps.length} · {run.note}
                    </div>
                    <div className="tl-bar">
                      <i style={{ width: `${(run.at / agent.steps.length) * 100}%` }} />
                    </div>
                    <ol className="ag-live-log">
                      {run.log.map((l) => (
                        <li key={l.at}>
                          <em>{l.at}</em>
                          {l.line}
                        </li>
                      ))}
                    </ol>
                  </>
                )}

                <footer>
                  <button className="ghost-b" onClick={() => onGo(e.where.role, e.where.view)}>
                    Go to {e.where.label}
                    <ArrowOut size={11} />
                  </button>
                  <button className="ghost-b is-stop" onClick={() => onContext(contextFor(e))}>
                    Interrupt
                  </button>
                </footer>
              </li>
            );
          })}
        </ul>
      )}

      <section className="card ag-inst">
        <header className="ag-inst-h">
          <div className="ag-inst-tabs">
            <button className={tab === 'steps' ? 'is-on' : ''} onClick={() => setTab('steps')}>
              Set of instructions
            </button>
            <button className={tab === 'files' ? 'is-on' : ''} onClick={() => setTab('files')}>
              Files
              <em>{agent.files.length}</em>
            </button>
          </div>
          <button className="ghost-b">
            <Plus size={13} />
            Add
          </button>
        </header>

        {tab === 'steps' ? (
          <ol className="ag-steps">
            {agent.steps.map((s, i) => {
              const here = onStep.includes(i + 1);
              return (
                <li key={s} className={here ? 'is-live' : ''}>
                  <i>{i + 1}</i>
                  {s}
                  {here && <span className="ag-here">on this now</span>}
                </li>
              );
            })}
          </ol>
        ) : (
          <ul className="ag-files">
            {agent.files.map((f) => {
              const Icon = FILE_ICON[f.kind];
              return (
                <li key={f.id}>
                  <span className={`ag-file-ic k-${f.kind}`}>
                    <Icon size={15} />
                  </span>
                  <span className="ag-c">
                    <span className="ag-file-n">{f.name}</span>
                    <span className="ag-s">{f.meta}</span>
                  </span>
                  <button className="ghost-b">Open</button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </section>
  );
}
