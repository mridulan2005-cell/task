import { useState } from 'react';
import { Briefcase, Chat, X } from './Icons';
import type { AiTask } from '../data/ai';
import type { TaskRun } from '../data/tasks';

/* Everything the copilot has been asked, in one list.

   Chats and tasks are kept apart everywhere else in the panel, so the one
   place they meet is here, filtered rather than split. */

type Props = {
  chats: AiTask[];
  runs: TaskRun[];
  onClose: () => void;
  onOpenChat: () => void;
  onOpenRun: (r: TaskRun) => void;
};

type Filter = 'all' | 'chat' | 'task';

export default function History({ chats, runs, onClose, onOpenChat, onOpenRun }: Props) {
  const [filter, setFilter] = useState<Filter>('all');

  const rows = [
    ...(filter === 'task' ? [] : chats.map((c) => ({ kind: 'chat' as const, id: c.id, title: c.question, when: c.asked, sub: c.quote || 'Asked of the book' }))),
    ...(filter === 'chat'
      ? []
      : runs.map((r) => ({
          kind: 'task' as const,
          id: r.id,
          title: r.title,
          when: r.started,
          sub: r.done === r.steps.length ? 'Finished' : `Step ${r.done + 1} of ${r.steps.length}`,
          run: r,
        }))),
  ];

  return (
    <div className="ai-hist">
      <div className="ai-hist-h">
        <span className="ai-hist-t">History</span>
        <button className="icon-btn" onClick={onClose} title="Close">
          <X size={12} />
        </button>
      </div>

      <div className="ai-hist-f">
        {(['all', 'chat', 'task'] as Filter[]).map((f) => (
          <button key={f} className={filter === f ? 'is-on' : ''} onClick={() => setFilter(f)}>
            {f === 'all' ? 'Everything' : f === 'chat' ? 'Chats' : 'Tasks'}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="ai-hist-e">Nothing yet. Whatever you ask or hand over lands here.</p>
      ) : (
        <ul className="ai-hist-l">
          {rows.map((r) => (
            <li key={`${r.kind}-${r.id}`}>
              <button onClick={() => ('run' in r ? onOpenRun(r.run) : onOpenChat())}>
                <span className="ai-hist-i">{r.kind === 'chat' ? <Chat size={14} /> : <Briefcase size={14} />}</span>
                <span className="ai-hist-c">
                  <strong>{r.title}</strong>
                  <em>{r.sub}</em>
                </span>
                <span className="ai-hist-w">{r.when}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
