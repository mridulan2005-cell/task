import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { createPortal } from 'react-dom';
import { Info, Plus, SrcChat, SrcDoc, SrcDrive, SrcFeed, SrcRepo, SrcSheet } from './Icons';
import type { Source, SrcKind } from '../data/needs';

const GLYPH: Record<SrcKind, (p: { size?: number }) => ReactElement> = {
  doc: SrcDoc,
  sheet: SrcSheet,
  repo: SrcRepo,
  drive: SrcDrive,
  chat: SrcChat,
  feed: SrcFeed,
};

/* The panel is 236 wide and never taller than six rows plus the footer, so a
   long list scrolls inside itself rather than pushing the answer around. */
const W = 236;
const MAX_H = 168;

type Props = { sources: Source[]; label?: string; onAdd?: () => void };

/* Where the work came from is an overlay, never an inline row of chips: the
   answer stays the only thing in the reading column until you ask for more. */
export default function Sources({ sources, label = 'sources', onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [at, setAt] = useState<{ left: number; top: number } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);

  /* Fixed to the button's rect so the overlay escapes the panel's own
     scroller, and flipped above the button when the bottom runs out. */
  useLayoutEffect(() => {
    if (!open) return;
    function place() {
      const r = btn.current?.getBoundingClientRect();
      if (!r) return;
      const below = window.innerHeight - r.bottom - 10;
      const h = Math.min(MAX_H, sources.length * 30 + 41);
      setAt({
        left: Math.min(r.left, window.innerWidth - W - 10),
        top: below < h ? Math.max(r.top - h - 7, 10) : r.bottom + 7,
      });
    }
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, sources.length]);

  useEffect(() => {
    if (!open) return;
    function away(e: MouseEvent) {
      const t = e.target as Node;
      if (!pop.current?.contains(t) && !btn.current?.contains(t)) setOpen(false);
    }
    function esc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  if (sources.length === 0) return null;

  return (
    <>
      <button ref={btn} className={`src-btn ${open ? 'is-on' : ''}`} onClick={() => setOpen(!open)} aria-expanded={open}>
        <Info size={13} />
        {label}
      </button>

      {open &&
        at &&
        createPortal(
          <div className="src-pop" ref={pop} style={{ left: at.left, top: at.top, width: W, maxHeight: MAX_H }}>
            <ul className="src-pop-list">
              {sources.map((s) => {
                const Glyph = GLYPH[s.kind];
                return (
                  <li key={s.label}>
                    <button className="src-pop-row">
                      <Glyph size={14} />
                      <span>{s.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <button className="src-pop-add" onClick={onAdd}>
              <Plus size={14} />
              Add source
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
