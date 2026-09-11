import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { AGENTS, DAYS, LIVE_RUNS, STATE_LABEL, agentOf, dateOf, dayLabel, stampOf } from '../data/agents';
import type { Agent, AgentEvent, EventKind, EventState, Outcome } from '../data/agents';
import { Alert, ArrowOut, Book, Calendar, Check, Chevron, Lock, Scales, Send, Spark } from './Icons';
import type { Role } from './TopBar';
import type { AiContext } from '../data/ai';
import Picker from './Picker';

/* The log of everything the agents have done, read the way a person reads a
   history: one thread down the left, newest first, the day it happened called
   out once rather than on every line. */

export type Filters = {
  state: EventState | 'all';
  who: string | null;
  from: string;
  to: string;
  outcome: Outcome | null;
};

type Props = {
  /* set when one agent is open, which pins the log to that agent */
  agent: Agent | null;
  /* the whole log, already cut to the agent in view */
  scoped: AgentEvent[];
  /* what survives the filters, newest first */
  rows: AgentEvent[];
  filters: Filters;
  onFilters: (f: Filters) => void;
  context: AiContext | null;
  onContext: (c: AiContext | null) => void;
  onGo: (role: Role, view?: 'testbox') => void;
};

const STATES: (EventState | 'all')[] = ['all', 'doing', 'pending', 'done'];

/* A glyph per kind of thing that happened, so a page of the log can be read
   down the rail without reading a word of it. */
const KIND_GLYPH: Record<EventKind, (p: { size?: number }) => ReactElement> = {
  run: Spark,
  decision: Scales,
  escalation: Alert,
  block: Lock,
  fill: Check,
  note: Book,
};

/* Who did it, said the way the thing was done. */
const KIND_VERB: Record<EventKind, string> = {
  run: 'run by',
  decision: 'decided by',
  escalation: 'escalated by',
  block: 'blocked by',
  fill: 'filled by',
  note: 'noted by',
};

export default function AgentActivity({ agent, scoped, rows, filters, onFilters, context, onContext, onGo }: Props) {
  const set = (patch: Partial<Filters>) => onFilters({ ...filters, ...patch });

  /* Group into days once, here, so the list itself stays a flat render. */
  const days: { day: string; rows: AgentEvent[] }[] = [];
  for (const e of rows) {
    const last = days[days.length - 1];
    if (last && last.day === e.day) last.rows.push(e);
    else days.push({ day: e.day, rows: [e] });
  }

  const narrowed = filters.who !== null || filters.outcome !== null || filters.from !== DAYS[DAYS.length - 1] || filters.to !== DAYS[0];

  return (
    <section className="ag-act">
      <header className="ag-act-h">
        <div>
          <h3>Recent activity</h3>
          <p>
            {agent
              ? `Everything ${agent.name} has run, newest first`
              : 'Every run, decision and block on the desk, newest first'}
          </p>
        </div>

        <div className="ag-act-tools">
          {!agent && (
            <WhoFilter
              who={filters.who}
              onWho={(who) => set({ who })}
            />
          )}
          <DateRange from={filters.from} to={filters.to} onRange={(from, to) => set({ from, to })} />
        </div>
      </header>

      <div className="ag-act-bar">
        <div className="ag-tabs">
          {STATES.map((t) => {
            const n = t === 'all' ? scoped.length : scoped.filter((e) => e.state === t).length;
            return (
              <button
                key={t}
                className={`ag-tab ${filters.state === t ? 'is-on' : ''}`}
                onClick={() => set({ state: t })}
              >
                {t === 'all' ? 'All' : STATE_LABEL[t]}
                <em>{n}</em>
              </button>
            );
          })}
        </div>

        {narrowed && (
          <button
            className="ag-clear"
            onClick={() => set({ who: agent ? filters.who : null, outcome: null, from: DAYS[DAYS.length - 1], to: DAYS[0] })}
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="ag-act-body">
        {rows.length === 0 ? (
          <div className="empty">
            <strong>Nothing in this window.</strong>
            <span>
              {filters.outcome
                ? 'Runs still in flight have no outcome yet, so they sit outside this one.'
                : 'Widen the dates, or drop a filter.'}
            </span>
          </div>
        ) : (
          <ol className="tl">
            {days.map((d) => (
              <li key={d.day} className="tl-group">
                <div className="tl-day">
                  <span>{dayLabel(d.day)}</span>
                  <i />
                  <em>
                    {d.rows.length} {d.rows.length === 1 ? 'entry' : 'entries'}
                  </em>
                </div>
                <ol className="tl-rows">
                  {d.rows.map((e) => (
                    <Row
                      key={e.id}
                      event={e}
                      on={context?.id === e.id}
                      onContext={onContext}
                      onGo={onGo}
                    />
                  ))}
                </ol>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

/* ---------------- one entry ---------------- */

function Row({
  event,
  on,
  onContext,
  onGo,
}: {
  event: AgentEvent;
  on: boolean;
  onContext: (c: AiContext | null) => void;
  onGo: (role: Role, view?: 'testbox') => void;
}) {
  const Glyph = KIND_GLYPH[event.kind];
  const agent = agentOf(event.agent);
  const live = LIVE_RUNS[event.id];

  return (
    <li className={`tl-row k-${event.kind} st-${event.state} ${on ? 'is-on' : ''}`}>
      <span className={`tl-node k-${event.kind}`}>
        <Glyph size={13} />
        {event.state === 'doing' && <i className="tl-pulse" />}
      </span>

      <div className="tl-body">
        <button className="tl-main" onClick={() => onContext(on ? null : contextFor(event))}>
          <span className="tl-line">
            <span className="tl-t">{event.title}</span>
            <span className="tl-by">
              {KIND_VERB[event.kind]} <b>{agent.name}</b>
            </span>
          </span>
          <span className="tl-when">{stampOf(event)}</span>
        </button>

        <p className="tl-sub">{event.sub}</p>

        {/* A run still going carries its own small card, the way the log
            carries a task: which instruction it is on, and the last line it
            wrote. Nothing else about a live run is worth a row of height. */}
        {live && (
          <div className="tl-live">
            <div className="tl-live-h">
              <span className="spin tl-spin" />
              <b>
                Instruction {live.at} of {agent.steps.length}
              </b>
              <span>{live.note}</span>
            </div>
            <div className="tl-bar">
              <i style={{ width: `${(live.at / agent.steps.length) * 100}%` }} />
            </div>
            <div className="tl-last">
              <em>{live.log[live.log.length - 1].at}</em>
              {live.log[live.log.length - 1].line}
            </div>
          </div>
        )}

        {event.state === 'pending' && (
          <div className="tl-held">
            <span className="tl-chip is-warn">Held</span>
            <span className="tl-held-t">{event.time}</span>
            <span className="tl-held-s">
              {event.kind === 'block' ? 'Only a person can release this' : 'Waiting on a decision'}
            </span>
          </div>
        )}

        <div className="tl-acts">
          <button className="ghost-b" onClick={() => onGo(event.where.role, event.where.view)}>
            Go to {event.where.label}
            <ArrowOut size={11} />
          </button>
          {event.state !== 'done' && (
            <button className="ghost-b is-stop" onClick={() => onContext(on ? null : contextFor(event))}>
              Interrupt
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

/* ---------------- the two filters that are not tabs ---------------- */

function WhoFilter({ who, onWho }: { who: string | null; onWho: (w: string | null) => void }) {
  const [open, setOpen] = useState(false);
  const name = who ? agentOf(who).name : 'All agents';

  return (
    <div className="ag-drop">
      <button className={`ag-drop-b ${who ? 'is-set' : ''}`} onClick={() => setOpen(!open)}>
        {name}
        <Chevron size={12} />
      </button>
      {open && (
        <Picker
          align="right"
          placeholder="Search agents"
          active={who ? `agent-${who}` : undefined}
          items={AGENTS.map((a) => ({ id: `agent-${a.id}`, label: a.name, sub: a.sub }))}
          footer={who ? { label: 'Every agent', onPick: () => { onWho(null); setOpen(false); } } : undefined}
          onPick={(id) => {
            onWho(id.replace('agent-', ''));
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

/* From and to, over the days the log actually holds. A calendar would offer
   three hundred days the desk has nothing on. */
function DateRange({ from, to, onRange }: { from: string; to: string; onRange: (f: string, t: string) => void }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function away(e: MouseEvent) {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    }
    function esc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const whole = from === DAYS[DAYS.length - 1] && to === DAYS[0];
  const label = whole ? 'All dates' : from === to ? dayLabel(from) : `${dateOf(from)} → ${dateOf(to)}`;

  return (
    <div className="ag-drop" ref={wrap}>
      <button className={`ag-drop-b ${whole ? '' : 'is-set'}`} onClick={() => setOpen(!open)}>
        <Calendar size={13} />
        {label}
        <Chevron size={12} />
      </button>

      {open && (
        <div className="ag-range">
          <div className="ag-range-cols">
            <div>
              <div className="ag-range-k">From</div>
              {[...DAYS].reverse().map((d) => (
                <button
                  key={d}
                  className={d === from ? 'is-on' : ''}
                  disabled={d > to}
                  onClick={() => onRange(d, to)}
                >
                  {dayLabel(d)}
                  {dayLabel(d) !== dateOf(d) && <span>{dateOf(d)}</span>}
                </button>
              ))}
            </div>
            <div>
              <div className="ag-range-k">To</div>
              {DAYS.map((d) => (
                <button
                  key={d}
                  className={d === to ? 'is-on' : ''}
                  disabled={d < from}
                  onClick={() => onRange(from, d)}
                >
                  {dayLabel(d)}
                  {dayLabel(d) !== dateOf(d) && <span>{dateOf(d)}</span>}
                </button>
              ))}
            </div>
          </div>
          <button
            className="ag-range-all"
            onClick={() => {
              onRange(DAYS[DAYS.length - 1], DAYS[0]);
              setOpen(false);
            }}
          >
            <Send size={12} />
            Every day the log holds
          </button>
        </div>
      )}
    </div>
  );
}

/* Picking an entry hands it to the copilot, with the questions worth asking
   and the one control that matters while it is still running. */
export function contextFor(e: AgentEvent): AiContext {
  const agent = agentOf(e.agent);
  const live = e.state !== 'done';

  return {
    id: e.id,
    kind: 'need',
    title: e.title,
    sub: `${agent.name} agent · ${e.time}`,
    questions: live
      ? [`Why is ${agent.name} doing this?`, 'What happens if I stop it now?', 'Which instruction is it on?']
      : [`What did ${agent.name} conclude?`, 'Which sources did it use?', 'Should anything follow from it?'],
    ...(live
      ? {
          tools: [
            { id: 'pause', label: 'Pause this activity', note: `Stops ${agent.name} where it is and holds the work` },
          ],
        }
      : {}),
  };
}
