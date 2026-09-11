import { useCallback, useEffect, useState } from 'react';
import { ArrowOut, Book, Briefcase, Chat, Check, Chevron, Corner, FileDash, History as HistoryIcon, Lock, NewChat, Pencil, Send, Spark, Target, X } from './Icons';
import Composer from './Composer';
import type { Attachment } from './Composer';
import Tasks from './Tasks';
import AiFigure from './AiFigure';
import History from './History';
import { SUGGESTED, planFor, resultFor } from '../data/tasks';
import type { Result, Schedule, Suggestion, TaskRun } from '../data/tasks';
import { clockNow } from '../data/ai';
import { RECOMMENDED, TEMPLATES } from '../data/templates';
import type { Role } from './TopBar';
import type { EdgeSkill } from '../data/edges';
import { followUpsFor } from '../data/ai';
import type { AiContext, AiTask } from '../data/ai';
import type { Ticket } from '../data/riskModels';
import Attention, { useAttention } from './Attention';
import Sources from './Sources';
import Cited from './Cited';
import NeedDetail from './NeedDetail';

type Props = {
  tasks: AiTask[];
  nudge: string;
  role: Role;
  context: AiContext | null;
  /* 'templates' turns the panel into the model shelf for the research phase */
  mode: 'chat' | 'templates';
  onClearContext: () => void;
  /* picking an item from the attention queue tags it for the copilot */
  onContext: (c: AiContext | null) => void;
  onAsk: (quote: string, question: string) => void;
  onCreateModel: () => void;
  /* opens the shareable write-up over the workspace */
  onDoc: (paras: string[]) => void;
  /* opens the analyst's workspace tab from the ideas card */
  onOpenWorkspace?: () => void;
  /* clears the thread so the panel opens on an empty chat again */
  onNewChat: () => void;
};

/* The two things each desk reaches for first. Never more than two. */
const QUICK: Record<Role, { label: string; icon: typeof Target }[]> = {
  pm: [
    { label: 'Enter fund goals', icon: Target },
    { label: 'Input ideas', icon: Spark },
  ],
  analyst: [
    { label: 'Log a new idea', icon: Spark },
    { label: 'Reconcile a source', icon: Book },
  ],
  risk: [
    { label: 'Set a limit', icon: Lock },
    { label: 'Run a stress test', icon: Target },
  ],
  trader: [
    { label: 'Stage an order', icon: Send },
    { label: 'Review execution quality', icon: Target },
  ],
};

const ASKS: Record<Role, string[]> = {
  pm: ['What moved the book today?', 'Which limits are closest to breaching?', 'Summarise what the agents did overnight'],
  analyst: ['Reconcile the two backlog filings', 'Which ideas have no model yet?', 'Summarise what the screener found'],
  risk: ['What would a 28% tech limit do to VaR?', 'Show every rule PLTR trips', 'Which limits came closest today?'],
  trader: ['Which orders are behind schedule?', 'What did we pay in spread today?', 'Where is the agent crossing the most?'],
};

let runSeq = 1;

export default function AiPanel({ tasks, nudge, role, context, mode, onClearContext, onContext, onAsk, onCreateModel, onDoc, onNewChat, onOpenWorkspace }: Props) {
  const [draft, setDraft] = useState('');
  const [files, setFiles] = useState<Attachment[]>([]);
  const [edge, setEdge] = useState<EdgeSkill | null>(null);
  const [tool, setTool] = useState<string | null>(null);
  /* The panel does two things now. The toggle in the header is the only way
     between them, and each side keeps its own draft of what it is doing. */
  const [tab, setTab] = useState<'chat' | 'tasks'>('chat');
  const [run, setRun] = useState<TaskRun | null>(null);
  const [runs, setRuns] = useState<TaskRun[]>([]);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [hist, setHist] = useState(false);
  const attn = useAttention(role);
  /* pulled out because the hook object is rebuilt each render and this one is
     not; an effect can depend on it without chasing its own tail */
  const clearAttn = attn.clear;

  /* A card that is a door closes once you have gone through it. Being on the
     hub is what settles the ideas card, however you got there: the card
     itself, the tab, or a link from the dashboard. */
  const onHub = mode === 'templates';
  useEffect(() => {
    if (onHub) clearAttn('ideas-emerged');
  }, [onHub, clearAttn]);

  /* Picking a card anywhere on the surface tags it inside the composer. */
  const tagged: Attachment | null = context
    ? {
        id: `ctx-${context.id}`,
        kind: 'text',
        label: context.title,
        tip: `${TAG_LABEL[context.kind]} · ${context.title} — ${context.sub}`,
      }
    : null;
  const attachments = tagged ? [tagged, ...files] : files;

  /* Settling an item in the chat takes it out of the queue too, so the two
     never disagree about what is still open. */
  function resolve() {
    if (context) attn.clear(context.id);
    onClearContext();
  }

  function detach(id: string) {
    if (tagged && id === tagged.id) return onClearContext();
    setFiles((f) => f.filter((x) => x.id !== id));
  }

  function send(question: string) {
    const q = question.trim();
    if (!q) return;
    /* A question with nothing tagged is a question about the book at large. It
       gets no reference line, because there is no file behind it to open. */
    const quote = context ? `${context.title} — ${context.sub}` : files[0]?.label ?? '';
    onAsk(quote, edge ? `${edge.name}: ${q}` : q);
    setDraft('');
    setFiles([]);
  }

  /* Handing a task over is one move: it starts, and the stepper replaces the
     shelf. Whatever the clock was holding rides along with it. */
  function start(title: string, subject: string, brief: string, steps: TaskRun['steps'], result: Result) {
    const next: TaskRun = {
      id: `r${runSeq++}`,
      title,
      subject,
      brief,
      steps,
      done: 0,
      started: clockNow(),
      result,
      schedule: schedule ?? undefined,
    };
    setRun(next);
    setRuns((prev) => [next, ...prev]);
    setSchedule(null);
    setDraft('');
  }

  function startSuggested(s: Suggestion) {
    start(s.title, s.subject, s.note, s.steps, s.result);
  }

  function startTyped(text: string) {
    const q = text.trim();
    if (!q) return;
    const short = q.length > 46 ? `${q.slice(0, 44)}…` : q;
    start(short, short, q, planFor(q), resultFor(q));
  }

  /* One step closes at a time, and the history list reads the same count, so
     the two never disagree about how far in it is. */
  const advance = useCallback(() => {
    setRun((r) => {
      if (!r) return r;
      const next = { ...r, done: Math.min(r.done + 1, r.steps.length) };
      setRuns((prev) => prev.map((x) => (x.id === next.id ? next : x)));
      return next;
    });
  }, []);

  function newChat() {
    setTab('chat');
    setRun(null);
    setDraft('');
    setFiles([]);
    setEdge(null);
    setTool(null);
    setHist(false);
    onNewChat();
  }

  const asks = context?.questions ?? ASKS[role];

  /* The bar both sides share: which side you are on, a fresh chat, and
     everything that has been asked before, whichever side asked it. */
  const top = (
    <div className="ai-top">
      <div className="ai-seg">
        {/* The side you are on says its name; the other is an icon
            waiting to be picked. */}
        <button className={tab === 'chat' ? 'is-on' : ''} onClick={() => setTab('chat')} title="Chat">
          <Chat size={16} />
          <span>Chat</span>
        </button>
        <button className={tab === 'tasks' ? 'is-on' : ''} onClick={() => setTab('tasks')} title="Tasks">
          <Briefcase size={16} />
          <span>Tasks</span>
        </button>
      </div>

      <div className="ai-top-acts">
        <button className="icon-btn" onClick={newChat} title="New chat">
          <NewChat size={16} />
        </button>
        <button className={`icon-btn ${hist ? 'is-on' : ''}`} onClick={() => setHist(!hist)} title="Chats and tasks">
          <HistoryIcon size={16} />
        </button>
      </div>
    </div>
  );

  const historyPane = hist ? (
    <History
      chats={tasks}
      runs={runs}
      onClose={() => setHist(false)}
      onOpenChat={() => {
        setTab('chat');
        setHist(false);
      }}
      onOpenRun={(r) => {
        setRun(r);
        setTab('tasks');
        setHist(false);
      }}
    />
  ) : null;

  /* The tasks side. It has no attention queue and no follow-ups, because
     nothing here is waiting on an answer from you. */
  if (tab === 'tasks')
    return (
      <aside className="ai is-tasks" data-ask-exempt>
        {top}
        {historyPane}

        {run && (
          <header className="ai-head">
            <span className="ai-title">
              Briefing for {run.subject}
              <i className={`ai-dot n-${run.done < run.steps.length ? 'working' : 'ready'}`} />
            </span>
            <button className="icon-btn" onClick={() => setRun(null)} title="Back to tasks">
              <X size={12} />
            </button>
          </header>
        )}

        <Tasks
          run={run}
          suggestions={SUGGESTED[role]}
          scheduled={runs.filter((r) => r.schedule)}
          onStart={startSuggested}
          onAdvance={advance}
        />

        <Composer
          value={draft}
          onChange={setDraft}
          onSend={() => startTyped(draft)}
          placeholder={run ? 'Change what this task does' : 'Describe a task to hand over'}
          attachments={files}
          onDetach={(id) => setFiles((f) => f.filter((x) => x.id !== id))}
          onAttach={(a) => setFiles((f) => [...f, ...a])}
          edge={edge}
          onEdge={setEdge}
          clock
          schedule={schedule}
          onSchedule={setSchedule}
        />
      </aside>
    );

  /* An item picked out of the queue takes the panel over, on every desk. The
     chat is still underneath it, in the composer, but the write-up is what
     you are reading until you go back. */
  if (context?.detail)
    return (
      <aside className="ai is-detail" data-ask-exempt>
        {top}
        {historyPane}

        <NeedDetail context={context} detail={context.detail} onBack={onClearContext} onTake={resolve} />

        <Composer
          value={draft}
          onChange={setDraft}
          onSend={() => send(draft)}
          placeholder="Ask about this one"
          attachments={attachments}
          onDetach={detach}
          onAttach={(a) => setFiles((f) => [...f, ...a])}
          edge={edge}
          onEdge={setEdge}
        />
      </aside>
    );

  return (
    <aside className="ai" data-ask-exempt>
      {top}
      {historyPane}

      <header className="ai-head">
        <span className="ai-title">
          {mode === 'templates' ? 'Build a model' : 'What is on your mind?'}
          <i className={`ai-dot n-${nudge}`} title={nudge === 'working' ? 'Working' : nudge === 'ready' ? 'An answer is ready' : 'Idle'} />
        </span>
      </header>

      {mode === 'templates' ? (
        <Templates context={context} onCreateModel={onCreateModel} />
      ) : (
        <>
          {context?.tools ? (
            <div className="ai-tools">
              {context.tools.map((t) => (
                <button
                  key={t.id}
                  className={`ai-tool ${tool === t.id ? 'is-on' : ''}`}
                  onClick={() => (t.id === 'summary' ? onDoc(context.summary ?? []) : setTool(tool === t.id ? null : t.id))}
                >
                  <Spark size={13} />
                  <span>
                    <strong>{t.label}</strong>
                    <em>{t.note}</em>
                  </span>
                </button>
              ))}
            </div>
          ) : context?.cta ? (
            <div className="ai-cta">
              <button className="btn-dark wide" onClick={onCreateModel}>
                <Spark size={13} />
                {context.cta.label}
              </button>
              <span className="ai-cta-n">{context.cta.note}</span>
            </div>
          ) : (
            <div className="ai-quick">
              {QUICK[role].map(({ label, icon: Icon }) => (
                <button className="btn-soft" key={label}>
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="ai-body">
            {tool === 'propose' && context?.ticket && <TradeTicket ticket={context.ticket} onClose={() => setTool(null)} />}

            {tool === 'pause' && (
              <p className="ai-paused">
                Paused. The agent has stopped on the instruction it was running and nothing further has been sent.
                <button onClick={() => setTool(null)}>Resume</button>
              </p>
            )}

            {context?.action && (
              <div className="ai-action standalone">
                {/* what was picked, then what to do about it. Neither needs
                    announcing: the order says which is which. */}
                <p className="ai-ctx-t">{context.title}</p>
                <p className="ai-ctx-s">{context.sub}</p>

                <p className="ai-action-t">{context.action.text}</p>
                <p className="ai-action-d">{context.action.detail}</p>

                <div className="ai-action-b">
                  {context.action.pending ? (
                    /* an agent is still at it, so there is nothing here to
                       approve and nothing is offered */
                    <span className="ai-action-w">
                      <i className="spin" />
                      Waiting on the agent
                    </span>
                  ) : (
                    <>
                      <button className="btn-dark" onClick={resolve}>
                        Approve
                      </button>
                      <button className="btn-quiet">Adjust</button>
                    </>
                  )}
                  {/* what the agent read to raise this, behind the same overlay
                      the answers use */}
                  <Sources sources={context.sources ?? []} />
                </div>
              </div>
            )}

            {tasks.map((t) => (
              <TaskCard key={t.id} task={t} onAsk={send} />
            ))}

            {tasks.length === 0 && <Follows asks={asks} onAsk={send} />}
          </div>
        </>
      )}

      <Attention
        intruding={attn.intruding}
        nudges={attn.nudges}
        context={context}
        onContext={onContext}
        onClear={attn.clear}
        onOpen={() => onOpenWorkspace?.()}
      />

      <Composer
        value={draft}
        onChange={setDraft}
        onSend={() => send(draft)}
        placeholder={mode === 'templates' ? 'Describe a model instead' : 'Ask about the book, a name, or an agent'}
        attachments={attachments}
        onDetach={detach}
        onAttach={(a) => setFiles((f) => [...f, ...a])}
        edge={edge}
        onEdge={setEdge}
      />
    </aside>
  );
}

const TAG_LABEL: Record<string, string> = {
  need: 'Tagged decision',
  signal: 'Tagged signal',
  model: 'On the bench',
  node: 'Selected node',
  idea: 'Tagged idea',
};

/* Follow-ups sit in the flow under whatever they follow. No box, no rail. */
function Follows({ asks, onAsk }: { asks: string[]; onAsk: (q: string) => void }) {
  return (
    <ul className="ai-follows">
      {asks.map((a) => (
        <li key={a}>
          <button onClick={() => onAsk(a)}>
            <Corner size={13} />
            <span>{a}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ---------------- the research phase shelf ---------------- */

function Templates({ context, onCreateModel }: { context: AiContext | null; onCreateModel: () => void }) {
  const [picked, setPicked] = useState<string[]>([]);
  const recommended = context ? RECOMMENDED[context.id] : undefined;

  const rows = recommended ? [...TEMPLATES].sort((a, b) => (a.id === recommended ? -1 : b.id === recommended ? 1 : 0)) : TEMPLATES;

  function toggle(id: string) {
    setPicked(picked.includes(id) ? picked.filter((p) => p !== id) : [...picked, id]);
  }

  return (
    <>
      <div className="ai-body">
        <div className="block-h as-label">Suggested models</div>
        <ul className="tpl-list in-ai">
          {rows.slice(0, 6).map((t) => (
            <li key={t.id} className={picked.includes(t.id) ? 'is-on' : ''}>
              <button className="tpl-row" onClick={() => toggle(t.id)}>
                <span className="tpl-box">
                  <span className="tpl-file">
                    <FileDash size={14} />
                  </span>
                  <span className="tpl-check">{picked.includes(t.id) ? '✓' : ''}</span>
                </span>
                <span className="tpl-name">
                  <em>Template /</em>
                  {t.name}
                </span>
                {t.id === recommended && <span className="tpl-rec">Fits</span>}
                <span className="tpl-run">{t.runtime}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* The offer only exists once there is something to build from. */}
        {picked.length > 0 && (
          <div className="tpl-cta">
            <button className="btn-soft wide" onClick={onCreateModel}>
              <Spark size={13} />
              Create model
            </button>
            <span className="tpl-cta-n">
              {picked.length} template{picked.length > 1 ? 's' : ''} selected
            </span>
          </div>
        )}
      </div>
    </>
  );
}

function TaskCard({ task, onAsk }: { task: AiTask; onAsk: (q: string) => void }) {
  const [open, setOpen] = useState(false);
  const done = task.state !== 'working';

  return (
    <div className={`ai-turn s-${task.state}`}>
      <div className="ai-prompt">
        <p className="ai-prompt-q">{task.question}</p>
        <span className="ai-prompt-time">{task.asked}</span>
      </div>

      {/* Only a question asked of something on screen carries a reference. */}
      {task.quote && (
        <>
          <div className="ai-ref">
            <span className="ai-ref-t">{task.quote}</span>
            <button className="ai-ref-open" onClick={() => setOpen(!open)}>
              open
              <ArrowOut size={11} />
            </button>
          </div>

          {open && (
            <div className="ai-ref-full">
              <Chevron size={12} />
              <span>{task.quote}</span>
            </div>
          )}
        </>
      )}

      {!done ? (
        <div className="ai-working">
          <span className="dots">
            <i />
            <i />
            <i />
          </span>
          Working through the book
        </div>
      ) : (
        <>
          <Cited className="ai-answer" text={task.answer} sources={task.sources} />
          {/* The answer carries a shape when the question had one to give. */}
          {task.figure && <AiFigure figure={task.figure} />}
          <div className="ai-sources">
            <Sources sources={task.sources} />
            <span className="ai-task-took">{task.seconds}s</span>
          </div>
          <Follows asks={followUpsFor(task.question, task.quote)} onAsk={onAsk} />
        </>
      )}
    </div>
  );
}

/* ---------------- the order the bench arrives at ---------------- */

function TradeTicket({ ticket, onClose }: { ticket: Ticket; onClose: () => void }) {
  const [taken, setTaken] = useState<string | null>(null);

  const rows: [string, string][] = [
    ['Order', `${ticket.side} ${ticket.trim}% of ${ticket.ticker}`],
    ['Notional', ticket.notional],
    ['Participation', `≤ ${ticket.participation}% of volume`],
    ['Portfolio VaR', `${ticket.varBefore.toFixed(2)}% → ${ticket.varAfter.toFixed(2)}%`],
    [`${ticket.ticker} weight`, `${ticket.weightBefore.toFixed(1)}% → ${ticket.weightAfter.toFixed(2)}%`],
  ];

  return (
    <div className="ticket">
      <div className="ticket-h">
        <span className="block-h as-label">Proposed trade</span>
        <button className="icon-btn" onClick={onClose} title="Close">
          <X size={11} />
        </button>
      </div>

      <dl className="ticket-rows">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      {ticket.breaches.length > 0 && (
        <p className="ticket-warn">Still outside policy: {ticket.breaches.join(' and ')}.</p>
      )}

      {taken ? (
        <p className="ticket-done">{taken}</p>
      ) : (
        <div className="ticket-acts">
          <button className="btn-dark" onClick={() => setTaken('Approved as proposed. Sent to the desk and written to the log.')}>
            <Check size={12} />
            Approve
          </button>
          <button className="btn-quiet" onClick={() => setTaken(`Approved at ${ticket.trim}%, overriding the agent. Written to the log.`)}>
            <Pencil size={12} />
            Override
          </button>
          <button className="btn-quiet" onClick={() => setTaken('Sent back to the agent team to re-run under tighter constraints.')}>
            <Send size={12} />
            Send back
          </button>
          <button className="btn-quiet" onClick={() => setTaken(`Manual control. Every agent is paused on ${ticket.ticker}.`)}>
            <Lock size={12} />
            Take manual
          </button>
        </div>
      )}
    </div>
  );
}
