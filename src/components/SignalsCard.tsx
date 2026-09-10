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

      <table className="lite-table">
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Signal</th>
            <th className="n">Confidence</th>
            <th className="n">Est. Upside</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {SIGNALS.map((s) => (
            <tr key={s.ticker}>
              <td className="tick">{s.ticker}</td>
              <td>
                <span className="sig-pill">{s.signal}</span>
                <span className="sig-note">{s.note}</span>
              </td>
              <td className="n">{s.confidence}%</td>
              <td className="n up">+{s.upside.toFixed(1)}%</td>
              <td className="n">
                <button className="open-b">Open</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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

      <table className="lite-table">
        <thead>
          <tr>
            <th>Security</th>
            <th>AI Proposal</th>
            <th>PM Adjusted</th>
            <th className="n">Status</th>
          </tr>
        </thead>
        <tbody>
          {PROPOSALS.map((p) => (
            <tr key={p.ticker}>
              <td className="tick">{p.ticker}</td>
              <td>{p.proposal}</td>
              <td>{p.adjusted}</td>
              <td className="n">
                <span className={`prop-state s-${p.state}`}>{p.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
