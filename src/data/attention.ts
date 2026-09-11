/* What needs you, for every role, in one shape.

   It no longer lives in the middle of a workspace. The copilot panel carries
   it, and how it arrives depends on how much it costs to wait: something
   blocking intrudes, everything else waits behind a nudge. */

import { NEEDS_YOU } from './needs';
import { ANALYST_NEEDS } from './analystNeeds';
import { IDEAS } from './ideas';
import { MORE_IDEAS } from './ideasExtra';
import { SOURCES_SWEPT } from './research';
import { RISK_ATTENTION } from './risk';
import type { Item, Source } from './needs';
import type { RiskItem } from './risk';
import type { Role } from '../components/TopBar';

/* 'intrude' opens itself in the panel. 'nudge' waits in the drawer. */
export type Urgency = 'intrude' | 'nudge';

/* What the card opens into: the same write-up the agent filed, in the order a
   reader needs it — the figures, what happened, the record, what to do. */
export type Detail = {
  stats: { k: string; v: string; tone?: 'up' | 'down' | 'warn' }[];
  context: string;
  /* the second paragraph, where there is one: why it stopped here */
  raised?: string;
  rows: { k: string; v: string }[];
  recommend: string;
};

export type Attn = {
  id: string;
  urgency: Urgency;
  /* the word on the chip, and the colour it carries */
  tag: string;
  /* 'idea' is not a problem at all. It is the one thing the analyst's desk
     puts in this drawer, because what came out of the reading is what that
     desk is waiting on. */
  tone: 'block' | 'review' | 'routine' | 'idea';
  agent: string;
  title: string;
  body: string;
  age: string;
  facts: { k: string; v: string }[];
  primary: string;
  questions: string[];
  /* what the agent read before it raised this, shown behind the overlay */
  sources: Source[];
  detail: Detail;
  /* Some cards are a door rather than a decision. Clicking this one opens the
     surface named here instead of tagging it for the copilot. */
  opens?: 'workspace';
};

function fromItem(i: Item): Attn {
  return {
    id: i.id,
    urgency: i.priority === 'critical' ? 'intrude' : 'nudge',
    tag: i.priority === 'critical' ? 'Blocking' : i.priority === 'high' ? 'Today' : 'Routine',
    tone: i.priority === 'critical' ? 'block' : i.priority === 'high' ? 'review' : 'routine',
    agent: i.agent,
    title: i.title,
    body: i.context,
    age: i.age,
    facts: i.evidence.slice(0, 2),
    primary: i.options[0]?.label ?? 'Open',
    questions: ['Why was this raised?', 'What are my options here?', 'Show me the sources behind it'],
    sources: i.sources,
    detail: {
      stats: i.impactStats,
      context: i.context,
      raised: i.raised,
      rows: i.evidence,
      recommend: i.options[0]?.text ?? i.impact,
    },
  };
}

function fromRisk(i: RiskItem): Attn {
  return {
    id: i.id,
    urgency: i.level === 'critical' ? 'intrude' : 'nudge',
    tag: i.tag,
    tone: i.level === 'critical' ? 'block' : 'review',
    agent: 'Risk',
    title: i.title,
    body: i.body,
    age: i.age,
    facts: i.facts.slice(0, 2).map((f) => ({ k: f.k, v: f.v })),
    primary: i.approve,
    questions: i.suggestions,
    sources: i.sources,
    detail: {
      stats: i.stats ?? [],
      context: i.body,
      raised: i.raised,
      rows: i.facts.map((f) => ({ k: f.k, v: f.v })),
      recommend: i.recommend,
    },
  };
}

/* --- the desk's own queue --- */

const TRADER: Attn[] = [
  {
    id: 'T-1',
    urgency: 'intrude',
    tag: 'Blocking',
    tone: 'block',
    agent: 'Execution',
    title: 'AVGO parent order stalled at 62% filled',
    body: 'The algo has been outside its participation band for eleven minutes. Spread widened to 9 basis points and the venue is thinning out, so the remainder needs a decision rather than a retry.',
    age: '11m',
    facts: [
      { k: 'Filled', v: '62% of 240,000' },
      { k: 'Slippage', v: '14bp against arrival' },
    ],
    primary: 'Reprice the remainder',
    questions: ['Why did it fall behind?', 'What does crossing the rest cost?', 'Which venue is thinning out?'],
    sources: [
      { label: 'Parent order AVGO-2214', kind: 'sheet' },
      { label: 'Venue depth feed', kind: 'feed' },
      { label: 'Execution policy — bands', kind: 'doc' },
      { label: 'Desk thread — execution', kind: 'chat' },
    ],
    detail: {
      stats: [
        { k: 'Filled', v: '62%' },
        { k: 'Slippage', v: '14bp', tone: 'down' },
        { k: 'Left to work', v: '$8.9M', tone: 'warn' },
      ],
      context:
        'The AVGO parent order was sliced across the afternoon at 12% of volume. It tracked the schedule until 14:41, when the near touch thinned out and the algo started missing its slices.',
      raised:
        'The algo has been outside its participation band for eleven minutes. Spread widened to 9 basis points and the venue is thinning out, so the remainder needs a decision rather than a retry.',
      rows: [
        { k: 'Order', v: 'AVGO-2214, sell 240,000' },
        { k: 'Filled', v: '148,800 at 361.42 average' },
        { k: 'Band', v: '10 to 14% of volume' },
        { k: 'Raised by', v: 'Execution agent at 14:52' },
      ],
      recommend:
        'Reprice the remainder as a limit at 360.80 and drop the participation floor to 8% for the last hour. That keeps the order inside its band on thinner volume and avoids paying the full nine basis points to cross.',
    },
  },
  {
    id: 'T-2',
    urgency: 'nudge',
    tag: 'Today',
    tone: 'review',
    agent: 'Execution',
    title: 'NVDA trim ready to work',
    body: 'Risk approved a 22% trim this morning. The agent has it sliced across the afternoon but wants your nod before it starts.',
    age: '34m',
    facts: [
      { k: 'Size', v: '$1.8M' },
      { k: 'Schedule', v: '13:00 to 15:45' },
    ],
    primary: 'Release to the algo',
    questions: ['What schedule did it pick?', 'How much volume is that?', 'What happens if I hold it?'],
    sources: [
      { label: 'Risk approval, 09:36', kind: 'doc' },
      { label: 'Execution schedule', kind: 'sheet' },
      { label: 'NVDA volume profile', kind: 'feed' },
      { label: 'Team drive — trim notes', kind: 'drive' },
    ],
    detail: {
      stats: [
        { k: 'Size', v: '$1.8M' },
        { k: 'Of average volume', v: '9%' },
        { k: 'Window', v: '2h 45m' },
      ],
      context:
        'Risk approved a 22% trim of the NVDA position this morning to bring the single-name weight back inside its cap. The agent has priced it against today’s volume profile and sliced it across the afternoon.',
      raised:
        'Nothing is blocking the order. It sits above the notional the desk lets an agent start on its own, so it waits on your nod before the first slice goes out.',
      rows: [
        { k: 'Order', v: 'Sell 4,900 NVDA' },
        { k: 'Schedule', v: '13:00 to 15:45, 11 slices' },
        { k: 'Approval', v: 'Risk, 09:36' },
        { k: 'Raised by', v: 'Execution agent at 11:48' },
      ],
      recommend:
        'Release it to the algo as scheduled. The window covers the two heaviest volume buckets of the session, and holding it past 15:00 pushes the remainder into the close, where the trim would cost more in spread than it saves in risk.',
    },
  },
  {
    id: 'T-3',
    urgency: 'nudge',
    tag: 'Routine',
    tone: 'routine',
    agent: 'Settlement',
    title: 'Two allocations need a book before the close',
    body: 'The SHEL and DE fills from yesterday are sitting unallocated. Neither is urgent, but they cannot settle until the split is confirmed.',
    age: '3h',
    facts: [
      { k: 'Trades', v: '2 unallocated' },
      { k: 'Notional', v: '$2.4M' },
    ],
    primary: 'Confirm the split',
    questions: ['Which accounts are involved?', 'What is the usual split?', 'When does this stop being routine?'],
    sources: [
      { label: 'Unallocated fills, yesterday', kind: 'sheet' },
      { label: 'Allocation policy', kind: 'doc' },
      { label: 'Account master', kind: 'sheet' },
      { label: 'settlement (repo)', kind: 'repo' },
    ],
    detail: {
      stats: [
        { k: 'Trades', v: '2' },
        { k: 'Notional', v: '$2.4M' },
        { k: 'To the close', v: '3h 12m' },
      ],
      context:
        'The SHEL and DE fills from yesterday came in as block trades against the house account. Both need splitting across the three sub-accounts before settlement can pick them up tonight.',
      raised:
        'Neither is urgent on its own. They cannot settle until the split is confirmed, and an unallocated fill carried past the close is a break the operations desk has to write up in the morning.',
      rows: [
        { k: 'Trades', v: 'SHEL 18,400, DE 3,100' },
        { k: 'Accounts', v: 'Three, standing split' },
        { k: 'Settles', v: 'Tonight, T+1' },
        { k: 'Raised by', v: 'Settlement agent at 08:05' },
      ],
      recommend:
        'Confirm the standing split, 60 / 25 / 15 across the three accounts, which is what both names have used all quarter. Nothing about either fill departs from it, so the only thing this needs is your confirmation.',
    },
  },
];

const NEW_IDEAS = [...IDEAS, ...MORE_IDEAS].filter((i) => i.state === 'new').length;

/* The analyst's drawer opens on what the reading produced rather than on a
   problem. The counts come off the idea list and the reading log, so the card
   can never claim a number the hub does not hold. */
const IDEAS_EMERGED: Attn = {
  id: 'ideas-emerged',
  urgency: 'intrude',
  tag: 'Ideas',
  tone: 'idea',
  agent: 'Screener',
  title: `${NEW_IDEAS} Ideas emerged!`,
  body: `after going through ${SOURCES_SWEPT.toLocaleString()} sources`,
  age: 'today',
  facts: [
    { k: 'New today', v: String(NEW_IDEAS) },
    { k: 'Sources swept', v: SOURCES_SWEPT.toLocaleString() },
  ],
  primary: 'Open the idea hub',
  questions: ['What did the screener rank them on?', 'Which one has the weakest case?', 'What did it drop and why?'],
  sources: [
    { label: 'Morning sweep, 09:02', kind: 'sheet' },
    { label: 'weekly-screen.skill.md', kind: 'repo' },
    { label: 'factor-weights.xlsx', kind: 'sheet' },
  ],
  detail: {
    stats: [
      { k: 'Ideas', v: String(NEW_IDEAS), tone: 'up' },
      { k: 'Sources read', v: SOURCES_SWEPT.toLocaleString() },
      { k: 'Universe', v: '1,940 names' },
    ],
    context: `The screener swept the full universe at the open and the research agents read through it during the session. ${SOURCES_SWEPT.toLocaleString()} sources went in and ${NEW_IDEAS} ideas came out the other side.`,
    rows: [
      { k: 'Swept', v: '1,940 names on the six house factors' },
      { k: 'Survived', v: `${NEW_IDEAS} ideas, filed with their sources` },
      { k: 'Opened', v: '09:02 to 14:28' },
    ],
    recommend: 'Read them in the hub. Each one arrives with the sources that drove its rank, so the first question is whether the case holds rather than whether the name is interesting.',
  },
  opens: 'workspace',
};

export const ATTENTION: Record<Role, Attn[]> = {
  pm: NEEDS_YOU.map(fromItem),
  analyst: [IDEAS_EMERGED, ...ANALYST_NEEDS.map(fromItem)],
  risk: RISK_ATTENTION.map(fromRisk),
  trader: TRADER,
};
