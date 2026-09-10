import { useEffect, useRef, useState } from 'react';
import { Bell, Check, Chevron, Lock, Plus, Search, Spark, X } from './Icons';

export type Role = 'pm' | 'analyst';

export const ROLES: { id: Role; label: string; sub: string }[] = [
  { id: 'pm', label: 'Portfolio manager', sub: 'Book, risk and approvals' },
  { id: 'analyst', label: 'Analyst', sub: 'Ideas, research and models' },
];

type Props = {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
  aiOpen: boolean;
  onToggleAi: () => void;
  nudge: string;
  role: Role;
  onRole: (r: Role) => void;
  crumb?: string;
  onCrumbHome?: () => void;
};

export default function TopBar({ tabs, activeTab, onTab, onCloseTab, onNewTab, aiOpen, onToggleAi, nudge, role, onRole, crumb, onCrumbHome }: Props) {
  const [menu, setMenu] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    function away(e: MouseEvent) {
      if (!wrap.current?.contains(e.target as Node)) setMenu(false);
    }
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, [menu]);

  const current = ROLES.find((r) => r.id === role)!;

  return (
    <header className="top">
      <div className="wtabs">
        {crumb && (
          <>
            <button className="crumb" onClick={onCrumbHome}>
              My workspace
              <Lock size={11} />
            </button>
            <Chevron size={13} className="crumb-sep" />
            <span className="crumb is-here">{crumb}</span>
          </>
        )}
        {!crumb &&
          tabs.map((t, i) => (
          <div key={t.id} className={`wtab ${t.id === activeTab ? 'is-on' : ''}`} onClick={() => onTab(t.id)}>
            <span>{t.label}</span>
            {i === 0 ? (
              <Lock size={12} className="wtab-lock" />
            ) : (
              <button
                className="wtab-x"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(t.id);
                }}
                aria-label={`Close ${t.label}`}
              >
                <X size={11} />
              </button>
            )}
            </div>
          ))}
        {!crumb && (
          <button className="wtab-add" onClick={onNewTab} title="New workspace">
            <Plus size={14} />
          </button>
        )}
      </div>

      <div className="top-right">
        <label className="top-search">
          <Search />
          <input placeholder={role === 'pm' ? 'Search names, agents, orders' : 'Search ideas, sources, models'} />
          <kbd>/</kbd>
        </label>

        <button className="icon-btn has-dot" title="Notifications">
          <Bell />
        </button>

        <button className={`ask ${aiOpen ? 'is-on' : ''} n-${nudge}`} onClick={onToggleAi}>
          <Spark />
          Ask AI
        </button>

        <div className="user-wrap" ref={wrap}>
          <button className="user" onClick={() => setMenu(!menu)}>
            <span className="avatar">MK</span>
            <span className="user-meta">
              <span className="user-name">Mira Kapoor</span>
              <span className="user-role">{current.label}</span>
            </span>
            <Chevron size={13} />
          </button>

          {menu && (
            <div className="role-pop">
              <div className="role-h">Switch workspace</div>
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  className={r.id === role ? 'is-on' : ''}
                  onClick={() => {
                    onRole(r.id);
                    setMenu(false);
                  }}
                >
                  <span className="role-t">
                    <span className="role-l">{r.label}</span>
                    <span className="role-s">{r.sub}</span>
                  </span>
                  {r.id === role && <Check size={13} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
