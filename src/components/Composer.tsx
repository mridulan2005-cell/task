import { useEffect, useRef, useState } from 'react';
import { Chevron, Edge, FileText, Plug, Plus, Send, Upload, X } from './Icons';
import { EDGES, matchEdges } from '../data/edges';
import type { EdgeSkill } from '../data/edges';

export type Attachment = {
  id: string;
  kind: 'text' | 'file' | 'image';
  /* shown on the chip itself; only the text kind carries a visible label */
  label: string;
  /* the full thing that is tagged, read on hover */
  tip: string;
  src?: string;
};

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  placeholder: string;
  attachments: Attachment[];
  onDetach: (id: string) => void;
  onAttach: (a: Attachment[]) => void;
  edge: EdgeSkill | null;
  onEdge: (e: EdgeSkill | null) => void;
};

let fileSeq = 0;

export default function Composer({ value, onChange, onSend, placeholder, attachments, onDetach, onAttach, edge, onEdge }: Props) {
  const [menu, setMenu] = useState(false);
  const [edgesOpen, setEdgesOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const picker = useRef<HTMLInputElement>(null);

  /* A leading slash turns the field into an edge picker. */
  const slash = value.startsWith('/') ? value.slice(1) : null;
  const slashHits = slash === null ? [] : matchEdges(slash);

  useEffect(() => {
    if (!menu) return;
    function away(e: MouseEvent) {
      if (!wrap.current?.contains(e.target as Node)) shut();
    }
    function esc(e: KeyboardEvent) {
      if (e.key === 'Escape') shut();
    }
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [menu]);

  function shut() {
    setMenu(false);
    setEdgesOpen(false);
  }

  function pickEdge(e: EdgeSkill) {
    onEdge(e);
    if (slash !== null) onChange('');
    shut();
  }

  function files(list: FileList | null) {
    if (!list?.length) return;
    const next: Attachment[] = Array.from(list).map((f) => ({
      id: `f${fileSeq++}`,
      kind: f.type.startsWith('image/') ? 'image' : 'file',
      label: f.name,
      tip: `${f.name} · ${Math.max(1, Math.round(f.size / 1024))} KB`,
      src: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
    }));
    onAttach(next);
    shut();
  }

  return (
    <div className="ai-compose" ref={wrap}>
      {(attachments.length > 0 || edge) && (
        <div className="cmp-tags">
          {edge && (
            <button className="cmp-edge" onClick={() => onEdge(null)} data-tip={edge.hint}>
              <Edge size={13} />
              {edge.name}
              <X size={11} />
            </button>
          )}

          {attachments.map((a) =>
            a.kind === 'text' ? (
              <button key={a.id} className="cmp-tag is-text" onClick={() => onDetach(a.id)} data-tip={a.tip}>
                <span className="cmp-tag-l">{a.label}</span>
                <X size={11} />
              </button>
            ) : (
              <button key={a.id} className="cmp-tag is-media" onClick={() => onDetach(a.id)} data-tip={a.tip}>
                {a.kind === 'image' && a.src ? <img src={a.src} alt="" /> : <FileText size={20} />}
                <span className="cmp-tag-x">
                  <X size={9} />
                </span>
              </button>
            ),
          )}
        </div>
      )}

      <div className="cmp-row">
        <button className={`ai-plus ${menu ? 'is-on' : ''}`} onClick={() => setMenu(!menu)} title="Add context">
          <Plus size={15} />
        </button>

        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            if (slashHits.length) return pickEdge(slashHits[0]);
            onSend();
          }}
          placeholder={placeholder}
        />

        <button className="ai-send" onClick={onSend} disabled={!value.trim()} title="Send">
          <Send />
        </button>
      </div>

      <input ref={picker} type="file" multiple hidden onChange={(e) => files(e.target.files)} />

      {menu && (
        <div className="cmp-menu">
          <button onClick={() => picker.current?.click()}>
            <Upload size={15} />
            Upload files
          </button>
          <button>
            <Plug size={15} />
            Connectors
          </button>
          <button className={edgesOpen ? 'is-open' : ''} onClick={() => setEdgesOpen(!edgesOpen)}>
            <Edge size={15} />
            Edges
            <Chevron size={12} className={`cmp-menu-c ${edgesOpen ? '' : 'is-shut'}`} />
          </button>
          {edgesOpen && (
            <div className="cmp-edges">
              {EDGES.map((e) => (
                <button key={e.id} onClick={() => pickEdge(e)} data-tip={e.hint}>
                  {e.name}
                  <em>/{e.id}</em>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {slashHits.length > 0 && !menu && (
        <div className="cmp-menu is-slash">
          {slashHits.map((e) => (
            <button key={e.id} onClick={() => pickEdge(e)} data-tip={e.hint}>
              <Edge size={15} />
              {e.name}
              <em>/{e.id}</em>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
