import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { Handle, useColumns } from './Resizer';
import { BACKUP, IDEAS } from '../data/ideas';
import { MORE_BACKUP, MORE_IDEAS } from '../data/ideasExtra';
import type { Idea } from '../data/ideas';
import type { AiContext } from '../data/ai';
import type { SrcKind } from '../data/needs';
import {
  Chevron,
  Plus,
  Send,
  Spark,
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
  const cols = useColumns({ min: 210, max: 400, start: 258 }, { min: 250, max: 420, start: 296 });
  const [selected, setSelected] = useState('i-vrt');
  const [kept, setKept] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const ideas = ALL_IDEAS.filter((i) => !dismissed.includes(i.id));
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
    <main className="analyst">
      <section className="workbench" style={{ gridTemplateColumns: `${cols.l}px 5px minmax(0, 1fr)` }}>
        <ResearchBackup idea={idea} />
        <Handle onDown={cols.start('l')} label="Resize research backup" />
        <IdeaGen
          ideas={ideas}
          selected={idea?.id}
          kept={kept}
          onSelect={setSelected}
          onKeep={(id) => setKept([...kept, id])}
          onDismiss={(id) => setDismissed([...dismissed, id])}
        />
      </section>

    </main>
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

      <div className="panel-body">
        {showSources && (
          <ul className="src-list">
            <li className="src-note">
              {verified} verified &middot; {backup.sources.length - verified} unverified
            </li>
            {backup.sources.map((s) => {
              const Glyph = GLYPH[s.kind];
              return (
                <li key={s.label}>
                  <Glyph />
                  <span className="src-l">{s.label}</span>
                  <span className={`src-state s-${s.state}`}>{s.state === 'verified' ? 'Verified' : 'Unverified'}</span>
                </li>
              );
            })}
          </ul>
        )}

        <p className="backup-sum">{backup.summary}</p>

        {backup.notes.map((n) => (
          <section className="note" key={n.h}>
            <h4>{n.h}</h4>
            <p>{n.body}</p>
          </section>
        ))}
      </div>

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
    </section>
  );
}

/* ---------------- middle: idea gen ---------------- */

function IdeaGen({
  ideas,
  selected,
  kept,
  onSelect,
  onKeep,
  onDismiss,
}: {
  ideas: Idea[];
  selected?: string;
  kept: string[];
  onSelect: (id: string) => void;
  onKeep: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
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
            const fresh = idea.state === 'new' && !kept.includes(idea.id);
            return (
              <li key={idea.id}>
                <button
                  className={`idea ${fresh ? 'is-fresh' : ''} ${idea.id === selected ? 'is-on' : ''}`}
                  onClick={() => onSelect(idea.id)}
                >
                  {fresh && (
                    <span className="idea-flag">
                      <Spark size={11} />
                      New, identified by {idea.origin.toLowerCase()}
                    </span>
                  )}

                  <span className="idea-head">
                    <span className="idea-tick">{idea.ticker}</span>
                    <span className="idea-name">{idea.name}</span>
                    <span className={`idea-state s-${idea.state}`}>{idea.state}</span>
                  </span>

                  <span className="idea-thesis">{idea.thesis}</span>

                  <span className="idea-line">
                    <span className="idea-conv">
                      Conviction
                      <b>{idea.conviction}%</b>
                    </span>
                    <span className="idea-meta">
                      {idea.sources} sources &middot; {idea.age}
                    </span>
                  </span>

                  {fresh && (
                    <span className="idea-actions">
                      <span
                        className="idea-dismiss"
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismiss(idea.id);
                        }}
                      >
                        Dismiss
                      </span>
                      <span
                        className="idea-keep"
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          onKeep(idea.id);
                        }}
                      >
                        Keep
                      </span>
                    </span>
                  )}
                </button>
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
