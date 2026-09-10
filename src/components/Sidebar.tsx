import { Agents, Book, Bookmark, Exit, Eye, Gear, Grid, Mark, Panel, Plus } from './Icons';

type Props = {
  collapsed: boolean;
  onToggle: () => void;
  active: string;
  onNavigate: (key: string) => void;
};

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: Grid },
  { key: 'watchlist', label: 'Watchlist', icon: Eye, badge: '7' },
  { key: 'saved', label: 'Saved', icon: Bookmark },
  { key: 'agents', label: 'Agents', icon: Agents, badge: '6' },
  { key: 'research', label: 'Research', icon: Book },
];

export default function Sidebar({ collapsed, onToggle, active, onNavigate }: Props) {
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

      {!collapsed && (
        <div className="rail-block">
          <div className="rail-block-h">Fund</div>
          <div className="rail-fund">
            <span className="rail-fund-name">Rise Alpha I</span>
            <span className="rail-fund-sub">$128.4M &middot; PM view</span>
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
