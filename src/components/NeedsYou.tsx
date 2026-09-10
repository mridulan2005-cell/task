import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { NEEDS_YOU } from '../data/needs';
import type { Item, SrcKind } from '../data/needs';
import {
  Alert,
  Chevron,
  Info,
  Left,
  Pencil,
  Plus,
  Send,
  SrcChat,
  SrcDoc,
  SrcDrive,
  SrcFeed,
  SrcRepo,
  SrcSheet,
} from './Icons';

type Props = {
  source?: Item[];
  /* 'card' stands on its own; 'bare' sits inside a panel that already has chrome. */
  variant?: 'card' | 'bare';
  note?: string;
};

export default function NeedsYou({ source = NEEDS_YOU, variant = 'card', note = 'blocking the desk' }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);

  const items = source.filter((i) => !done.includes(i.id));
  const open = items.find((i) => i.id === openId) ?? null;
  const blocking = items.filter((i) => i.priority === 'critical').length;

  function resolve(id: string) {
    setDone([...done, id]);
    setOpenId(null);
  }

  if (open)
    return <Detail item={open} variant={variant} onBack={() => setOpenId(null)} onResolve={() => resolve(open.id)} />;

  return (
    <section className={variant === 'bare' ? 'needs is-bare' : 'card needs'}>
      <header className="card-head">
        <div>
          <div className="card-title">What needs you right now</div>
          <div className="card-sub">
            {items.length} open &middot; {blocking} {note}
          </div>
        </div>
        <span className="live">
          <i />
          Live
        </span>
      </header>

      <ul className="needs-list">
        {items.map((it) => (
          <li key={it.id} className={`need p-${it.priority}`}>
            <button className="need-row" onClick={() => setOpenId(it.id)}>
              <span className="need-mark">{it.priority === 'critical' ? <Alert size={17} /> : <i />}</span>
              <span className="need-title">{it.title}</span>
              <span className="need-age">{it.age}</span>
            </button>
          </li>
        ))}
      </ul>

      {items.length === 0 && (
        <div className="empty">
          <strong>Nothing is waiting on you.</strong>
          <span>Agents are running inside their mandates. You will be pinged when that changes.</span>
        </div>
      )}
    </section>
  );
}

/* ---------------- detail ---------------- */

function Detail({ item, variant, onBack, onResolve }: { item: Item; variant: string; onBack: () => void; onResolve: () => void }) {
  const [pick, setPick] = useState(0);
  const [text, setText] = useState(item.options[0].text);
  const [editing, setEditing] = useState(false);
  const [ctxOpen, setCtxOpen] = useState(false);
  const box = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) box.current?.focus();
  }, [editing]);

  function cycle() {
    const next = (pick + 1) % item.options.length;
    setPick(next);
    setText(item.options[next].text);
    setEditing(false);
  }

  return (
    <section className={variant === 'bare' ? 'detail is-bare' : 'card detail'}>
      <header className="detail-head">
        <button className="icon-btn" onClick={onBack} aria-label="Back to the queue">
          <Left />
        </button>
        <span className="detail-title">{item.title}</span>
        <Sources item={item} />
      </header>

      <div className="detail-body">
        <ul className="impact">
          {item.impactStats.map((s) => (
            <li key={s.k}>
              <span className="impact-k">{s.k}</span>
              <span className={`impact-v ${s.tone ?? ''}`}>{s.v}</span>
            </li>
          ))}
        </ul>

        <section className="raised-box">
          <p className="raised">{item.raised}</p>
          <ul className="notes">
            {item.evidence.map((e) => (
              <li key={e.k}>
                <span className="notes-k">{e.k}</span>
                <span className="notes-v">{e.v}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="block block-ctx">
          <button className="block-h" onClick={() => setCtxOpen(!ctxOpen)} aria-expanded={ctxOpen}>
            Context
            <Chevron size={13} className={ctxOpen ? '' : 'is-shut'} />
          </button>
          {ctxOpen && <p className="ctx">{item.context}</p>}
        </section>
      </div>

      <div className="detail-foot">
        <div className="block-h as-label">Recommended</div>
        <div className={`rec ${editing ? 'is-editing' : ''}`}>
          {editing ? (
            <textarea ref={box} value={text} onChange={(e) => setText(e.target.value)} onBlur={() => setEditing(false)} rows={4} />
          ) : (
            <p>{text}</p>
          )}
          <div className="rec-foot">
            <span className="rec-via">via {item.via}</span>
            <button className="icon-btn" onClick={() => setEditing(!editing)} title="Edit the recommendation">
              <Pencil />
            </button>
            <button className="rec-pill" onClick={cycle} title="Try another option">
              {item.options[pick].label}
              <Chevron size={12} />
            </button>
            <button className="rec-go" onClick={onResolve} title="Approve and send">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- sources ---------------- */

const GLYPH: Record<SrcKind, (p: { size?: number }) => ReactElement> = {
  doc: SrcDoc,
  sheet: SrcSheet,
  repo: SrcRepo,
  drive: SrcDrive,
  chat: SrcChat,
  feed: SrcFeed,
};

function Sources({ item }: { item: Item }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function away(e: MouseEvent) {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, [open]);

  return (
    <div className="src" ref={wrap}>
      <button className={`src-btn ${open ? 'is-on' : ''}`} onClick={() => setOpen(!open)} aria-expanded={open}>
        <Info size={15} />
        <span className="src-word">sources</span>
      </button>

      {open && (
        <div className="src-pop">
          <ul>
            {item.sources.map((s) => {
              const Glyph = GLYPH[s.kind];
              return (
                <li key={s.label}>
                  <button>
                    <Glyph />
                    <span>{s.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <button className="src-add">
            <Plus size={14} />
            Add source
          </button>
        </div>
      )}
    </div>
  );
}
