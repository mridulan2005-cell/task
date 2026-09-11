import type { Backup, Idea } from './ideas';

export const MORE_IDEAS: Idea[] = [
  {
    id: 'i-etn',
    ticker: 'ETN',
    name: 'Eaton Corp',
    thesis: 'Electrical backlog converts at a higher margin than the segment history implies.',
    angle: 'Backlog conversion',
    state: 'new',
    sources: 27,
    age: '6h',
    origin: 'Screener agent',
  },
  {
    id: 'i-pwr',
    ticker: 'PWR',
    name: 'Quanta Services',
    thesis: 'Grid hardening spend is contracted years out and the market prices it as cyclical.',
    angle: 'Contracted spend',
    state: 'open',
    sources: 21,
    age: '9h',
    origin: 'You',
  },
  {
    id: 'i-mu',
    ticker: 'MU',
    name: 'Micron Technology',
    thesis: 'High bandwidth memory supply is sold out through the next two nodes.',
    angle: 'Supply tightness',
    state: 'testing',
    sources: 34,
    age: '1d',
    origin: 'News agent',
  },
  {
    id: 'i-gev',
    ticker: 'GEV',
    name: 'GE Vernova',
    thesis: 'Turbine slot pricing has reset and none of it is in the out-year estimates.',
    angle: 'Slot pricing',
    state: 'new',
    sources: 16,
    age: '2d',
    origin: 'Screener agent',
  },
  {
    id: 'i-anet',
    ticker: 'ANET',
    name: 'Arista Networks',
    thesis: 'Customer concentration is falling faster than the discount to peers assumes.',
    angle: 'Concentration',
    state: 'parked',
    sources: 14,
    age: '4d',
    origin: 'You',
  },
];

export const MORE_BACKUP: Record<string, Backup> = {
  'i-etn': {
    summary:
      'Screener picked this up alongside Vertiv. The same utility filings that support the power retrofit case flow through Eaton with a longer lag and a better margin.',
    notes: [
      {
        h: 'Where the margin sits',
        body: 'Electrical Americas has run 300 basis points above the segment average for six quarters. The backlog mix skews further that way, and guidance still assumes the historical blend.',
      },
      {
        h: 'What to check',
        body: 'Conversion timing is the swing factor. If the backlog converts a quarter later than assumed the whole margin lift moves out of the estimate window.',
      },
    ],
    sources: [
      { label: 'Segment margin history', kind: 'sheet', state: 'verified' },
      { label: 'Backlog disclosure, Q3', kind: 'doc', state: 'verified' },
      { label: 'Utility load filings, 16 filers', kind: 'sheet', state: 'verified' },
      { label: 'Conversion timing note', kind: 'doc', state: 'unverified' },
    ],
    next: [
      { label: 'Model the conversion lag', detail: 'Shift conversion one quarter each way and read the estimate effect.', cost: 'model, 7 min' },
      { label: 'Cross-check with VRT', detail: 'Compare which filings support both names and which support only one.', cost: '~25 min' },
    ],
  },
  'i-pwr': {
    summary:
      'Your note from last month. Grid hardening work is contracted under multi-year master agreements, so the revenue is closer to a subscription than to a construction cycle.',
    notes: [
      {
        h: 'How the contracts work',
        body: 'Roughly 70% of the electric power segment sits under master service agreements with fixed scope and annual escalators. That share has climbed every year since 2021.',
      },
      {
        h: 'Why the market disagrees',
        body: 'The multiple still tracks construction peers with far shorter order books. Either the contracted share is not believed or it is not read.',
      },
    ],
    sources: [
      { label: 'Master agreement disclosure', kind: 'doc', state: 'verified' },
      { label: 'Segment revenue history', kind: 'sheet', state: 'verified' },
      { label: 'Peer multiple screen', kind: 'sheet', state: 'unverified' },
    ],
    next: [{ label: 'Rebuild the peer set', detail: 'Screen for contracted revenue share rather than sector label.', cost: '~30 min' }],
  },
  'i-mu': {
    summary: 'In testing. Supply commitments through the next two nodes appear fully allocated, which would put pricing power with the supplier for longer than the cycle implies.',
    notes: [
      {
        h: 'The allocation picture',
        body: 'Three customers have disclosed multi-year supply agreements covering capacity that is already committed. Backing that into wafer plans leaves very little uncommitted supply.',
      },
      {
        h: 'What testing found',
        body: 'The allocation math holds under two of three capacity assumptions. The third, an aggressive node transition, releases enough supply to break the case.',
      },
    ],
    sources: [
      { label: 'Customer supply agreements', kind: 'doc', state: 'verified' },
      { label: 'Capacity model', kind: 'repo', state: 'verified' },
      { label: 'Node transition estimates', kind: 'sheet', state: 'unverified' },
    ],
    next: [{ label: 'Stress the node transition', detail: 'Re-run allocation with the aggressive transition weighted up.', cost: 'model, 9 min' }],
  },
  'i-gev': {
    summary: 'Turbine slot pricing reset at the last two award rounds. The out-year estimates still carry the old pricing, which makes the gap arithmetic rather than a judgement call.',
    notes: [
      {
        h: 'The reset',
        body: 'Two award rounds cleared 18% above the prior band. Slots are booked years ahead, so the pricing is locked before it appears in reported revenue.',
      },
    ],
    sources: [
      { label: 'Award round pricing', kind: 'sheet', state: 'verified' },
      { label: 'Order book disclosure', kind: 'doc', state: 'verified' },
      { label: 'Estimate history', kind: 'feed', state: 'unverified' },
    ],
    next: [{ label: 'Bridge the out-years', detail: 'Reprice booked slots at the new band and compare against consensus.', cost: 'model, 6 min' }],
  },
  'i-anet': {
    summary: 'Parked. The concentration discount only closes if the top two customers fall below a third of revenue, and the disclosure is not granular enough to prove it yet.',
    notes: [
      {
        h: 'Why it is parked',
        body: 'Customer disclosure is annual and aggregated. Nothing between now and the next filing would settle the question, so the idea waits.',
      },
    ],
    sources: [
      { label: 'Customer concentration history', kind: 'sheet', state: 'verified' },
      { label: 'Peer discount screen', kind: 'sheet', state: 'verified' },
    ],
    next: [{ label: 'Set a filing alert', detail: 'Reopen when the next annual filing lands with updated concentration.', cost: 'instant' }],
  },
};
