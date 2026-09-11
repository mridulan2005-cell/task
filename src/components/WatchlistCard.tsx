import { WATCHLIST } from '../data/fund';
import Sparkline from './Sparkline';
import { ArrowOut } from './Icons';

/* The same names as the rail, given room to show the day. */
export default function WatchlistCard() {
  return (
    <section className="card watch-card">
      <header className="card-head">
        <div>
          <div className="card-title">Watchlist</div>
          <div className="card-sub">Names you follow, marked on the 15 minute cycle</div>
        </div>
        <button className="view-all">
          View all
          <ArrowOut size={12} />
        </button>
      </header>

      <ul className="watch-rows">
        {WATCHLIST.map((w) => (
          <li key={w.ticker}>
            <span className="watch-n">
              <strong>{w.ticker}</strong>
              <em>{w.name}</em>
            </span>
            <Sparkline values={w.spark} up={w.pct >= 0} w={56} h={20} />
            <span className="watch-p">{w.price.toFixed(2)}</span>
            <span className={`watch-c ${w.pct >= 0 ? 'up' : 'down'}`}>
              {w.pct >= 0 ? '+' : ''}
              {w.pct.toFixed(2)}%
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
