import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import NeedsYou from './NeedsYou';
import { Handle, useColumns } from './Resizer';
import { ANALYST_NEEDS } from '../data/analystNeeds';
import { BACKUP, IDEAS, MODELS } from '../data/ideas';
import { MORE_BACKUP, MORE_IDEAS } from '../data/ideasExtra';
import { RECOMMENDED, TEMPLATES } from '../data/templates';
import type { Idea } from '../data/ideas';
import type { SrcKind } from '../data/needs';
import {
  Box,
  Check,
  Chevron,
  FileDash,
  Info,
  Left,
  Pencil,
  Plus,
  Send,
  Spark,
  SrcChat,
  SrcDoc,
  SrcDrive,
  SrcFeed,
  SrcRepo,
  SrcSheet,
  X,
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

export default function AnalystWorkspace({ onOpenTestbox }: { onOpenTestbox: () => void }) {
  const cols = useColumns({ min: 250, max: 430, start: 320 }, { min: 300, max: 470, start: 372 });
  const [selected, setSelected] = useState('i-vrt');
  const [kept, setKept] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const ideas = ALL_IDEAS.filter((i) => !dismissed.includes(i.id));
  const idea = ideas.find((i) => i.id === selected) ?? ideas[0];

  return (
    <main className="analyst" style={{ gridTemplateColumns: `minmax(0, 1fr) 6px ${cols.r}px` }}>
      <section className="workbench" style={{ gridTemplateColumns: `${cols.l}px 5px minmax(0, 1fr)` }}>
        <ResearchBackup idea={idea} />
        <Handle onDown={cols.start('l')} label="Resize research backup" />
        <IdeaGen
          onOpenTestbox={onOpenTestbox}
          ideas={ideas}
          selected={idea?.id}
          kept={kept}
          onSelect={setSelected}
          onKeep={(id) => setKept([...kept, id])}
          onDismiss={(id) => setDismissed([...dismissed, id])}
        />
      </section>

      <Handle onDown={cols.start('r')} label="Resize the right column" />
      <div className="col col-right">
        <ModelsPanel ideaId={idea?.id} ticker={idea?.ticker} onApply={onOpenTestbox} />
        <section className="card panel attention">
          <NeedsYou source={ANALYST_NEEDS} variant="bare" note="blocking your work" />
        </section>
      </div>
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
  onOpenTestbox,
  ideas,
  selected,
  kept,
  onSelect,
  onKeep,
  onDismiss,
}: {
  onOpenTestbox: () => void;
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
        <button className="btn-outline" onClick={onOpenTestbox}>
          Model testing
        </button>
      </footer>
    </section>
  );
}

/* ---------------- right top: models and templates ---------------- */

function ModelsPanel({ ideaId, ticker, onApply }: { ideaId?: string; ticker?: string; onApply: () => void }) {
  const [listOpen, setListOpen] = useState(false);
  const [tick, setTick] = useState(0);

  /* The bars creep so the panel reads as live without asking for attention. */
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 2600);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="card panel models-panel">
      <button className={`models-stat ${listOpen ? 'is-open' : ''}`} onClick={() => setListOpen(!listOpen)} aria-expanded={listOpen}>
        <span className="models-spin" />
        <span className="models-count">{MODELS.length} models running</span>
        <Chevron size={13} className={listOpen ? '' : 'is-shut'} />
      </button>

      {listOpen && (
        <ul className="models-list">
          {MODELS.map((m, i) => {
            const pct = Math.min(99, m.pct + ((tick * (i + 2)) % 7));
            return (
              <li key={m.name}>
                <span className="model-n">
                  {m.name}
                  <em>{m.on}</em>
                </span>
                <span className="model-bar">
                  <i style={{ width: `${pct}%` }} />
                </span>
                <span className="model-eta">{m.eta}</span>
                <button className="model-x" title={`Stop ${m.name}`}>
                  <X size={11} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <Templates ideaId={ideaId} ticker={ticker} onApply={onApply} />
    </section>
  );
}

function Templates({ ideaId, ticker, onApply }: { ideaId?: string; ticker?: string; onApply: () => void }) {
  const [picked, setPicked] = useState<string[]>([]);
  const [tip, setTip] = useState<string | null>(null);
  const [brief, setBrief] = useState('');
  const recommended = ideaId ? RECOMMENDED[ideaId] : undefined;

  function toggle(id: string) {
    setPicked(picked.includes(id) ? picked.filter((p) => p !== id) : [...picked, id]);
  }

  const rows = recommended
    ? [...TEMPLATES].sort((a, b) => (a.id === recommended ? -1 : b.id === recommended ? 1 : 0))
    : TEMPLATES;

  return (
    <>
      <header className="tpl-head">
        <span className="tpl-title">Templates</span>
        <span className="tpl-count">{TEMPLATES.length} saved</span>
      </header>

      <ul className="tpl-list">
        {rows.map((t) => {
          const on = picked.includes(t.id);
          return (
            <li key={t.id} className={on ? 'is-on' : ''}>
              <button className="tpl-row" onClick={() => toggle(t.id)}>
                <span className="tpl-box">
                  <span className="tpl-file">
                    <FileDash size={15} />
                  </span>
                  <span className="tpl-check">{on ? <Check size={12} /> : <Box size={14} />}</span>
                </span>

                <span className="tpl-name">
                  <em>Template /</em>
                  {t.name}
                </span>

                {t.id === recommended && <span className="tpl-rec">For {ticker}</span>}

                <span className="tpl-tools">
                  <span
                    className="tpl-i"
                    onMouseEnter={() => setTip(t.id)}
                    onMouseLeave={() => setTip(null)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Info size={13} />
                  </span>
                  <span className="tpl-i" onClick={(e) => e.stopPropagation()} title={`Edit ${t.name}`}>
                    <Pencil size={13} />
                  </span>
                </span>
              </button>

              {tip === t.id && (
                <div className="tpl-tip">
                  {t.about}
                  <em>{t.runtime}</em>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="tpl-foot">
        <input value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="Describe a model instead" />
        <button
          className={`tpl-go ${picked.length ? 'is-apply' : ''}`}
          onClick={() => picked.length && onApply()}
          title={picked.length ? 'Apply the selected templates' : 'Send'}
        >
          {picked.length ? `Apply${picked.length > 1 ? ` ${picked.length}` : ''}` : <Send size={15} />}
        </button>
      </div>
    </>
  );
}
