import { useState } from 'react';
import { WATCHLIST } from '../data/fund';
import Sparkline from './Sparkline';
import { Plus, Search, X } from './Icons';

export default function Watchlist({ onClose }: { onClose?: () => void }) {
  const [q, setQ] = useState('');
  const rows = WATCHLIST.filter(
    (w) => w.ticker.toLowerCase().includes(q.toLowerCase()) || w.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <section className="card watchlist">
      <header className="card-head">
        <div>
          <div className="card-title">Watchlist</div>
          <div className="card-sub">{WATCHLIST.length} names tracked by Research</div>
        </div>
        <div className="watch-tools">
          <button className="icon-btn" title="Add a name">
            <Plus size={15} />
          </button>
          {onClose && (
            <button className="icon-btn" onClick={onClose} title="Close the watchlist">
              <X size={13} />
            </button>
          )}
        </div>
      </header>

      <label className="search">
        <Search />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter tickers" />
      </label>

      <ul className="watch-list">
        {rows.map((w) => (
          <li key={w.ticker}>
            <div className="watch-l">
              <span className="tick">{w.ticker}</span>
              <span className="sub">{w.note}</span>
            </div>
            <Sparkline values={w.spark} up={w.pct >= 0} />
            <div className="watch-r">
              <span className="watch-price">{w.price.toFixed(2)}</span>
              <span className={`watch-pct ${w.pct >= 0 ? 'up' : 'down'}`}>
                {w.pct >= 0 ? '+' : ''}
                {w.pct.toFixed(2)}%
                <i className="arrow" aria-hidden="true">
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                    <path d={w.pct >= 0 ? 'M6 9.5V2.5M2.8 5.7 6 2.5l3.2 3.2' : 'M6 2.5v7M2.8 6.3 6 9.5l3.2-3.2'} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </i>
              </span>
            </div>
          </li>
        ))}
        {rows.length === 0 && <li className="watch-empty">No name matches that filter.</li>}
      </ul>
    </section>
  );
}
