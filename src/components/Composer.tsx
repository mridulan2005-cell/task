import { useEffect, useRef, useState } from 'react';
import { Chevron, Clock, Edge, FileText, Plug, Plus, Repeat, Send, Upload, X } from './Icons';
import { EDGES, matchEdges } from '../data/edges';
import type { EdgeSkill } from '../data/edges';
import { DAYS, scheduleLabel } from '../data/tasks';
import type { Repeat as RepeatKind, Schedule } from '../data/tasks';

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
  /* The clock only belongs to tasks, because only a task can run again. */
  clock?: boolean;
  schedule?: Schedule | null;
  onSchedule?: (s: Schedule | null) => void;
};

let fileSeq = 0;

export default function Composer({
  value,
  onChange,
  onSend,
  placeholder,
  attachments,
  onDetach,
  onAttach,
  edge,
  onEdge,
  clock = false,
  schedule = null,
  onSchedule,
}: Props) {
  const [menu, setMenu] = useState(false);
  const [edgesOpen, setEdgesOpen] = useState(false);
  const [clockOpen, setClockOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const picker = useRef<HTMLInputElement>(null);

  /* A leading slash turns the field into an edge picker. */
  const slash = value.startsWith('/') ? value.slice(1) : null;
  const slashHits = slash === null ? [] : matchEdges(slash);

  useEffect(() => {
    if (!menu && !clockOpen) return;
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
  }, [menu, clockOpen]);

  function shut() {
    setMenu(false);
    setEdgesOpen(false);
    setClockOpen(false);
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
      {(attachments.length > 0 || edge || schedule) && (
        <div className="cmp-tags">
          {schedule && (
            <button className="cmp-sched" onClick={() => onSchedule?.(null)} data-tip="Drop the schedule">
              <Clock size={13} />
              {scheduleLabel(schedule)}
              <X size={11} />
            </button>
          )}

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

        {clock && (
          <button
            className={`ai-clock ${clockOpen || schedule ? 'is-on' : ''}`}
            onClick={() => setClockOpen(!clockOpen)}
            title="Schedule this task"
          >
            <Clock size={15} />
          </button>
        )}

        <button className="ai-send" onClick={onSend} disabled={!value.trim()} title="Send">
          <Send />
        </button>
      </div>

      <input ref={picker} type="file" multiple hidden onChange={(e) => files(e.target.files)} />

      {clockOpen && (
        <ScheduleMenu
          schedule={schedule}
          onPick={(s) => {
            onSchedule?.(s);
            setClockOpen(false);
          }}
        />
      )}

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

/* Scheduling is the whole difference between a task and a question, so the
   clock opens onto the two decisions that matter and nothing else: how often,
   and at what time. */
function ScheduleMenu({ schedule, onPick }: { schedule: Schedule | null; onPick: (s: Schedule | null) => void }) {
  const [repeat, setRepeat] = useState<RepeatKind>(schedule?.repeat ?? 'daily');
  const [time, setTime] = useState(schedule?.time ?? '07:30');
  const [day, setDay] = useState(schedule?.day ?? DAYS[0]);

  return (
    <div className="cmp-menu is-clock">
      <div className="sch-h">
        <Repeat size={13} />
        Schedule task
      </div>

      <div className="sch-seg">
        {(['once', 'daily', 'weekly'] as RepeatKind[]).map((r) => (
          <button key={r} className={repeat === r ? 'is-on' : ''} onClick={() => setRepeat(r)}>
            {r === 'once' ? 'Once' : r === 'daily' ? 'Daily' : 'Weekly'}
          </button>
        ))}
      </div>

      {repeat === 'weekly' && (
        <label className="sch-field">
          On
          <select value={day} onChange={(e) => setDay(e.target.value)}>
            {DAYS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
      )}

      <label className="sch-field">
        At
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </label>

      <div className="sch-acts">
        <button className="btn-dark" onClick={() => onPick({ repeat, time, day: repeat === 'weekly' ? day : undefined })}>
          {schedule ? 'Update' : 'Schedule'}
        </button>
        {schedule && (
          <button className="btn-quiet" onClick={() => onPick(null)}>
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
