import { useState } from 'react';
import { Chevron, Clip, Send, Spark, X } from './Icons';
import type { AiTask } from '../data/ai';

type Props = { tasks: AiTask[]; onClose: () => void };

const FOLLOWUPS = [
  'Why did semis go over the cap?',
  'Show me the drafted TSM and ASML trim',
  'What changed in the UNH thesis today?',
];

export default function AiPanel({ tasks, onClose }: Props) {
  return (
    <aside className="ai" data-ask-exempt>
      <header className="ai-head">
        <span className="ai-title">
          <Spark />
          Fund copilot
        </span>
        <div className="ai-head-tools">
          <button className="icon-btn" title="Attach">
            <Clip />
          </button>
          <button className="icon-btn" onClick={onClose} title="Close panel">
            <X />
          </button>
        </div>
      </header>

      <div className="ai-body">
        <div className="ai-stamp">Today, 08:02</div>

        <div className="ai-msg">
          <p>Your morning report is ready, as usual.</p>
          <p className="ai-dim">
            Two items cleared overnight. Semis breached the sector cap at 14:32 and Risk has a trim waiting on you. The
            PLTR order is still held by Compliance.
          </p>
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
            {FOLLOWUPS.map((f) => (
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
