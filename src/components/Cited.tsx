import { useState } from 'react';
import type { ReactElement } from 'react';
import { createPortal } from 'react-dom';
import { SrcChat, SrcDoc, SrcDrive, SrcFeed, SrcRepo, SrcSheet } from './Icons';
import type { Source, SrcKind } from '../data/needs';

const GLYPH: Record<SrcKind, (p: { size?: number }) => ReactElement> = {
  doc: SrcDoc,
  sheet: SrcSheet,
  repo: SrcRepo,
  drive: SrcDrive,
  chat: SrcChat,
  feed: SrcFeed,
};

/* Sentences, roughly. A full stop only ends one when a space follows it, which
   is what keeps 1.2% and 74.80 in one piece, and any trailing fragment is kept
   rather than dropped. */
function sentences(text: string): string[] {
  return text.match(/[\s\S]*?[.!?]+(?=\s|$)|[\s\S]+$/g)?.filter((s) => s.trim().length > 0) ?? [text];
}

type Props = {
  text: string;
  sources: Source[];
  className?: string;
  /* which source the first sentence cites, so two paragraphs in the same
     answer do not both start at [1] */
  from?: number;
};

/* Provenance, sentence by sentence.

   The marks are laid out with the text at all times so nothing reflows, and
   they only come up in ink when the reader is over the paragraph. Until then
   the answer is the only thing on the page. */
export default function Cited({ text, sources, className, from = 0 }: Props) {
  const [at, setAt] = useState<{ x: number; y: number; i: number } | null>(null);

  if (sources.length === 0) return <p className={className}>{text}</p>;

  const parts = sentences(text);

  function show(e: React.MouseEvent | React.FocusEvent, i: number) {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setAt({ x: r.left + r.width / 2, y: r.top, i });
  }

  const lit = at ? sources[at.i] : null;
  const Glyph = lit ? GLYPH[lit.kind] : null;

  return (
    <p className={`cited ${className ?? ''}`}>
      {parts.map((part, n) => {
        const i = (from + n) % sources.length;
        return (
          <span key={n}>
            {part.trim()}
            <sup className="cite">
              <button
                onMouseEnter={(e) => show(e, i)}
                onMouseLeave={() => setAt(null)}
                onFocus={(e) => show(e, i)}
                onBlur={() => setAt(null)}
                aria-label={`Source ${i + 1}: ${sources[i].label}`}
              >
                {i + 1}
              </button>
            </sup>
            {n < parts.length - 1 ? ' ' : ''}
          </span>
        );
      })}

      {at &&
        lit &&
        Glyph &&
        createPortal(
          <span className="cite-tip" style={{ left: at.x, top: at.y }}>
            <Glyph size={12} />
            <em>{lit.label}</em>
          </span>,
          document.body,
        )}
    </p>
  );
}
