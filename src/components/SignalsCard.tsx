import { PROPOSALS, SIGNALS } from '../data/signals';
import { ArrowOut, Spark } from './Icons';

export function SignalsCard() {
  return (
    <section className="card signals">
      <header className="card-head">
        <div className="card-title with-mark">
          Top Investment Signals
          <span className="ai-mark" title="Raised by the research agents">
            <Spark size={11} />
          </span>
        </div>
        <button className="view-all">
          View all
          <ArrowOut size={12} />
        </button>
      </header>

      <ul className="sig-list">
        {SIGNALS.map((s) => (
          <li key={s.ticker}>
            <div className="sig-top">
              <span className="tick">{s.ticker}</span>
              <span className="sig-pill">{s.signal}</span>
              <span className="sig-up up">+{s.upside.toFixed(1)}%</span>
            </div>
            <div className="sig-bot">
              <span className="sig-note">{s.note}</span>
              <span className="sig-conf">{s.confidence}% confidence</span>
              <button className="open-b">Open</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ProposalsCard() {
  return (
    <section className="card proposals">
      <header className="card-head">
        <div className="card-title">Active Proposals</div>
        <button className="view-all">
          View all
          <ArrowOut size={12} />
        </button>
      </header>

      <ul className="prop-list">
        {PROPOSALS.map((p) => (
          <li key={p.ticker}>
            <span className="tick">{p.ticker}</span>
            <span className="prop-c">
              <span className="prop-p">{p.proposal}</span>
              <span className="prop-a">PM adjusted to {p.adjusted}</span>
            </span>
            <span className={`prop-state s-${p.state}`}>{p.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
