export const RISK_STATS = [
  { value: '1,842', label: 'Rules monitored' },
  { value: '1,284', label: 'Actions taken' },
  { value: '97.8%', label: 'Auto-resolved', bar: 97.8, tone: 'up' as const },
  { value: '3', label: 'Escalations', bar: 4, tone: 'down' as const },
];

/* ---------------- attention ---------------- */

import type { Source } from './needs';

export type RiskFact = { k: string; v: string; arrow?: boolean };

export type RiskItem = {
  id: string;
  level: 'critical' | 'review';
  tag: string;
  title: string;
  body: string;
  age: string;
  facts: RiskFact[];
  /* a test escalation is reviewed on the model bench, not approved in place */
  review?: boolean;
  approve: string;
  /* the detail view: the figures it leads with, why it stopped here, and what
     the agent would do about it */
  stats?: { k: string; v: string; tone?: 'up' | 'down' | 'warn' }[];
  raised?: string;
  recommend: string;
  suggestions: string[];
  /* what the agent read before it raised this */
  sources: Source[];
};

export const RISK_ATTENTION: RiskItem[] = [
  {
    id: 'r-0',
    level: 'critical',
    tag: 'Risk test escalation',
    title: 'NVDA gain of 4.2% outside the fitted model',
    body: 'A single-day move test flagged NVDA. The gain is 3.8 sigma past what the VaR model was fitted on, and the position now breaches the single-name cap.',
    age: '18m ago',
    review: true,
    facts: [
      { k: 'Move', v: '+4.2%' },
      { k: 'Position', v: '6.4% of NAV' },
      { k: 'Single-name cap', v: '5.0%' },
    ],
    approve: 'Open impact preview',
    stats: [
      { k: 'Day move', v: '+4.2%', tone: 'up' },
      { k: 'Past the fit by', v: '3.8σ', tone: 'warn' },
      { k: 'Over the cap by', v: '1.4pts', tone: 'down' },
    ],
    raised:
      'The move sits outside the window the model was fitted on, so the daily number cannot be trusted for this name until it is refitted. The position breach is separate and binds on its own.',
    recommend:
      'Take NVDA back to the 5.0% single-name cap and no further, roughly 2,700 shares worked over the afternoon. Refit the VaR model on the last sixty sessions before the next run so the daily number stops flagging the same move.',
    sources: [
      { label: 'var-daily (repo)', kind: 'repo' },
      { label: 'Single-day move test, 09:42', kind: 'sheet' },
      { label: 'Position file — consolidated', kind: 'sheet' },
      { label: 'Risk limits — mandate', kind: 'doc' },
      { label: 'Market data feed', kind: 'feed' },
    ],
    suggestions: [
      'Trim only as far as the single-name cap requires',
      'Replay the book against the 2020 liquidity shock first',
      'Refit the VaR model on the last sixty sessions',
    ],
  },
  {
    id: 'r-1',
    level: 'critical',
    tag: 'Approval required',
    title: 'PLTR order blocked (restricted list)',
    body: 'The portfolio manager has requested an exception to trade PLTR, which sits on the restricted list.',
    age: '41m ago',
    facts: [
      { k: 'Proposed size', v: '2.0%' },
      { k: 'Notional', v: '$4.2M' },
      { k: 'Rule', v: 'Restricted list' },
    ],
    approve: 'Approve exception',
    stats: [
      { k: 'Notional', v: '$4.2M' },
      { k: 'Proposed size', v: '2.0%' },
      { k: 'Open exceptions', v: '1', tone: 'warn' },
    ],
    raised:
      'A restricted-list block is a hard rule, so no agent can release it. The order has been sitting unfilled since 11:22 and needs a decision from risk rather than a retry.',
    recommend:
      'Approve the exception capped at 1.0% and expire it at the close, with a compliance note attached to the order. Anything larger sits inside the disclosure threshold and should wait for legal to confirm the advisory mandate scope.',
    sources: [
      { label: 'Restricted list, today 06:40', kind: 'sheet' },
      { label: 'Advisory mandate — signed', kind: 'doc' },
      { label: 'Order T-90391 audit trail', kind: 'sheet' },
      { label: 'Compliance thread — PLTR', kind: 'chat' },
    ],
    suggestions: [
      'Cap the exception at 1.0% and expire it at the close',
      'Approve for one session only, with a compliance note attached',
      'Hold until legal confirms the advisory mandate scope',
    ],
  },
  {
    id: 'r-2',
    level: 'review',
    tag: 'Review required',
    title: 'Technology sector limit increase request',
    body: 'The portfolio manager has requested an increase to the technology sector limit, from 25% to 28%.',
    age: '2h ago',
    facts: [
      { k: 'Current limit', v: '25%' },
      { k: 'Requested limit', v: '28%', arrow: true },
      { k: 'Impact', v: '17 positions' },
    ],
    approve: 'Approve increase',
    stats: [
      { k: 'Current limit', v: '25%' },
      { k: 'Requested', v: '28%', tone: 'warn' },
      { k: 'Positions affected', v: '17' },
    ],
    raised:
      'The request would take technology three points past where the mandate was last reviewed. Nothing breaches today, so this is a judgement about headroom rather than a breach to clear.',
    recommend:
      'Approve 26.5% rather than 28% and set it to be reviewed again in a month. That covers the seventeen positions already close to the line without committing the book to a larger factor bet before the next print.',
    sources: [
      { label: 'Sector exposure run, 08:10', kind: 'sheet' },
      { label: 'Risk limits — mandate', kind: 'doc' },
      { label: 'Factor decomposition', kind: 'sheet' },
      { label: 'Team drive — Q3 limits', kind: 'drive' },
      { label: 'attribution (repo)', kind: 'repo' },
    ],
    suggestions: [
      'Approve 26.5% instead and review again in a month',
      'Approve in full but tighten the single-name cap to 8%',
      'Reject and ask for the factor decomposition first',
    ],
  },
];

/* ---------------- risk state ---------------- */

export const RISK_METRICS = [
  { label: 'Portfolio VaR', value: '0.91%', limit: '≤ 1.25%', ok: true },
  { label: 'Tracking error', value: '0.9%', limit: '≤ 2.0%', ok: true },
  { label: 'Portfolio beta', value: '0.87', limit: '0.8 to 1.0', ok: true },
];

export type Exposure = { name: string; current: number; limit: number; target: number };

export const EXPOSURES: Exposure[] = [
  { name: 'Technology', current: 24, limit: 25, target: 22 },
  { name: 'Healthcare', current: 18, limit: 20, target: 17 },
  { name: 'Financials', current: 15, limit: 20, target: 16 },
  { name: 'Consumer disc.', current: 12, limit: 15, target: 12 },
  { name: 'Industrials', current: 10, limit: 15, target: 11 },
  { name: 'Utilities', current: 8, limit: 10, target: 8 },
  { name: 'Energy', current: 6, limit: 10, target: 7 },
  { name: 'Real estate', current: 4, limit: 10, target: 5 },
  { name: 'Materials', current: 4, limit: 10, target: 4 },
  { name: 'Communication', current: 4, limit: 10, target: 5 },
];

/* ---------------- protection ---------------- */

export type Slice = { label: string; count: number; pct: number; tone: string };

export const PROTECTION: Slice[] = [
  { label: 'Sector breaches', count: 412, pct: 32, tone: '#1d7de0' },
  { label: 'Position limits', count: 386, pct: 30, tone: '#12805c' },
  { label: 'VaR protection', count: 218, pct: 17, tone: '#e3a008' },
  { label: 'Liquidity', count: 147, pct: 11, tone: '#6144b8' },
  { label: 'Factor exposure', count: 91, pct: 7, tone: '#7cb3ec' },
  { label: 'Restricted assets', count: 30, pct: 2, tone: '#c33d3d' },
];

/* ---------------- activity ---------------- */

export type Activity = {
  time: string;
  title: string;
  sub: string;
  state: 'resolved' | 'review';
};

export const ACTIVITY: Activity[] = [
  { time: '08:04', title: 'AAPL order resized', sub: '3.0% to 2.5% · sector limit protection', state: 'resolved' },
  { time: '08:03', title: 'NVDA exposure rebalanced', sub: '10.4% to 9.8% · position limit', state: 'resolved' },
  { time: '08:02', title: 'TSM soft VaR breach resolved', sub: 'VaR 1.31% to 1.19%', state: 'resolved' },
  { time: '08:01', title: '142 orders screened', sub: '139 passed · 3 adjusted', state: 'resolved' },
  { time: '07:59', title: 'PLTR escalation created', sub: 'Restricted-list conflict', state: 'review' },
];

/* ---------------- evaluation ---------------- */

export const EVAL_STEPS = ['Evaluate', 'Detect breach', 'Auto-resize', 'Re-evaluate'];

export type EvalRow = {
  metric: string;
  before: string;
  proposed: string;
  adjusted: string;
  limit: string;
};

export const EVAL_ROWS: EvalRow[] = [
  { metric: 'Portfolio VaR', before: '0.91%', proposed: '1.32%', adjusted: '1.18%', limit: '≤ 1.25%' },
  { metric: 'Sector (tech)', before: '24.1%', proposed: '26.2%', adjusted: '25.0%', limit: '≤ 25%' },
  { metric: 'Position size', before: '0.0%', proposed: '3.0%', adjusted: '2.5%', limit: '≤ 10%' },
  { metric: 'Liquidity (1d)', before: '$12M', proposed: '$10.8M', adjusted: '$11.1M', limit: '≥ $5M' },
  { metric: 'Tracking error', before: '0.9%', proposed: '1.4%', adjusted: '1.2%', limit: '≤ 2.0%' },
];

/* ---------------- simulation ---------------- */

export const SIM_BUCKETS = [
  { label: 'Within tolerance', count: '4,761', pct: '98.8%', tone: '#12805c' },
  { label: 'Watch', count: '48', pct: '1.0%', tone: '#e3a008' },
  { label: 'Escalations', count: '11', pct: '0.2%', tone: '#c33d3d' },
];

export const SIM_MEASURES = [
  { id: 'var', label: 'Portfolio VaR', sub: '95%, 1 day' },
  { id: 'te', label: 'Tracking error', sub: 'Against the benchmark' },
  { id: 'beta', label: 'Portfolio beta', sub: 'Rolling 60 day' },
  { id: 'liq', label: 'Liquidity', sub: 'One day horizon' },
];

/* Intraday VaR path, seeded so it is the same on every render. */
export function simSeries(): { labels: string[]; data: number[] } {
  let s = 90210;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296 - 0.5;
  };
  const labels: string[] = [];
  const data: number[] = [];
  let v = 0.72;
  for (let i = 0; i < 96; i++) {
    v = Math.min(1.28, Math.max(0.42, v + rnd() * 0.09 + 0.0016));
    data.push(+v.toFixed(3));
    const h = Math.floor((i / 96) * 24);
    labels.push(`${((h + 11) % 12) + 1}${h < 12 ? 'AM' : 'PM'}`);
  }
  return { labels, data };
}
