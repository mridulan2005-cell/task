import MetricStrip from './MetricStrip';
import PortfolioCard from './PortfolioCard';
import { ArrowOut } from './Icons';
import { RECENT_TRADES, TRADE_METRICS } from '../data/trades';
import type { Trade } from '../data/trades';

const STATE_LABEL: Record<Trade['state'], string> = {
  filled: 'Filled',
  working: 'Working',
  held: 'Held',
};

export default function TraderDashboard() {
  return (
    <main className="canvas pm">
      <MetricStrip plain metrics={TRADE_METRICS} start={['filled', 'slip', 'working', 'auto']} />

      <PortfolioCard />

      <section className="card blotter">
        <header className="card-head">
          <div>
            <div className="card-title">Recent trades made</div>
            <div className="card-sub">Worked by the execution agents unless marked otherwise</div>
          </div>
          <button className="view-all">
            Open the blotter
            <ArrowOut size={12} />
          </button>
        </header>

        <table className="lite-table blot-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Order</th>
              <th className="n">Qty</th>
              <th className="n">Price</th>
              <th className="n">Notional</th>
              <th>Progress</th>
              <th>Worked by</th>
            </tr>
          </thead>
          <tbody>
            {RECENT_TRADES.map((t) => (
              <tr key={t.id}>
                <td className="blot-time">{t.time}</td>

                <td>
                  <span className="blot-order">
                    <span className={`blot-side s-${t.side.toLowerCase()}`}>{t.side}</span>
                    <span className="wcell">
                      <span className="tick">{t.ticker}</span>
                      <span className="sub">{t.name}</span>
                    </span>
                  </span>
                </td>

                <td className="n">{t.qty}</td>
                <td className="n">{t.price}</td>
                <td className="n">{t.notional}</td>

                <td>
                  <span className="blot-prog">
                    <span className={`blot-track s-${t.state}`}>
                      <i style={{ width: `${t.done}%` }} />
                    </span>
                    <span className={`blot-state s-${t.state}`}>
                      {STATE_LABEL[t.state]}
                      {t.state !== 'held' && <em>{t.done}%</em>}
                    </span>
                  </span>
                </td>

                <td>
                  <span className="wcell">
                    <span className={`blot-by ${t.by === 'You' ? 'is-hand' : ''}`}>{t.by}</span>
                    <span className="sub">{t.note}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
