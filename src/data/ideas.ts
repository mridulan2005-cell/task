import type { SrcKind } from './needs';

export type IdeaState = 'new' | 'open' | 'testing' | 'parked';

export type Idea = {
  id: string;
  ticker: string;
  name: string;
  thesis: string;
  angle: string;
  state: IdeaState;
  sources: number;
  age: string;
  origin: string;
};

export const IDEAS: Idea[] = [
  {
    id: 'i-vrt',
    ticker: 'VRT',
    name: 'Vertiv Holdings',
    thesis: 'The power and cooling retrofit cycle is running ahead of the reported backlog.',
    angle: 'Data centre power',
    state: 'new',
    sources: 46,
    age: '12m',
    origin: 'Screener agent',
  },
  {
    id: 'i-avgo',
    ticker: 'AVGO',
    name: 'Broadcom Inc',
    thesis: 'Custom silicon mix shift lifts gross margin a full point ahead of consensus.',
    angle: 'Mix shift',
    state: 'new',
    sources: 31,
    age: '2h',
    origin: 'News agent',
  },
  {
    id: 'i-nee',
    ticker: 'NEE',
    name: 'NextEra Energy',
    thesis: 'The rate path repricing overshoots what the regulated base actually earns.',
    angle: 'Rate sensitivity',
    state: 'open',
    sources: 18,
    age: '1d',
    origin: 'You',
  },
  {
    id: 'i-de',
    ticker: 'DE',
    name: 'Deere & Co',
    thesis: 'Used inventory clearing through the channel marks the trough in orders.',
    angle: 'Channel inventory',
    state: 'testing',
    sources: 24,
    age: '3d',
    origin: 'Screener agent',
  },
  {
    id: 'i-shel',
    ticker: 'SHEL',
    name: 'Shell plc',
    thesis: 'Refining spreads normalise faster than the pair against XOM implies.',
    angle: 'Pair trade',
    state: 'parked',
    sources: 12,
    age: '5d',
    origin: 'You',
  },
];

export type Source = { label: string; kind: SrcKind; state: 'verified' | 'unverified' };

export type Backup = {
  summary: string;
  notes: { h: string; body: string }[];
  sources: Source[];
  next: { label: string; detail: string; cost: string }[];
};

export const BACKUP: Record<string, Backup> = {
  'i-vrt': {
    summary:
      'Screener flagged Vertiv after three unrelated feeds moved the same direction inside a week. The case rests on retrofit demand that shows up in utility filings before it shows up in the order book.',
    notes: [
      {
        h: 'What the filings say',
        body: 'Eleven of the sixteen utilities serving the top data centre corridors filed load-growth revisions upward this quarter. The median revision is 4.2 points, the largest since 2021, and none of it appears in Vertiv guidance yet.',
      },
      {
        h: 'Where the case is weak',
        body: 'Two of six sources put the backlog at $7.4B against the four that report $6.9B. The gap is a reporting boundary, not a dispute over demand, but it changes the entry multiple by roughly a turn.',
      },
      {
        h: 'What the tape shows',
        body: 'The name has run 3.4% today and 11% over the month on no company news. Volume is 1.8x the twenty day average, which is consistent with the thesis leaking rather than with a positioning squeeze.',
      },
    ],
    sources: [
      { label: 'Utility load filings, 16 filers', kind: 'sheet', state: 'verified' },
      { label: 'Vertiv Q3 transcript', kind: 'doc', state: 'verified' },
      { label: 'Backlog comparison, 46 sources', kind: 'sheet', state: 'unverified' },
      { label: 'Channel checks, two integrators', kind: 'chat', state: 'unverified' },
      { label: 'vrt-model (repo)', kind: 'repo', state: 'verified' },
      { label: 'Team drive, power research', kind: 'drive', state: 'verified' },
    ],
    next: [
      { label: 'Resolve the backlog conflict', detail: 'Pull the two dissenting filings side by side and reconcile the reporting boundary.', cost: '~20 min' },
      { label: 'Run backlog sensitivity', detail: 'Sweep the entry multiple across both backlog figures at three growth rates.', cost: 'model, 8 min' },
      { label: 'Check the comparable set', detail: 'Screen the four listed peers for the same utility-filing signal.', cost: '~35 min' },
    ],
  },
  'i-avgo': {
    summary:
      'News agent picked up a supplier disclosure that implies custom silicon is a larger share of the mix than the segment reporting suggests. Margin follows mix here more than it follows volume.',
    notes: [
      {
        h: 'The disclosure',
        body: 'A second-tier packaging supplier raised its capacity guidance and named the programme. Backing that into wafer starts puts custom silicon near a quarter of the mix against the fifth consensus assumes.',
      },
      {
        h: 'Margin arithmetic',
        body: 'Each point of mix shift is worth roughly 30 basis points of gross margin. The implied move is a full point above the consensus bridge, which is not in any published model yet.',
      },
      {
        h: 'The catch',
        body: 'The disclosure is one supplier and the attribution is inferred, not stated. If the capacity serves a second customer the whole bridge collapses.',
      },
    ],
    sources: [
      { label: 'Supplier capacity release', kind: 'doc', state: 'verified' },
      { label: 'Segment history, eight quarters', kind: 'sheet', state: 'verified' },
      { label: 'Attribution working note', kind: 'doc', state: 'unverified' },
      { label: 'margin-bridge (repo)', kind: 'repo', state: 'verified' },
    ],
    next: [
      { label: 'Test the attribution', detail: 'Check whether the named capacity could serve a second customer.', cost: '~45 min' },
      { label: 'Rebuild the margin bridge', detail: 'Re-run with mix at 20, 25 and 30 percent of revenue.', cost: 'model, 6 min' },
    ],
  },
  'i-nee': {
    summary:
      'Your note from Tuesday, picked back up by the agent after the curve moved. The regulated base earns an allowed return that does not reprice with the front end, so the selloff overstates the damage.',
    notes: [
      {
        h: 'What repriced',
        body: 'The front end moved 40 basis points in eight sessions and the name moved with it, one for one. That correlation holds for the unregulated development arm but not for the regulated base.',
      },
      {
        h: 'Where the split sits',
        body: 'Roughly two thirds of earnings sit in the regulated base at a fixed allowed return. Only the remaining third carries genuine rate sensitivity through project financing.',
      },
    ],
    sources: [
      { label: 'Rate case filings', kind: 'doc', state: 'verified' },
      { label: 'Curve history', kind: 'sheet', state: 'verified' },
      { label: 'Your Tuesday note', kind: 'doc', state: 'verified' },
    ],
    next: [
      { label: 'Split the earnings base', detail: 'Separate regulated from development earnings and re-run the beta.', cost: 'model, 4 min' },
      { label: 'Pull the peer reaction', detail: 'Compare the move against three regulated peers over the same window.', cost: '~15 min' },
    ],
  },
  'i-de': {
    summary:
      'In testing. The channel inventory series has turned in four of five regions, which historically leads the order trough by two quarters.',
    notes: [
      {
        h: 'The series',
        body: 'Used equipment on dealer lots is down 14% from the peak, and the two regions that turned first are already showing order stabilisation.',
      },
      {
        h: 'What testing found so far',
        body: 'The lead-lag relationship holds in three of the last four cycles. The exception was a credit-driven cycle, which is the scenario worth stressing before this sizes.',
      },
    ],
    sources: [
      { label: 'Dealer inventory series', kind: 'sheet', state: 'verified' },
      { label: 'Cycle comparison, four cycles', kind: 'sheet', state: 'verified' },
      { label: 'Regional order data', kind: 'feed', state: 'unverified' },
    ],
    next: [{ label: 'Stress the credit case', detail: 'Re-run the lead-lag with the credit-driven cycle weighted up.', cost: 'model, 11 min' }],
  },
  'i-shel': {
    summary: 'Parked while the refining spread stays outside its historical band. Worth reopening when the spread closes half the gap.',
    notes: [
      {
        h: 'Why it is parked',
        body: 'The pair only works if spreads normalise inside two quarters. At the current level the carry cost eats the expected move.',
      },
    ],
    sources: [
      { label: 'Refining spread history', kind: 'sheet', state: 'verified' },
      { label: 'Pair backtest', kind: 'repo', state: 'verified' },
    ],
    next: [{ label: 'Set a spread alert', detail: 'Reopen automatically when the spread closes half the gap to its band.', cost: 'instant' }],
  },
};

export type Model = { name: string; on: string; pct: number; eta: string };

export const MODELS: Model[] = [
  { name: 'Backlog sensitivity', on: 'VRT', pct: 68, eta: '3 min left' },
  { name: 'Margin bridge', on: 'AVGO', pct: 34, eta: '9 min left' },
  { name: 'Lead-lag, credit weighted', on: 'DE', pct: 91, eta: 'under a minute' },
];
