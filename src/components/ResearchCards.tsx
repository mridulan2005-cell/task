import type { ReactElement } from 'react';
import { ArrowOut, Bars, Bulb, Search, SearchAi, SrcDoc, SrcSheet } from './Icons';
import { IDEAS } from '../data/ideas';
import { MORE_IDEAS } from '../data/ideasExtra';
import { ACTIVITY } from '../data/research';
import type { ActKind } from '../data/research';

/* The two cards that make the analyst's dashboard its own thing.

   A portfolio manager reads weights and P/L. An analyst reads what has been
   read: which ideas surfaced today, and what the agents went through to
   surface them. Both cards are ways into the workspace rather than places to
   work, so a row opens the idea hub and nothing here is editable. */

const ALL = [...IDEAS, ...MORE_IDEAS];

export function IdeasFeed({ onGo }: { onGo?: () => void }) {
  const fresh = ALL.filter((i) => i.state === 'new');
  const rest = ALL.filter((i) => i.state !== 'new');
  const rows = [...fresh, ...rest].slice(0, 6);

  return (
    <section className="card">
      <header className="card-head">
        <div>
          <div className="card-title">Ideas surfaced</div>
          <div className="card-sub">
            {fresh.length} new today &middot; {ALL.length} live in the hub
          </div>
        </div>
        <button className="view-all" onClick={onGo}>
          Open the hub
          <ArrowOut size={12} />
        </button>
      </header>

      <ul className="rsh-list">
        {rows.map((i) => (
          <li key={i.id}>
            <button onClick={onGo}>
              <span className="rsh-tick">{i.ticker}</span>
              <span className="rsh-c">
                <span className="rsh-t">{i.thesis}</span>
                <span className="rsh-s">
                  {i.angle} &middot; {i.sources} sources &middot; {i.origin}
                </span>
              </span>
              {i.state === 'new' ? (
                <span className="idea-new">
                  <SearchAi size={13} />
                  new
                </span>
              ) : (
                <span className="rsh-age">{i.age}</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* One glyph per kind of work, and the colour carries the kind rather than a
   status: reading is blue, a find is amber, a model green, a screen slate, an
   analysis navy, a summary teal. */
const ACT_GLYPH: Record<ActKind, (p: { size?: number }) => ReactElement> = {
  read: SrcDoc,
  spot: Bulb,
  model: SrcSheet,
  screen: Search,
  analyse: Bars,
  summarise: SrcDoc,
};

export function ResearchActivity() {
  return (
    <section className="card">
      <header className="card-head">
        <div className="card-title">Research Agent Activity</div>
        {/* the feed is still filling, and says so rather than looking stale */}
        <span className="rsh-live">
          <i />
          Live
        </span>
      </header>

      <ul className="act-list">
        {ACTIVITY.map((a) => {
          const Glyph = ACT_GLYPH[a.kind];
          return (
            <li key={a.id}>
              <span className="act-when">{a.time}</span>
              <span className={`act-ic k-${a.kind}`}>
                <Glyph size={16} />
              </span>
              <span className="act-t">{a.text}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
