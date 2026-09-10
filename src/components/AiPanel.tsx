import { useState } from 'react';
import { Chevron, Clip, Send, Spark } from './Icons';
import type { Role } from './TopBar';
import type { AiTask } from '../data/ai';

type Props = { tasks: AiTask[]; nudge: string; role: Role };

const BRIEF: Record<Role, { title: string; lead: string; body: string; asks: string[] }> = {
  pm: {
    title: 'Fund copilot',
    lead: 'Your morning report is ready, as usual.',
    body: 'Two items cleared overnight. Semis breached the sector cap at 14:32 and Risk has a trim waiting on you. The PLTR order is still held by Compliance.',
    asks: ['Why did semis go over the cap?', 'Show me the drafted TSM and ASML trim', 'What changed in the UNH thesis today?'],
  },
  analyst: {
    title: 'Research copilot',
    lead: 'Three ideas moved while you were away.',
    body: 'The screener added Vertiv this morning and the backlog conflict is still open. Two models finished overnight and one is waiting on a stale feed.',
    asks: ['Reconcile the two backlog filings', 'Which ideas have no model yet?', 'Summarise what the screener found'],
  },
  risk: {
    title: 'Risk copilot',
    lead: 'The book is inside policy.',
    body: 'Two exceptions need you: the PLTR restricted-list override and the technology sector limit request. Everything else cleared without a human.',
    asks: ['What would a 28% tech limit do to VaR?', 'Show every rule PLTR trips', 'Which limits came closest today?'],
  },
};

export default function AiPanel({ tasks, nudge, role }: Props) {
  const brief = BRIEF[role];
  return (
    <aside className="ai" data-ask-exempt>
      <header className="ai-head">
        <span className="ai-title">
          <Spark />
          {brief.title}
          <i className={`ai-dot n-${nudge}`} title={nudge === 'working' ? 'Working' : nudge === 'ready' ? 'An answer is ready' : 'Idle'} />
        </span>
        <div className="ai-head-tools">
          <button className="icon-btn" title="Attach">
            <Clip />
          </button>
        </div>
      </header>

      <div className="ai-body">
        <div className="ai-stamp">Today, 08:02</div>

        <div className="ai-msg">
          <p>{brief.lead}</p>
          <p className="ai-dim">{brief.body}</p>
          <div className="ai-sources">
            <span className="chip">46 sources</span>
            <span className="chip">6 agents</span>
          </div>
          <button className="btn-outline">Live new report</button>
        </div>

        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} />
        ))}

        {tasks.length === 0 && (
          <div className="ai-followups">
            {brief.asks.map((f) => (
              <button key={f} className="ai-follow">
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ai-compose">
        <input placeholder="Ask about the book, a name, or an agent" />
        <button className="ai-send" title="Send">
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
