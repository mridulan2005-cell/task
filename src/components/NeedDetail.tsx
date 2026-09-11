import { useState } from 'react';
import Cited from './Cited';
import Sources from './Sources';
import { Chevron, Left, Send } from './Icons';
import type { AiContext } from '../data/ai';
import type { Detail } from '../data/attention';

type Props = {
  context: AiContext;
  detail: Detail;
  /* back to the queue, leaving the item where it was */
  onBack: () => void;
  /* the recommendation taken as written */
  onTake: () => void;
};

/* What a card from the queue opens into.

   It reads in the order a decision is made rather than the order the agent
   filed it: the figures that make it matter, the record, and the one thing it
   would do. The background comes last and shut, because the reader is here to
   settle something and only some of them need the story first. Every
   paragraph carries its own provenance, so nobody has to go looking for where
   a sentence came from. */
export default function NeedDetail({ context, detail, onBack, onTake }: Props) {
  const [showContext, setShowContext] = useState(false);
  const sources = context.sources ?? [];

  return (
    <div className="need">
      <header className="need-head">
        <button className="icon-btn" onClick={onBack} title="Back to the queue" aria-label="Back to the queue">
          <Left size={16} />
        </button>
        <h3 className="need-title">{context.title}</h3>
        <Sources sources={sources} label="" />
      </header>

      <div className="need-body">
        {detail.stats.length > 0 && (
          <ul className="need-stats">
            {detail.stats.map((s) => (
              <li key={s.k}>
                <span className="need-stat-k">{s.k}</span>
                <span className={`need-stat-v ${s.tone ?? ''}`}>{s.v}</span>
              </li>
            ))}
          </ul>
        )}

        <section className="need-sec">
          {detail.raised && <Cited className="need-p is-lead" text={detail.raised} sources={sources} from={2} />}

          <dl className="need-rows">
            {detail.rows.map((r) => (
              <div key={r.k}>
                <dt>{r.k}</dt>
                <dd>{r.v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="need-sec">
          <div className="block-h as-label">Recommended</div>
          <div className="need-rec">
            <Cited className="need-rec-p" text={detail.recommend} sources={sources} from={1} />
            <div className="need-rec-b">
              <span className="need-rec-n">{context.action?.text}</span>
              <button className="need-go" onClick={onTake} title={context.action?.text ?? 'Take it'} aria-label={context.action?.text ?? 'Take it'}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* The background sits last and shut. Someone who already knows the
            name does not need it, and someone who does not can open it
            without it standing between them and the recommendation. */}
        <section className="need-sec is-last">
          <button className={`need-more ${showContext ? 'is-on' : ''}`} onClick={() => setShowContext(!showContext)} aria-expanded={showContext}>
            <Chevron size={12} className={showContext ? '' : 'is-shut'} />
            Context
          </button>
          {showContext && <Cited className="need-p" text={detail.context} sources={sources} />}
        </section>
      </div>
    </div>
  );
}
