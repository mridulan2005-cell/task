export type Signal = {
  ticker: string;
  signal: string;
  note: string;
  confidence: number;
  upside: number;
};

export const SIGNALS: Signal[] = [
  { ticker: 'VRT', signal: 'High conviction', note: 'New contract win, improving fundamentals', confidence: 87, upside: 15.3 },
  { ticker: 'AVGO', signal: 'Earnings upgrade', note: 'AI demand outlook stronger', confidence: 78, upside: 12.1 },
  { ticker: 'NEE', signal: 'Macro tailwind', note: 'Defensive play as rates rise', confidence: 72, upside: 9.4 },
  { ticker: 'TSM', signal: 'Valuation opportunity', note: 'Trading below fair value', confidence: 68, upside: 11.8 },
  { ticker: 'CRWD', signal: 'Channel checks positive', note: 'Stronger enterprise demand', confidence: 65, upside: 10.2 },
];

export type ProposalState = 'review' | 'pending' | 'blocked';

export type Proposal = {
  ticker: string;
  proposal: string;
  adjusted: string;
  status: string;
  state: ProposalState;
};

export const PROPOSALS: Proposal[] = [
  { ticker: 'VRT', proposal: 'Buy 6.0%', adjusted: '4.0%', status: 'Under review', state: 'review' },
  { ticker: 'NEE', proposal: 'Buy 3.0%', adjusted: '3.0%', status: 'Pending approval', state: 'pending' },
  { ticker: 'PLTR', proposal: 'Sell 2.0%', adjusted: '1.0%', status: 'Blocked (restricted)', state: 'blocked' },
];
