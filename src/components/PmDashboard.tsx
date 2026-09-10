import MetricStrip from './MetricStrip';
import PortfolioCard, { PortfolioTabs } from './PortfolioCard';
import { SIGNALS } from '../data/signals';
import { ArrowOut } from './Icons';
import type { AiContext } from '../data/ai';

export default function PmDashboard({
  context,
  onContext,
}: {
  context: AiContext | null;
  onContext: (c: AiContext | null) => void;
}) {
  return (
    <main className="canvas pm">
      <MetricStrip plain />

      <PortfolioCard />

      <PortfolioTabs />

      <section className="pm-block">
        <header className="pm-block-h">
          <h3>Top investment signals</h3>
          <button className="view-all">
            View all
            <ArrowOut size={12} />
          </button>
        </header>

        <ul className="pri-list">
          {SIGNALS.slice(0, 4).map((s) => (
            <li key={s.ticker}>
              <button
                className={`pri signal ${context?.id === s.ticker ? 'is-on' : ''}`}
                onClick={() =>
                  onContext(
                    context?.id === s.ticker
                      ? null
                      : {
                          id: s.ticker,
                          kind: 'signal',
                          title: `${s.ticker} · ${s.signal}`,
                          sub: `${s.confidence}% confidence · ${s.note}`,
                          questions: s.questions,
                          action: { text: s.action, detail: s.detail },
                        },
                  )
                }
              >
                <span className="pri-tick">{s.ticker}</span>
                <span className="pri-pill">{s.signal}</span>
                <span className="pri-t dim">{s.note}</span>
                <span className="pri-up up">+{s.upside.toFixed(1)}%</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
