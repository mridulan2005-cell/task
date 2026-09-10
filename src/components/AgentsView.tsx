import { useState } from 'react';
import { AGENTS, AGENT_EVENTS, STATE_LABEL, agentOf } from '../data/agents';
import type { Agent, AgentEvent, EventState } from '../data/agents';
import { Agents, ArrowOut, FileDash, Left, Plus, Search, SrcDoc, SrcSheet } from './Icons';
import type { Role } from './TopBar';
import type { AiContext } from '../data/ai';

type Props = {
  context: AiContext | null;
  onContext: (c: AiContext | null) => void;
  /* jump to the surface the work is actually happening on */
  onGo: (role: Role, view?: 'testbox') => void;
};

const TABS: EventState[] = ['doing', 'pending', 'done'];

export default function AgentsView({ context, onContext, onGo }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  const [q, setQ] = useState('');

  const agent = open ? agentOf(open) : null;
  const rows = AGENTS.filter((a) => `${a.name} ${a.sub}`.toLowerCase().includes(q.toLowerCase()));

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

      {agent ? (
        <AgentDetail agent={agent} onBack={() => setOpen(null)} />
      ) : (
        <ul className="ag-list">
          {rows.map((a) => (
            <li key={a.id}>
              <button className="ag-card" onClick={() => setOpen(a.id)}>
                <span className="ag-ic">
                  <Agents size={17} />
                </span>
                <span className="ag-c">
                  <span className="ag-n">{a.name}</span>
                  <span className="ag-s">{a.sub}</span>
                </span>
                <span className="ag-meta">
                  <span className={`ag-auto a-${a.autonomy.toLowerCase()}`}>{a.autonomy}</span>
                  <span className="ag-runs">{a.runs}</span>
                </span>
              </button>
            </li>
          ))}
          {rows.length === 0 && (
            <li className="empty">
              <strong>No agent matches.</strong>
              <span>Try a different word, or add one.</span>
            </li>
          )}
        </ul>
      )}

      <Activity agent={agent} context={context} onContext={onContext} onGo={onGo} />
    </main>
  );
}

/* ---------------- one agent ---------------- */

const FILE_ICON = {
  skill: FileDash,
  doc: SrcDoc,
  sheet: SrcSheet,
};

function AgentDetail({ agent, onBack }: { agent: Agent; onBack: () => void }) {
  const [tab, setTab] = useState<'steps' | 'files'>('steps');

  return (
    <section className="ag-detail">
      <button className="ag-back" onClick={onBack}>
        <Left size={14} />
        All agents
      </button>

      <div className="ag-head">
        <h2>{agent.name}</h2>
        <p>{agent.sub}</p>
      </div>

      <div className="block-h as-label">What it does</div>
      <p className="ag-does">{agent.does}</p>

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
            {agent.steps.map((s, i) => (
              <li key={s}>
                <i>{i + 1}</i>
                {s}
              </li>
            ))}
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

/* ---------------- what every agent is doing ---------------- */

function Activity({ agent, context, onContext, onGo }: Props & { agent: Agent | null }) {
  const [tab, setTab] = useState<EventState>('doing');

  const scoped = agent ? AGENT_EVENTS.filter((e) => e.agent === agent.id) : AGENT_EVENTS;
  const rows = scoped.filter((e) => e.state === tab);

  return (
    <section className="card ag-act">
      <header className="card-head">
        <div>
          <div className="card-title">Recent activity</div>
          <div className="card-sub">{agent ? `Everything ${agent.name} has run today` : 'Every agent on the desk'}</div>
        </div>
        <div className="ag-tabs">
          {TABS.map((t) => {
            const n = scoped.filter((e) => e.state === t).length;
            return (
              <button key={t} className={`ag-tab ${tab === t ? 'is-on' : ''}`} onClick={() => setTab(t)}>
                {STATE_LABEL[t]}
                {n > 0 && <em>{n}</em>}
              </button>
            );
          })}
        </div>
      </header>

      <div className="ag-act-body">
        {rows.length === 0 ? (
          <div className="empty">
            <strong>Nothing {STATE_LABEL[tab].toLowerCase()}.</strong>
            <span>{agent ? `${agent.name} has nothing in this state.` : 'The desk is clear on this one.'}</span>
          </div>
        ) : (
          <ul className="ag-events">
            {rows.map((e) => (
              <EventRow key={e.id} event={e} on={context?.id === e.id} onContext={onContext} onGo={onGo} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function EventRow({
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
  return (
    <li className={`ag-ev s-${event.state} ${on ? 'is-on' : ''}`}>
      <button className="ag-ev-main" onClick={() => onContext(on ? null : contextFor(event))}>
        <span className={`ag-dot s-${event.state}`} />
        <span className="ag-c">
          <span className="ag-ev-t">{event.title}</span>
          <span className="ag-ev-s">{event.sub}</span>
        </span>
        <span className="ag-ev-r">
          <span className="ag-ev-by">{agentOf(event.agent).name}</span>
          <span className="ag-ev-time">{event.time}</span>
        </span>
      </button>

      {event.progress !== undefined && (
        <span className="ag-ev-bar">
          <i style={{ width: `${event.progress}%` }} />
        </span>
      )}

      <div className="ag-ev-acts">
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
    </li>
  );
}

/* Picking an event hands it to the copilot, with the questions worth asking
   and the one control that matters while it is still running. */
function contextFor(e: AgentEvent): AiContext {
  const agent = agentOf(e.agent);
  const live = e.state !== 'done';

  return {
    id: e.id,
    kind: 'need',
    title: e.title,
    sub: `${agent.name} agent · ${e.time}`,
    questions: live
      ? [`Why is ${agent.name} doing this?`, 'What happens if I stop it now?', `Which instruction is it on?`]
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
