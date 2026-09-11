import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Grip, Plus, Search, Undo, X } from './Icons';
import { GROUPS, WIDGETS } from '../data/widgets';
import type { WidgetDef, WidgetGroup } from '../data/widgets';
import { ROLES } from './TopBar';
import type { Role } from './TopBar';

type Props = {
  role: Role;
  /* what is already on the dashboard, so the catalogue never offers it twice */
  present: string[];
  /* the desk whose template this dashboard started from */
  desk: string;
  onAdd: (ids: string[]) => void;
  onRemove: (id: string) => void;
  /* absent once the layout is already the template it came from */
  onReset?: () => void;
  onClose: () => void;
  /* a row pressed and pulled becomes a drag onto the dashboard */
  onLift: (id: string, e: React.PointerEvent) => void;
};

type Section = { key: string; label: string; rows: WidgetDef[] };

export default function WidgetPalette({ role, present, desk, onAdd, onRemove, onReset, onClose, onLift }: Props) {
  const [q, setQ] = useState('');
  const [group, setGroup] = useState<WidgetGroup | 'all'>('all');
  const [picked, setPicked] = useState<string[]>([]);
  /* held as an id, so narrowing the search never leaves the highlight on a
     row that is no longer there */
  const [active, setActive] = useState<string | null>(null);
  const field = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => field.current?.focus(), []);

  const needle = q.trim().toLowerCase();

  const matches = useMemo(
    () =>
      WIDGETS.filter((w) => {
        if (group !== 'all' && w.group !== group) return false;
        if (!needle) return true;
        return `${w.name} ${w.blurb} ${w.group}`.toLowerCase().includes(needle);
      }),
    [group, needle],
  );

  /* Searching flattens the catalogue; browsing it keeps the desk's own
     widgets at the top, where they are the likeliest thing wanted. */
  const sections: Section[] = useMemo(() => {
    if (needle || group !== 'all') return [{ key: 'found', label: needle ? 'Matches' : group, rows: matches }];

    const mine = matches.filter((w) => w.home.includes(role));
    const rest = matches.filter((w) => !w.home.includes(role));
    const out: Section[] = [];
    if (mine.length) out.push({ key: 'mine', label: `For the ${ROLES.find((r) => r.id === role)!.label.toLowerCase()}`, rows: mine });
    for (const g of GROUPS) {
      const rows = rest.filter((w) => w.group === g);
      if (rows.length) out.push({ key: g, label: g, rows });
    }
    return out;
  }, [group, matches, needle, role]);

  const flat = useMemo(() => sections.flatMap((s) => s.rows), [sections]);
  const here = Math.max(
    flat.findIndex((f) => f.id === active),
    0,
  );

  function toggle(id: string) {
    if (present.includes(id)) return onRemove(id);
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  function add() {
    if (!picked.length) return;
    onAdd(picked);
    setPicked([]);
  }

  function keys(e: React.KeyboardEvent) {
    if (e.key === 'Escape') return onClose();
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      return add();
    }
    if (e.key === 'Enter' && flat[here]) {
      e.preventDefault();
      return toggle(flat[here].id);
    }
    const step = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = flat[Math.min(Math.max(here + step, 0), flat.length - 1)];
    if (!next) return;
    setActive(next.id);
    list.current?.querySelector(`[data-row="${next.id}"]`)?.scrollIntoView({ block: 'nearest' });
  }

  return (
    <aside className="dpal" onKeyDown={keys} data-ask-exempt>
      <header className="dpal-head">
        <span className="dpal-title">
          Add to dashboard
          <em>Drag any card on the board to rearrange it while this is open</em>
        </span>
        <button className="icon-btn" onClick={onClose} title="Close" aria-label="Close the catalogue">
          <X size={12} />
        </button>
      </header>

      <label className="dpal-search">
        <Search size={14} />
        <input ref={field} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search widgets" aria-label="Search widgets" />
        {q && (
          <button className="dpal-clear" onClick={() => setQ('')} aria-label="Clear the search">
            <X size={11} />
          </button>
        )}
      </label>

      <div className="dpal-groups">
        <button className={group === 'all' ? 'is-on' : ''} onClick={() => setGroup('all')}>
          Everything
        </button>
        {GROUPS.map((g) => (
          <button key={g} className={group === g ? 'is-on' : ''} onClick={() => setGroup(g)}>
            {g}
          </button>
        ))}
      </div>

      <div className="dpal-list" ref={list}>
        {sections.map((s) => (
          <section key={s.key}>
            <div className="block-h as-label">{s.label}</div>
            <ul>
              {s.rows.map((w) => {
                const on = present.includes(w.id);
                const sel = picked.includes(w.id);
                return (
                  <li key={w.id}>
                    <div
                      data-row={w.id}
                      className={`dpal-row ${on ? 'is-on' : ''} ${sel ? 'is-picked' : ''} ${flat[here]?.id === w.id ? 'is-active' : ''}`}
                      onPointerDown={(e) => onLift(w.id, e)}
                      onClick={() => toggle(w.id)}
                      onMouseEnter={() => setActive(w.id)}
                      title={on ? 'On the dashboard. Click to take it off.' : 'Click to select, or drag it onto the dashboard.'}
                      role="button"
                      tabIndex={-1}
                    >
                      <span className="dpal-grip">
                        <Grip size={13} />
                      </span>

                      <span className="dpal-text">
                        <span className="dpal-name">{w.name}</span>
                        <span className="dpal-blurb">{w.blurb}</span>
                      </span>

                      <span className={`dpal-mark ${on ? 's-on' : sel ? 's-sel' : ''}`}>
                        {on ? <Check size={12} /> : sel ? <Check size={12} /> : <Plus size={13} />}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        {flat.length === 0 && <p className="dpal-empty">No widget matches that search.</p>}
      </div>

      <footer className="dpal-foot">
        <button className="btn-dark wide" onClick={add} disabled={picked.length === 0}>
          <Plus size={13} />
          {picked.length === 0 ? 'Select a widget to add' : `Add ${picked.length} widget${picked.length > 1 ? 's' : ''}`}
        </button>
        <span className="dpal-hint">Or drag one straight onto the dashboard.</span>

        {onReset && (
          <button className="dpal-reset" onClick={onReset}>
            <Undo size={12} />
            Back to the {desk.toLowerCase()} template
          </button>
        )}
      </footer>
    </aside>
  );
}
