export type Priority = 'critical' | 'high' | 'routine';

export type Option = { label: string; text: string };

export type SrcKind = 'doc' | 'sheet' | 'repo' | 'drive' | 'chat' | 'feed';

export type Source = { label: string; kind: SrcKind };

export type Item = {
  id: string;
  priority: Priority;
  agent: string;
  title: string;
  age: string;
  confidence: number;
  /* detail view */
  context: string;
  raised: string;
  evidence: { k: string; v: string }[];
  impact: string;
  impactStats: { k: string; v: string; tone?: 'up' | 'down' | 'warn' }[];
  via: string;
  sources: Source[];
  options: Option[];
};

export const NEEDS_YOU: Item[] = [
  {
    id: 'N-1',
    priority: 'critical',
    agent: 'Compliance',
    title: 'PLTR order blocked by restricted list',
    age: '41m',
    confidence: 99,
    context:
      'Momentum opened a starter position in Palantir at 11:22 this morning, sized at 1.2% of the book. The name was added to the firm restricted list overnight after the advisory mandate was signed.',
    raised:
      'Compliance stopped the order at the gate. It cannot be released or cancelled by an agent, so it has been sitting unfilled on the desk for 41 minutes.',
    evidence: [
      { k: 'Order', v: 'T-90391, buy 12,000 PLTR at 74.80' },
      { k: 'Rule', v: 'Restricted list, hard block' },
      { k: 'Added to list', v: 'Today 06:40, advisory mandate' },
      { k: 'Raised by', v: 'Compliance agent at 11:22' },
    ],
    impact:
      'The capital is committed but idle, and the entry price has drifted away from where Momentum wanted it. Leaving the order open keeps an audit exception on the desk for the rest of the session.',
    impactStats: [
      { k: 'Notional held', v: '$897K' },
      { k: 'Price drift since', v: '-1.24%', tone: 'down' },
      { k: 'Open exceptions', v: '1', tone: 'warn' },
    ],
    via: 'Compliance agent',
    sources: [
      { label: 'Order blotter, T-90391', kind: 'feed' },
      { label: 'Restricted list, 10 Sep', kind: 'sheet' },
      { label: 'Advisory mandate (signed)', kind: 'doc' },
      { label: 'Compliance rulebook 4.2', kind: 'doc' },
      { label: 'pm-desk thread', kind: 'chat' },
    ],
    options: [
      {
        label: 'Cancel order',
        text: 'Cancel T-90391 in full and release the $897K back to cash. Log the restricted-list block against the advisory mandate and tell Momentum to drop PLTR from its candidate set until the mandate ends.',
      },
      {
        label: 'Override',
        text: 'Release T-90391 under a documented PM override, with your sign-off attached to the compliance record. Cap the fill at 6,000 shares so the position stays under the disclosure threshold.',
      },
      {
        label: 'Park',
        text: 'Hold T-90391 unfilled until legal confirms the scope of the advisory mandate tomorrow morning. Freeze the capital against the order so Treasury does not sweep it at 16:00.',
      },
    ],
  },
  {
    id: 'N-2',
    priority: 'critical',
    agent: 'Risk',
    title: 'Semis at 21.3% against a 20% cap',
    age: '18m',
    confidence: 91,
    context:
      'Semiconductors are the largest sector bet in the book, held across NVDA, TSM and ASML. The mandate caps any single sector at 20% of net asset value.',
    raised:
      'The TSM add at 14:32 plus the NVDA mark pushed the sector to 21.3%. This is a hard cap, not a soft target, so it has to be back inside by the close.',
    evidence: [
      { k: 'Current weight', v: '21.3% of NAV' },
      { k: 'Cap', v: '20.0%, hard' },
      { k: 'Breached at', v: '14:32, on the TSM fill' },
      { k: 'Contributors', v: 'NVDA 9.4, TSM 6.2, ASML 3.3' },
    ],
    impact:
      'A cap breach carried into the close is reportable to the investment committee. It also concentrates the book into one factor the day before an industry print.',
    impactStats: [
      { k: 'Over cap by', v: '1.3pts', tone: 'warn' },
      { k: 'To sell', v: '$1.67M' },
      { k: 'Time to close', v: '1h 28m' },
    ],
    via: 'Risk agent',
    sources: [
      { label: 'Position file, live', kind: 'feed' },
      { label: 'Mandate risk limits', kind: 'doc' },
      { label: 'Sector map, GICS', kind: 'sheet' },
      { label: 'semis-exposure (repo)', kind: 'repo' },
      { label: 'Team drive, risk folder', kind: 'drive' },
    ],
    options: [
      {
        label: 'Balanced trim',
        text: 'Trim 1.4% across TSM and ASML in proportion to their tracking error, roughly 9,700 TSM and 550 ASML. Works the orders over the last hour of the session and leaves the sector at 19.9%.',
      },
      {
        label: 'Trim the winner',
        text: 'Take the full 1.4% out of NVDA, roughly 2,700 shares, locking in part of the gain. Leaves TSM and ASML untouched ahead of the industry print and puts the sector at 19.9%.',
      },
      {
        label: 'Hedge instead',
        text: 'Hold the positions and short 1.4% notional of the semis index to bring net sector exposure inside the cap. Costs an estimated 6bps in financing and can be unwound after the print.',
      },
    ],
  },
  {
    id: 'N-3',
    priority: 'high',
    agent: 'Value',
    title: 'Exit thesis broken on UNH',
    age: '2h',
    confidence: 78,
    context:
      'UnitedHealth was bought as a value position on normalised margins and a stable medical loss ratio. It is 3.9% of the book, held since March.',
    raised:
      'This morning the company cut full year guidance. Two of the four screens that justified the position now fail, so Value no longer holds a thesis it can defend.',
    evidence: [
      { k: 'Screens failing', v: '2 of 4, margin and MLR' },
      { k: 'Guidance', v: 'FY cut, second in three quarters' },
      { k: 'Position', v: '5,900 shares, 3.9% of NAV' },
      { k: 'Held since', v: '12 March 2026' },
    ],
    impact:
      'Holding a position with no live thesis is the failure mode this fund is built to avoid. The name is also the largest single drag on the book today.',
    impactStats: [
      { k: 'Day move', v: '-2.31%', tone: 'down' },
      { k: 'Unrealised', v: '-$344.7K', tone: 'down' },
      { k: 'Weight', v: '3.9%' },
    ],
    via: 'Value agent',
    sources: [
      { label: 'UNH guidance release', kind: 'doc' },
      { label: 'Value screen run, today', kind: 'sheet' },
      { label: 'value-screens (repo)', kind: 'repo' },
      { label: 'Position file, live', kind: 'feed' },
    ],
    options: [
      {
        label: 'Exit over 2 days',
        text: 'Close all 5,900 shares across today and tomorrow, roughly half each session, to keep inside 15% of average volume. Proceeds go to cash pending the VRT decision.',
      },
      {
        label: 'Halve now',
        text: 'Sell 2,950 shares today and keep the rest until the company hosts its call on Thursday. Caps the downside while leaving room to re-underwrite the thesis.',
      },
      {
        label: 'Hold and review',
        text: 'Keep the position and put it on a one-week review with Value re-running the full screen set after the call. No trade today.',
      },
    ],
  },
  {
    id: 'N-4',
    priority: 'high',
    agent: 'Research',
    title: 'New name for committee, VRT',
    age: '5h',
    confidence: 64,
    context:
      'Research has been working Vertiv as a data centre power and cooling candidate since June. It cleared the full diligence chain this morning and wants a 1.8% starter.',
    raised:
      'Two of six sources disagree on the order backlog figure, a number the entire case rests on. Research escalated rather than sizing the position itself.',
    evidence: [
      { k: 'Sources reviewed', v: '46' },
      { k: 'Conflicts', v: '2 of 6 on backlog' },
      { k: 'Proposed size', v: '1.8% of NAV, $2.31M' },
      { k: 'Diligence', v: 'Cleared 8 of 8 gates' },
    ],
    impact:
      'Entering on a disputed backlog number means underwriting a case that may not hold. Waiting risks the entry, since the name has run 3.4% today.',
    impactStats: [
      { k: 'Day move', v: '+3.42%', tone: 'up' },
      { k: 'Agent confidence', v: '64%', tone: 'warn' },
      { k: 'Cash available', v: '6.2%' },
    ],
    via: 'Research agent',
    sources: [
      { label: 'Diligence memo, VRT', kind: 'doc' },
      { label: 'Backlog comparison, 46 sources', kind: 'sheet' },
      { label: 'Team drive, research folder', kind: 'drive' },
      { label: 'vrt-model (repo)', kind: 'repo' },
      { label: 'research-desk thread', kind: 'chat' },
    ],
    options: [
      {
        label: 'Half size',
        text: 'Open at 0.9% rather than 1.8% and hold the balance until the backlog number is confirmed at the November print. Research keeps the file open with a two-week check-in.',
      },
      {
        label: 'Full size',
        text: 'Take the full 1.8% starter now and accept the backlog uncertainty, on the basis that the other five sources agree within 4%. Funded from the cash buffer.',
      },
      {
        label: 'Send back',
        text: 'Return the memo to Research with a request to resolve the backlog conflict directly with the two dissenting sources before any capital is committed.',
      },
    ],
  },
  {
    id: 'N-5',
    priority: 'routine',
    agent: 'Treasury',
    title: 'Sign off on the Friday cash sweep',
    age: '1d',
    confidence: 96,
    context:
      'Treasury sweeps idle cash into the overnight facility every Friday at 16:00. Cash currently sits at 6.2% of the book against a 5% floor.',
    raised:
      'This week the sweep collides with two open decisions, the VRT starter and the PLTR block, both of which would draw on the same cash.',
    evidence: [
      { k: 'Sweep amount', v: '$4.1M' },
      { k: 'Executes', v: 'Today 16:00' },
      { k: 'Overnight rate', v: '4.31%' },
      { k: 'Claims on cash', v: 'VRT $2.31M, PLTR $897K' },
    ],
    impact:
      'Sweeping everything leaves nothing for the VRT starter on Monday. Holding it all back gives up a small but certain overnight yield.',
    impactStats: [
      { k: 'Yield if swept', v: '+$1.4K', tone: 'up' },
      { k: 'Cash after sweep', v: '3.0%', tone: 'warn' },
      { k: 'Floor', v: '5.0%' },
    ],
    via: 'Treasury agent',
    sources: [
      { label: 'Cash ladder, Friday', kind: 'sheet' },
      { label: 'Overnight facility terms', kind: 'doc' },
      { label: 'Sweep policy', kind: 'doc' },
      { label: 'Custody feed', kind: 'feed' },
    ],
    options: [
      {
        label: 'Partial sweep',
        text: 'Sweep $1.5M and hold $2.6M back to cover the VRT starter and the PLTR resolution. Cash stays at 5.2%, just inside the floor.',
      },
      {
        label: 'Full sweep',
        text: 'Sweep the full $4.1M into the overnight facility and recall on Monday morning if the VRT starter is approved. Recall settles same day.',
      },
      {
        label: 'Skip this week',
        text: 'Hold the sweep entirely until both open decisions are closed. Costs an estimated $1.4K in foregone overnight yield.',
      },
    ],
  },
];
