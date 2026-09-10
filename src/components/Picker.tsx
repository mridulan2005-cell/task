import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Search } from './Icons';

export type PickItem = { id: string; label: string; sub?: string };

type Props = {
  items: PickItem[];
  active?: string;
  placeholder?: string;
  align?: 'left' | 'right';
  footer?: { label: string; onPick: () => void };
  onPick: (id: string) => void;
  onClose: () => void;
};

/* One popover serves every swap in the workspace: series, books, metrics. */
export default function Picker({ items, active, placeholder = 'Search', align = 'left', footer, onPick, onClose }: Props) {
  const [q, setQ] = useState('');
  const wrap = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    field.current?.focus();
    function away(e: MouseEvent) {
      if (!wrap.current?.contains(e.target as Node)) onClose();
    }
    function esc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [onClose]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(
      (i) => i.label.toLowerCase().includes(needle) || i.id.toLowerCase().includes(needle) || i.sub?.toLowerCase().includes(needle),
    );
  }, [items, q]);

  return (
    <div className={`picker ${align === 'right' ? 'to-right' : ''}`} ref={wrap}>
      <label className="picker-search">
        <Search size={14} />
        <input ref={field} value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} />
      </label>

      <ul className="picker-list">
        {rows.map((i) => (
          <li key={i.id}>
            <button className={i.id === active ? 'is-on' : ''} onClick={() => onPick(i.id)}>
              <span className="picker-id">{i.id.length <= 5 ? i.id : ''}</span>
              <span className="picker-text">
                <span className="picker-label">{i.label}</span>
                {i.sub && <span className="picker-sub">{i.sub}</span>}
              </span>
              {i.id === active && <Check size={13} />}
            </button>
          </li>
        ))}
        {rows.length === 0 && <li className="picker-empty">Nothing matches that search.</li>}
      </ul>

      {footer && (
        <button className="picker-foot" onClick={footer.onPick}>
          {footer.label}
        </button>
      )}
    </div>
  );
}
