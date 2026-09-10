import { useEffect, useMemo, useState } from 'react';
import { Alert, Chevron, X } from './Icons';
import { ATTENTION } from '../data/attention';
import type { Attn } from '../data/attention';
import type { Role } from './TopBar';
import type { AiContext } from '../data/ai';

/* What needs you sits in one place for every desk: the drawer above the
   composer.

   Anything blocking takes the drawer over as a compact card that says only
   what the problem is. Clicking it hands it to the copilot, and the actions
   and the questions live there. While anything blocking is up, the quieter
   queue stays out of the way. */

export function useAttention(role: Role) {
  const items = ATTENTION[role] ?? [];
  const [cleared, setCleared] = useState<string[]>([]);

  /* A role switch is a new desk, so nothing carries over. */
  useEffect(() => setCleared([]), [role]);

  const live = useMemo(() => items.filter((i) => !cleared.includes(i.id)), [items, cleared]);

  return {
    intruding: live.filter((i) => i.urgency === 'intrude'),
    nudges: live.filter((i) => i.urgency === 'nudge'),
    clear: (id: string) => setCleared((c) => [...c, id]),
  };
}

export function contextFor(a: Attn): AiContext {
  return {
    id: a.id,
    kind: 'need',
    title: a.title,
    sub: `${a.agent} agent · raised ${a.age} ago`,
    questions: a.questions,
    action: { text: a.primary, detail: a.body },
  };
}

type Props = {
  intruding: Attn[];
  nudges: Attn[];
  context: AiContext | null;
  onContext: (c: AiContext | null) => void;
  onClear: (id: string) => void;
};

export default function Attention({ intruding, nudges, context, onContext, onClear }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (nudges.length === 0) setOpen(false);
  }, [nudges.length]);

  /* Blocking work owns the drawer until it is dealt with. */
  if (intruding.length > 0)
    return (
      <div className="attn-drawer is-urgent">
        <div className="attn-cards">
          {intruding.map((a) => (
            <button
              key={a.id}
              className={`attn-card-c t-${a.tone} ${context?.id === a.id ? 'is-on' : ''}`}
              onClick={() => onContext(context?.id === a.id ? null : contextFor(a))}
            >
              <span className="attn-card-ic">
                <Alert size={19} />
              </span>
              <span className="attn-card-w">
                <span className="attn-card-t">{a.title}</span>
                <span className="attn-card-b">{a.body}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    );

  if (nudges.length === 0) return null;

  return (
    <div className={`attn-drawer ${open ? 'is-open' : ''}`}>
      <button className="attn-grab" onClick={() => setOpen(!open)} aria-expanded={open}>
        <i className="attn-bar" />
        <span className="attn-grab-l">
          {nudges.length} thing{nudges.length === 1 ? '' : 's'} can wait
        </span>
        <Chevron size={12} className={open ? '' : 'is-shut'} />
      </button>

      {open && (
        <ul className="attn-wait">
          {nudges.map((a) => (
            <li key={a.id} className={context?.id === a.id ? 'is-on' : ''}>
              <button className="attn-wait-row" onClick={() => onContext(context?.id === a.id ? null : contextFor(a))}>
                <span className={`attn-dot t-${a.tone}`} />
                <span className="attn-wait-c">
                  <span className="attn-wait-t">{a.title}</span>
                  <span className="attn-wait-s">
                    {a.agent} · {a.age}
                  </span>
                </span>
              </button>
              <button className="attn-wait-x" onClick={() => onClear(a.id)} title="Clear">
                <X size={10} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
