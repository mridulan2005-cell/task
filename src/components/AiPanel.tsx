import { useState } from 'react';
import { Chevron, Clip, Plus, Send, Spark, Target, X } from './Icons';
import type { Role } from './TopBar';
import type { AiContext, AiTask } from '../data/ai';

type Props = {
  tasks: AiTask[];
  nudge: string;
  role: Role;
  context: AiContext | null;
  onClearContext: () => void;
  onAsk: (quote: string, question: string) => void;
};

const ASKS: Record<Role, string[]> = {
  pm: ['What moved the book today?', 'Which limits are closest to breaching?', 'Summarise what the agents did overnight'],
  analyst: ['Reconcile the two backlog filings', 'Which ideas have no model yet?', 'Summarise what the screener found'],
  risk: ['What would a 28% tech limit do to VaR?', 'Show every rule PLTR trips', 'Which limits came closest today?'],
};

export default function AiPanel({ tasks, nudge, role, context, onClearContext, onAsk }: Props) {
  const [draft, setDraft] = useState('');
  const asks = context?.questions ?? ASKS[role];

  function send(question: string) {
    if (!question.trim()) return;
    onAsk(context ? `${context.title} — ${context.sub}` : 'the workspace', question.trim());
    setDraft('');
  }

  return (
    <aside className="ai" data-ask-exempt>
      <header className="ai-head">
        <span className="ai-title">
          What&rsquo;s on your mind?
          <i className={`ai-dot n-${nudge}`} title={nudge === 'working' ? 'Working' : nudge === 'ready' ? 'An answer is ready' : 'Idle'} />
        </span>
        <div className="ai-head-tools">
          <button className="icon-btn" title="Attach">
            <Clip />
          </button>
        </div>
      </header>

      <div className="ai-quick">
        <button>
          <Target size={15} />
          Enter fund goals
        </button>
        <button>
          <Spark size={15} />
          Input ideas
        </button>
      </div>

      <div className="ai-body">
        {context && (
          <div className={`ai-tag k-${context.kind}`}>
            <div className="ai-tag-h">
              <span className="ai-tag-k">{context.kind === 'need' ? 'Tagged decision' : 'Tagged signal'}</span>
              <button className="icon-btn" onClick={onClearContext} title="Clear">
                <X size={11} />
              </button>
            </div>
            <div className="ai-tag-t">{context.title}</div>
            <div className="ai-tag-s">{context.sub}</div>

            {context.action && (
              <div className="ai-action">
                <div className="block-h as-label">Next proposed action</div>
                <p className="ai-action-t">{context.action.text}</p>
                <p className="ai-action-d">{context.action.detail}</p>
                <div className="ai-action-b">
                  <button className="btn-dark">Approve</button>
                  <button className="btn-quiet">Adjust</button>
                </div>
              </div>
            )}
          </div>
        )}

        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} />
        ))}

        {tasks.length === 0 && !context && (
          <div className="ai-idle">
            <p>Pick a card on the left and I will work from it. Or just ask.</p>
          </div>
        )}
      </div>

      <div className="ai-sugg">
        <div className="block-h as-label">Suggested questions</div>
        <ul>
          {asks.map((a) => (
            <li key={a}>
              <button onClick={() => send(a)}>{a}</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="ai-compose">
        <button className="ai-plus" title="Add context">
          <Plus size={15} />
        </button>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(draft)}
          placeholder={context ? `Ask about ${context.title.split(' · ')[0]}` : 'Ask about the book, a name, or an agent'}
        />
        <button className="ai-send" onClick={() => send(draft)} disabled={!draft.trim()} title="Send">
          <Send />
        </button>
      </div>
    </aside>
  );
}

function TaskCard({ task }: { task: AiTask }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`ai-task s-${task.state}`}>
      <div className="ai-task-h">
        <span className="ai-task-q">{task.question}</span>
        <span className="ai-task-time">{task.asked}</span>
      </div>

      <button className={`ask-quote in-panel ${open ? 'is-open' : ''}`} onClick={() => setOpen(!open)}>
        <Chevron size={12} className={open ? '' : 'is-shut'} />
        <span className="ask-quote-t">{task.quote}</span>
      </button>

      {task.state === 'working' ? (
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
          <p className="ai-task-a">{task.answer}</p>
          <div className="ai-sources">
            {task.sources.map((s) => (
              <span className="chip" key={s}>
                {s}
              </span>
            ))}
            <span className="ai-task-took">{task.seconds}s</span>
          </div>
        </>
      )}
    </div>
  );
}
