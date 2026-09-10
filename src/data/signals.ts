export type Signal = {
  ticker: string;
  signal: string;
  note: string;
  confidence: number;
  upside: number;
  /* what the agent already has drafted, and what it expects to be asked */
  action: string;
  detail: string;
  questions: string[];
};

export const SIGNALS: Signal[] = [
  { ticker: 'VRT', signal: 'High conviction', note: 'New contract win, improving fundamentals', confidence: 87, upside: 15.3, action: 'Open 1.8% in VRT, funded from the cash buffer', detail: 'Worked over two sessions, inside 15% of average volume. Clears every limit except the semis cap, which has 0.6 points of headroom.', questions: ["What breaks this thesis?","How does it sit against the semis cap?","Who else owns it in the peer group?"] },
  { ticker: 'AVGO', signal: 'Earnings upgrade', note: 'AI demand outlook stronger', confidence: 78, upside: 12.1, action: 'Add 0.9% to AVGO, trimmed from MSFT', detail: 'Keeps net technology flat while shifting toward the mix-shift case. Funded by a 0.9% trim in MSFT rather than from cash.', questions: ["Why fund it from MSFT?","What does the margin bridge assume?","How crowded is this trade?"] },
  { ticker: 'NEE', signal: 'Macro tailwind', note: 'Defensive play as rates rise', confidence: 72, upside: 9.4, action: 'Start 1.2% in NEE as a rate hedge', detail: 'Sized to offset roughly a third of the book’s duration sensitivity. Two thirds of its earnings sit in the regulated base.', questions: ["How much duration does this actually hedge?","What if rates reverse?","Show the regulated earnings split"] },
  { ticker: 'TSM', signal: 'Valuation opportunity', note: 'Trading below fair value', confidence: 68, upside: 11.8, action: 'Top up TSM by 0.8% on the valuation gap', detail: 'Would take the position to 7.0% and the semis sector to 22.1%, which needs the sector cap resolved first.', questions: ["Does this breach the semis cap?","What is the fair value gap built on?","How does it compare with ASML?"] },
  { ticker: 'CRWD', signal: 'Channel checks positive', note: 'Stronger enterprise demand', confidence: 65, upside: 10.2, action: 'Open 1.0% in CRWD on the channel checks', detail: 'Small starter while the valuation screen still fails. Research wants a second quarter of channel data before sizing up.', questions: ["Why does the valuation screen fail?","How reliable are the channel checks?","What would take this to full size?"] },
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
