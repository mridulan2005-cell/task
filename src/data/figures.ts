import type { Intent } from './ai';

/* The small chart that comes back with an answer.

   A question asked of a stretch of a chart deserves an answer with a shape,
   not only a paragraph. Which shape depends on what was asked: a cause wants
   the move split into its parts, a comparison wants a zero line, a limit
   question wants the cap drawn, and an explanation of a figure wants the
   figure over time. Four forms cover every question the copilot answers, and
   nothing here invents a fifth for variety. */

export type WaterfallStep = {
  label: string;
  value: number;
  /* the closing bar, which stands on the axis rather than on the one before */
  total?: boolean;
};

export type SpreadRow = { label: string; value: number };

export type LimitRow = { label: string; now: number; after: number; cap: number };

export type LinePoint = { at: string; value: number };

export type Figure =
  | { kind: 'waterfall'; title: string; note: string; unit: string; steps: WaterfallStep[] }
  | { kind: 'spread'; title: string; note: string; unit: string; rows: SpreadRow[] }
  | { kind: 'limits'; title: string; note: string; unit: string; rows: LimitRow[]; after: string }
  | { kind: 'line'; title: string; note: string; unit: string; points: LinePoint[]; ref: { value: number; label: string } };

/* A question asked by dragging a section out of a chart carries the chart and
   the range in its quote. The figure repeats that range so the answer is
   visibly about the thing that was selected. */
function rangeOf(quote: string): string | null {
  const first = quote.split('  ·  ')[0];
  return first.includes(' · ') ? first : null;
}

const MARK: LinePoint[] = [
  { at: '09:30', value: 5.8 },
  { at: '10:15', value: 5.9 },
  { at: '11:00', value: 6.1 },
  { at: '11:45', value: 6.0 },
  { at: '12:30', value: 6.2 },
  { at: '13:15', value: 6.4 },
  { at: '14:00', value: 6.3 },
  { at: '14:45', value: 6.2 },
  { at: '15:30', value: 6.2 },
];

export function figureFor(intent: Intent, subject: string, quote: string): Figure {
  const range = rangeOf(quote);
  /* A title leads a line, so it takes a capital even when the subject is a
     phrase rather than a ticker. */
  const Subject = subject.charAt(0).toUpperCase() + subject.slice(1);

  if (intent === 'why')
    return {
      kind: 'waterfall',
      title: `What moved ${subject}`,
      note: range ?? 'Points of the move, split by driver',
      unit: 'pts',
      steps: [
        { label: 'Sector re-rating', value: 2.2 },
        { label: 'Position specific', value: 0.9 },
        { label: 'Residual', value: 0.3 },
        { label: 'Move on the day', value: 3.4, total: true },
      ],
    };

  if (intent === 'compare')
    return {
      kind: 'spread',
      title: `${Subject} against its references`,
      note: range ?? 'Points ahead or behind, over the range on screen',
      unit: 'pts',
      rows: [
        { label: 'S&P 500', value: 4.1 },
        { label: 'Peer median', value: 1.6 },
        { label: 'Semis index', value: -2.3 },
      ],
    };

  if (intent === 'risk')
    return {
      kind: 'limits',
      title: 'Where the limits stand',
      note: range ?? 'Against the mandate, now and after a 1.4% trim',
      unit: '%',
      after: 'after the trim',
      rows: [
        { label: 'Sector cap', now: 21.3, after: 19.9, cap: 20 },
        { label: 'Single name', now: 7.4, after: 6.9, cap: 8 },
        { label: 'Tracking error', now: 1.1, after: 0.9, cap: 1.5 },
      ],
    };

  if (intent === 'act')
    return {
      kind: 'limits',
      title: 'What the trim clears',
      note: range ?? `Taking 1.4% out of ${subject} over the last hour`,
      unit: '%',
      after: 'after the trim',
      rows: [
        { label: 'Sector cap', now: 21.3, after: 19.9, cap: 20 },
        { label: 'Single name', now: 7.4, after: 6.9, cap: 8 },
        { label: 'Of average volume', now: 12, after: 14.6, cap: 15 },
      ],
    };

  return {
    kind: 'line',
    title: `${Subject} through the session`,
    note: range ?? 'The mark, against the realised figure',
    unit: '% of gross',
    points: MARK,
    ref: { value: 4.1, label: 'Realised' },
  };
}
