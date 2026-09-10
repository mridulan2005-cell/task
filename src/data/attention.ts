/* What needs you, for every role, in one shape.

   It no longer lives in the middle of a workspace. The copilot panel carries
   it, and how it arrives depends on how much it costs to wait: something
   blocking intrudes, everything else waits behind a nudge. */

import { NEEDS_YOU } from './needs';
import { ANALYST_NEEDS } from './analystNeeds';
import { RISK_ATTENTION } from './risk';
import type { Item } from './needs';
import type { RiskItem } from './risk';
import type { Role } from '../components/TopBar';

/* 'intrude' opens itself in the panel. 'nudge' waits in the drawer. */
export type Urgency = 'intrude' | 'nudge';

export type Attn = {
  id: string;
  urgency: Urgency;
  /* the word on the chip, and the colour it carries */
  tag: string;
  tone: 'block' | 'review' | 'routine';
  agent: string;
  title: string;
  body: string;
  age: string;
  facts: { k: string; v: string }[];
  primary: string;
  questions: string[];
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
  },
];

export const ATTENTION: Record<Role, Attn[]> = {
  pm: NEEDS_YOU.map(fromItem),
  analyst: ANALYST_NEEDS.map(fromItem),
  risk: RISK_ATTENTION.map(fromRisk),
  trader: TRADER,
};
