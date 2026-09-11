/* What the row offers, which is only ever one of two things.

   A signal the agents have finished with carries a call the manager makes and
   nobody else can: put it on, fund it, let it go. Handing it to the risk
   agent was never a call, because risk already reads every one of these. A
   signal the agents are still working carries no button at all, only what
   they are doing, so the eye skips it until there is something to decide. */
export type SignalAct = {
  state: 'decide' | 'working';
  label: string;
  /* what the copilot opens on once the call is taken. A signal still being
     worked has none, because nothing has been settled to open. */
  text?: string;
  detail?: string;
};

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
  act: SignalAct;
};

export const SIGNALS: Signal[] = [
  { ticker: 'VRT', signal: 'High conviction', note: 'New contract win, improving fundamentals', confidence: 87, upside: 15.3, action: 'Open 1.8% in VRT, funded from the cash buffer', detail: 'Worked over two sessions, inside 15% of average volume. Clears every limit except the semis cap, which has 0.6 points of headroom.', questions: ["What breaks this thesis?","How does it sit against the semis cap?","Who else owns it in the peer group?"],
    act: { state: 'decide', label: 'Execute trade', text: 'Execute the VRT starter at 1.8%', detail: 'Research and modelling are both finished and the order is drafted at 15% of volume. Nothing is left but your call to put it on.' } },
  { ticker: 'AVGO', signal: 'Earnings upgrade', note: 'AI demand outlook stronger', confidence: 78, upside: 12.1, action: 'Add 0.9% to AVGO, trimmed from MSFT', detail: 'Keeps net technology flat while shifting toward the mix-shift case. Funded by a 0.9% trim in MSFT rather than from cash.', questions: ["Why fund it from MSFT?","What does the margin bridge assume?","How crowded is this trade?"],
    act: { state: 'decide', label: 'Approve funding', text: 'Fund the AVGO add out of MSFT, 0.9% either way', detail: 'Risk has already cleared both legs and net technology stays flat. The only open question is whether you want the switch at all.' } },
  { ticker: 'NEE', signal: 'Macro tailwind', note: 'Defensive play as rates rise', confidence: 72, upside: 9.4, action: 'Nothing to decide yet on NEE', detail: 'The research agent is still reading the rate path against the regulated base. It will come back with a size, and that is when this becomes your call.', questions: ["How much duration does this actually hedge?","What if rates reverse?","Show the regulated earnings split"],
    act: { state: 'working', label: 'Researching' } },
  { ticker: 'TSM', signal: 'Valuation opportunity', note: 'Trading below fair value', confidence: 68, upside: 11.8, action: 'Nothing to decide yet on TSM', detail: 'The modelling agent is sweeping the fair value gap across its plausible range. The top-up would take semis to 22.1% against a 20% cap, so the size has to hold before the call reaches you.', questions: ["Does this breach the semis cap?","What is the fair value gap built on?","How does it compare with ASML?"],
    act: { state: 'working', label: 'Testing' } },
  { ticker: 'CRWD', signal: 'Channel checks positive', note: 'Stronger enterprise demand', confidence: 65, upside: 10.2, action: 'Nothing to decide yet on CRWD', detail: 'The research agent wants a second quarter of channel data before it will put a size on this. The valuation screen still fails, so there is nothing to approve.', questions: ["Why does the valuation screen fail?","How reliable are the channel checks?","What would take this to full size?"],
    act: { state: 'working', label: 'Researching' } },
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
