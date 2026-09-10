import { useState } from 'react';
import MetricStrip from './MetricStrip';
import PortfolioCard, { PortfolioTabs } from './PortfolioCard';
import NeedsYou from './NeedsYou';
import { NEEDS_YOU } from '../data/needs';
import { SIGNALS } from '../data/signals';
import { ArrowOut, Chevron } from './Icons';
import type { AiContext } from '../data/ai';

const LEVEL: Record<string, string> = { critical: 'Blocking', high: 'Today', routine: 'Routine' };

export default function PmDashboard({
  context,
  onContext,
}: {
  context: AiContext | null;
  onContext: (c: AiContext | null) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <main className="canvas pm">
      <header className="pm-head">
        <div className="pm-crumb">Portfolio</div>
        <div className="pm-price">
          $128,430,000
          <span className="up">+12.41% (+$14.18M) year to date</span>
        </div>
        <div className="pm-when">Sep 11, 5:07 PM UTC &middot; USD</div>
      </header>

      <MetricStrip plain />

      <PortfolioCard />

      <PortfolioTabs />

      <section className="pm-block">
        <header className="pm-block-h">
          <h3>What needs you right now</h3>
          <button className="view-all" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Show less' : 'View all'}
            {expanded ? <Chevron size={12} /> : <ArrowOut size={12} />}
          </button>
        </header>

        {expanded ? (
          <NeedsYou variant="bare" />
        ) : (
          <ul className="pri-list">
            {NEEDS_YOU.slice(0, 3).map((n) => (
              <li key={n.id}>
                <button
                  className={`pri ${n.priority} ${context?.id === n.id ? 'is-on' : ''}`}
                  onClick={() =>
                    onContext(
                      context?.id === n.id
                        ? null
                        : {
                            id: n.id,
                            kind: 'need',
                            title: n.title,
                            sub: `${n.agent} agent · raised ${n.age} ago`,
                            questions: [
                              'Why was this raised?',
                              `What happens if I ${n.options[0].label.toLowerCase()}?`,
                              'Show me the sources behind it',
                            ],
                          },
                    )
                  }
                >
                  <span className="pri-flag">{LEVEL[n.priority]}</span>
                  <span className="pri-t">{n.title}</span>
                  <span className="pri-age">{n.age}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

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
