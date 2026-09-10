import { useState } from 'react';
import { WATCHLIST } from '../data/fund';
import Sparkline from './Sparkline';
import { Agents, Book, Bookmark, Chevron, Exit, Eye, Gear, Grid, Mark, Panel, Plus, Search } from './Icons';
import type { Role } from './TopBar';

type Props = {
  collapsed: boolean;
  onToggle: () => void;
  active: string;
  onNavigate: (key: string) => void;
  role: Role;
};

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: Grid },
  { key: 'saved', label: 'Saved', icon: Bookmark },
  { key: 'agents', label: 'Agents', icon: Agents, badge: '6' },
  { key: 'research', label: 'Research', icon: Book },
];

const FUND: Record<Role, { name: string; sub: string }> = {
  pm: { name: 'Rise Alpha I', sub: '$128.4M · PM view' },
  analyst: { name: 'Rise Alpha I', sub: '10 ideas live' },
  risk: { name: 'Rise Alpha I', sub: '1,842 rules watched' },
};

export default function Sidebar({ collapsed, onToggle, active, onNavigate, role }: Props) {
  const [listOpen, setListOpen] = useState(true);
  const [q, setQ] = useState('');

  const rows = WATCHLIST.filter((w) => w.ticker.toLowerCase().includes(q.toLowerCase()) || w.name.toLowerCase().includes(q.toLowerCase()));
  const fund = FUND[role];

  return (
    <aside className={`rail ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="rail-top">
        <div className="brand">
          <Mark size={collapsed ? 26 : 22} />
          {!collapsed && <span className="brand-name">RISE</span>}
        </div>
        {!collapsed && (
          <button className="icon-btn" onClick={onToggle} title="Collapse navigation" aria-label="Collapse navigation">
            <Panel />
          </button>
        )}
      </div>

      {collapsed && (
        <button className="icon-btn rail-expand" onClick={onToggle} title="Expand navigation" aria-label="Expand navigation">
          <Panel />
        </button>
      )}

      <button className={`create ${collapsed ? 'is-icon' : ''}`} title="Create">
        <Plus size={collapsed ? 17 : 15} />
        {!collapsed && <span>Create</span>}
      </button>

      <nav className="rail-nav">
        {NAV.map(({ key, label, icon: Icon, badge }) => (
          <button
            key={key}
            className={`rail-link ${active === key ? 'is-active' : ''}`}
            onClick={() => onNavigate(key)}
            title={collapsed ? label : undefined}
          >
            <Icon />
            {!collapsed && <span>{label}</span>}
            {!collapsed && badge && <em className="rail-badge">{badge}</em>}
          </button>
        ))}
      </nav>

      {collapsed ? (
        <button className="rail-link" title="Watchlist" onClick={onToggle}>
          <Eye />
        </button>
      ) : (
        <section className={`rail-list ${listOpen ? 'is-open' : ''}`}>
          <button className="rail-list-h" onClick={() => setListOpen(!listOpen)} aria-expanded={listOpen}>
            <Eye size={14} />
            Watchlist
            <em>{WATCHLIST.length}</em>
            <Chevron size={12} className={listOpen ? '' : 'is-shut'} />
          </button>

          {listOpen && (
            <>
              <label className="rail-search">
                <Search size={13} />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter" />
              </label>

              <ul className="rail-watch">
                {rows.map((w) => (
                  <li key={w.ticker}>
                    <span className="rw-t">{w.ticker}</span>
                    <Sparkline values={w.spark} up={w.pct >= 0} w={40} h={16} />
                    <span className="rw-p">{w.price.toFixed(2)}</span>
                    <span className={`rw-c ${w.pct >= 0 ? 'up' : 'down'}`}>
                      {w.pct >= 0 ? '+' : ''}
                      {w.pct.toFixed(2)}%
                    </span>
                  </li>
                ))}
                {rows.length === 0 && <li className="rw-empty">No name matches.</li>}
              </ul>
            </>
          )}
        </section>
      )}

      {!collapsed && (
        <div className="rail-block">
          <div className="rail-block-h">Fund</div>
          <div className="rail-fund">
            <span className="rail-fund-name">{fund.name}</span>
            <span className="rail-fund-sub">{fund.sub}</span>
          </div>
        </div>
      )}

      <div className="rail-foot">
        <button className="rail-link" title="Settings">
          <Gear />
          {!collapsed && <span>Settings</span>}
        </button>
        <button className="rail-link" title="Sign out">
          <Exit />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
