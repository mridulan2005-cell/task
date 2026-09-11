import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { Handle, useColumns } from './Resizer';
import { BACKUP, IDEAS } from '../data/ideas';
import { MORE_BACKUP, MORE_IDEAS } from '../data/ideasExtra';
import type { Idea } from '../data/ideas';
import type { AiContext } from '../data/ai';
import type { SrcKind } from '../data/needs';
import {
  ArrowOut,
  Chevron,
  Pencil,
  Plus,
  SearchAi,
  Send,
  Trash,
  SrcChat,
  SrcDoc,
  SrcDrive,
  SrcFeed,
  SrcRepo,
  SrcSheet,
} from './Icons';

const ALL_IDEAS = [...IDEAS, ...MORE_IDEAS];
const ALL_BACKUP = { ...BACKUP, ...MORE_BACKUP };

const GLYPH: Record<SrcKind, (p: { size?: number }) => ReactElement> = {
  doc: SrcDoc,
  sheet: SrcSheet,
  repo: SrcRepo,
  drive: SrcDrive,
  chat: SrcChat,
  feed: SrcFeed,
};

export default function AnalystWorkspace({ onContext }: { onContext: (c: AiContext | null) => void }) {
  /* Research backup is the reading column, so it starts wide enough to read
     in and can be pulled wider still. */
  const cols = useColumns({ min: 280, max: 560, start: 392 }, { min: 250, max: 420, start: 296 });
  const [selected, setSelected] = useState('i-vrt');
  const [dismissed, setDismissed] = useState<string[]>([]);
  /* a thesis the analyst rewrote, held over the one the agent filed */
  const [edits, setEdits] = useState<Record<string, string>>({});

  /* What the agents surfaced since you last looked sits at the top, together.
     Everything else keeps the order it was filed in, so the list does not
     rearrange itself under you for any other reason. */
  const ideas = ALL_IDEAS.filter((i) => !dismissed.includes(i.id))
    .map((i) => (edits[i.id] ? { ...i, thesis: edits[i.id] } : i))
    .sort((a, b) => Number(b.state === 'new') - Number(a.state === 'new'));
  const idea = ideas.find((i) => i.id === selected) ?? ideas[0];

  /* The copilot shows templates in this phase, and picks its recommendation
     from whichever idea is open. */
  useEffect(() => {
    if (!idea) return onContext(null);
    onContext({
      id: idea.id,
      kind: 'idea',
      title: `${idea.ticker} · ${idea.angle}`,
      sub: idea.thesis,
      questions: [],
    });
  }, [idea, onContext]);

  return (
    <div className="analyst is-widget">
      <section className="workbench" style={{ gridTemplateColumns: `${cols.l}px 5px minmax(0, 1fr)` }}>
        <ResearchBackup idea={idea} />
        <Handle onDown={cols.start('l')} label="Resize research backup" />
        <IdeaGen
          ideas={ideas}
          selected={idea?.id}
          onSelect={setSelected}
          onEdit={(id, thesis) => setEdits({ ...edits, [id]: thesis })}
          onDismiss={(id) => setDismissed([...dismissed, id])}
        />
      </section>

    </div>
  );
}

/* ---------------- left: research backup ---------------- */

function ResearchBackup({ idea }: { idea?: Idea }) {
  const [showSources, setShowSources] = useState(false);
  const backup = idea ? ALL_BACKUP[idea.id] : undefined;

  if (!idea || !backup)
    return (
      <section className="card panel">
        <div className="empty">
          <strong>No idea selected.</strong>
          <span>Pick one from the middle column to see what backs it.</span>
        </div>
      </section>
    );

  const verified = backup.sources.filter((s) => s.state === 'verified').length;

  return (
    <section className="card panel backup">
      <header className="panel-head">
        <div>
          <div className="card-title">Research backup</div>
          <div className="card-sub">
            {idea.ticker} &middot; {idea.angle}
          </div>
        </div>
        <button className={`src-pill ${showSources ? 'is-on' : ''}`} onClick={() => setShowSources(!showSources)}>
          Sources
          <em>{backup.sources.length}</em>
          <Chevron size={12} className={showSources ? '' : 'is-shut'} />
        </button>
      </header>

      {/* Sources take the panel rather than sitting above the reading. What
          was read and what was written from it are two things to look at, not
          one, so only one of them is on screen at a time. */}
      <div className="panel-body">
        {showSources ? (
          <ul className="src-list">
            <li className="src-add">
              <button>
                <Plus size={14} />
                Add a source
              </button>
            </li>

            {backup.sources.map((s) => {
              const Glyph = GLYPH[s.kind];
              return (
                <li key={s.label}>
                  <button title={`Open ${s.label}`}>
                    <Glyph />
                    <span className="src-l">{s.label}</span>
                    <span className={`src-state s-${s.state}`}>{s.state === 'verified' ? 'Verified' : 'Unverified'}</span>
                    <ArrowOut size={12} />
                  </button>
                </li>
              );
            })}

            <li className="src-note">
              {verified} verified &middot; {backup.sources.length - verified} unverified
            </li>
          </ul>
        ) : (
          <>
            <p className="backup-sum">{backup.summary}</p>

            {backup.notes.map((n) => (
              <section className="note" key={n.h}>
                <h4>{n.h}</h4>
                <p>{n.body}</p>
              </section>
            ))}
          </>
        )}
      </div>

      {!showSources && (
      <footer className="panel-foot">
        <div className="block-h as-label">Recommended next</div>
        <ul className="next-list">
          {backup.next.map((t, i) => (
            <li key={t.label} className={i === 0 ? 'is-primary' : ''}>
              <button>
                <span className="next-t">
                  <span className="next-l">{t.label}</span>
                  <span className="next-d">{t.detail}</span>
                </span>
                <span className="next-cost">{t.cost}</span>
                <span className="next-go">
                  <Send size={13} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </footer>
      )}
    </section>
  );
}

/* ---------------- middle: idea gen ---------------- */

function IdeaGen({
  ideas,
  selected,
  onSelect,
  onEdit,
  onDismiss,
}: {
  ideas: Idea[];
  selected?: string;
  onSelect: (id: string) => void;
  /* rewriting the thesis is how an idea is changed; nothing else on the card
     is the analyst's to set */
  onEdit: (id: string, thesis: string) => void;
  onDismiss: (id: string) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  function begin(idea: Idea) {
    setEditing(idea.id);
    setDraft(idea.thesis);
  }

  function commit() {
    if (editing && draft.trim()) onEdit(editing, draft.trim());
    setEditing(null);
  }

  return (
    <section className="card panel ideagen">
      <header className="panel-head">
        <div>
          <div className="card-title">Idea Gen</div>
          <div className="card-sub">{ideas.length} live &middot; agents adding through the day</div>
        </div>
        <button className="ghost-b">
          <Plus size={13} />
          New idea
        </button>
      </header>

      <div className="panel-body">
        <ul className="ideas">
          {ideas.map((idea) => {
            /* An idea the agents raised. It says so on the card and nothing
               else changes, because the analyst does not have to accept an
               idea before reading it. */
            const fresh = idea.state === 'new';
            const on = idea.id === selected;

            /* The head reads the same whether the card is being read or
               rewritten, so the row never changes shape underneath you. */
            const head = (
              <span className="idea-head">
                <span className="idea-tick">{idea.ticker}</span>
                <span className="idea-name">{idea.name}</span>
                {fresh ? (
                  <span className="idea-new" title={`Found by ${idea.origin.toLowerCase()}`}>
                    <SearchAi size={13} />
                    new
                  </span>
                ) : (
                  <span className={`idea-state s-${idea.state}`}>{idea.state}</span>
                )}
              </span>
            );

            return (
              <li key={idea.id} className={`idea-row ${on ? 'is-on' : ''}`}>
                {/* while it is being rewritten the card is not a button, so
                    the field keeps its own Enter and Escape */}
                {editing === idea.id ? (
                  <div className={`idea is-editing ${fresh ? 'is-fresh' : ''} ${on ? 'is-on' : ''}`}>
                    {head}
                    <input
                      className="idea-edit"
                      value={draft}
                      autoFocus
                      onChange={(e) => setDraft(e.target.value)}
                      onBlur={commit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commit();
                        if (e.key === 'Escape') setEditing(null);
                      }}
                    />
                  </div>
                ) : (
                  <button className={`idea ${fresh ? 'is-fresh' : ''} ${on ? 'is-on' : ''}`} onClick={() => onSelect(idea.id)}>
                    {head}
                    <span className="idea-thesis">{idea.thesis}</span>
                    {!fresh && (
                      <span className="idea-meta">
                        {idea.sources} sources &middot; {idea.age}
                      </span>
                    )}
                  </button>
                )}

                {/* The two things you can do to an idea you did not ask for,
                    kept off the card until the pointer is on it. */}
                <span className="idea-tools">
                  <button title="Change this idea" onClick={() => begin(idea)}>
                    <Pencil size={13} />
                  </button>
                  <button title="Remove this idea" onClick={() => onDismiss(idea.id)}>
                    <Trash size={13} />
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <footer className="panel-foot is-right">
        <span className="ideagen-note">Agents keep adding through the day</span>
      </footer>
    </section>
  );
}
