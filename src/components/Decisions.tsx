import { useEffect } from 'react';
import { ArrowOut, Ledger, Scales, X } from './Icons';
import { CALL_LABEL, DECISIONS } from '../data/agents';
import type { Decision } from '../data/agents';
import type { Role } from './TopBar';

/* Everything the portfolio manager agent settled today.

   A count on the dashboard is only worth reading if the things behind it can
   be read too, so the number opens the log rather than standing in for it.
   Each row answers the three questions a decision has to answer: what was
   done, when, and on which surface. */
export default function Decisions({
  onClose,
  onGo,
}: {
  onClose: () => void;
  /* open the surface a decision touched */
  onGo?: (role: Role, view?: 'testbox') => void;
}) {
  useEffect(() => {
    function esc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);

  return (
    <div className="dec-wrap" onClick={onClose}>
      <section className="dec" onClick={(e) => e.stopPropagation()}>
        <header className="dec-head">
          <span className="dec-ic">
            <Scales size={17} />
          </span>
          <span className="dec-h">
            <strong>Decisions today</strong>
            <em>Portfolio manager agent · {DECISIONS.length} settled since the open</em>
          </span>
          <button className="icon-btn" onClick={onClose} title="Close">
            <X size={13} />
          </button>
        </header>

        <ol className="dec-list">
          {DECISIONS.map((d) => (
            <Row key={d.id} d={d} onGo={onGo} />
          ))}
        </ol>

        <footer className="dec-foot">
          <Ledger size={14} />
          Every line is written to the sealed decision log as it is made.
        </footer>
      </section>
    </div>
  );
}

function Row({ d, onGo }: { d: Decision; onGo?: (role: Role, view?: 'testbox') => void }) {
  return (
    <li className="dec-row">
      {/* when, held in its own column so the day reads down the left edge */}
      <span className="dec-time">{d.time}</span>

      <span className="dec-body">
        <span className="dec-top">
          <span className="dec-t">{d.title}</span>
          <span className={`dec-call c-${d.call}`}>{CALL_LABEL[d.call]}</span>
        </span>

        <span className="dec-did">{d.did}</span>
        <span className="dec-why">{d.why}</span>

        <span className="dec-where">
          <button onClick={() => onGo?.(d.where.role, d.where.view)}>
            {d.where.label}
            <ArrowOut size={11} />
          </button>
          <em>raised by {d.raisedBy === 'pm' ? 'the desk' : d.raisedBy}</em>
        </span>
      </span>
    </li>
  );
}
