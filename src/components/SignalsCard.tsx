import { SIGNALS } from '../data/signals';
import type { Signal } from '../data/signals';
import { ArrowOut } from './Icons';
import type { AiContext } from '../data/ai';

/* The top of the screener, as a list the dashboard can place anywhere.

   The right-hand column is only ever one of two things. A signal the agents
   have finished with carries the call that is the manager's alone to make,
   and taking it opens the copilot with the signal tagged and the order
   drafted. A signal still being worked carries no button, only what the agent
   is doing, so the list sorts itself into what needs you and what does not. */
export default function SignalsCard({
  context,
  onContext,
}: {
  context: AiContext | null;
  onContext: (c: AiContext | null) => void;
}) {
  /* The row and its action differ only in which proposal the copilot opens
     on, so they are built from one shape. */
  function tag(s: Signal, taken = false): AiContext {
    return {
      id: s.ticker,
      kind: 'signal',
      title: `${s.ticker} · ${s.signal}`,
      sub: `${s.confidence}% confidence · ${s.note}`,
      questions: s.questions,
      action:
        taken && s.act.text
          ? { text: s.act.text, detail: s.act.detail ?? '' }
          : { text: s.action, detail: s.detail, pending: s.act.state === 'working' },
    };
  }

  return (
    <section className="pm-block">
      <header className="pm-block-h">
        <h3>Top investment signals</h3>
        <button className="view-all">
          View all
          <ArrowOut size={12} />
        </button>
      </header>

      <ul className="pri-list">
        {SIGNALS.slice(0, 4).map((s) => {
          const on = context?.id === s.ticker;
          return (
            <li key={s.ticker} className={`pri-row ${on ? 'is-on' : ''}`}>
              <button className="pri signal" onClick={() => onContext(on ? null : tag(s))}>
                <span className="pri-tick">{s.ticker}</span>
                <span className="pri-pill">{s.signal}</span>
                <span className="pri-t dim">{s.note}</span>
                <span className="pri-up up">+{s.upside.toFixed(1)}%</span>
              </button>

              {s.act.state === 'decide' ? (
                <button className="pri-act" onClick={() => onContext(tag(s, true))}>
                  {s.act.label}
                </button>
              ) : (
                /* not a control: the agent is mid-run and there is nothing
                   here for anyone to press */
                <span className="pri-work">
                  <i className="spin" />
                  {s.act.label}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
