/* The agents the desk runs, what each one is told to do, and what all of
   them are doing right now. */

import type { Role } from '../components/TopBar';

export type EventState = 'doing' | 'pending' | 'done';

/* What kind of thing happened, which is what the timeline draws a glyph for.
   A run is an agent doing its own work; the other five are the moments a
   person eventually has to read. */
export type EventKind = 'run' | 'decision' | 'escalation' | 'block' | 'fill' | 'note';

export type AgentEvent = {
  id: string;
  agent: string;
  state: EventState;
  kind: EventKind;
  /* how it ended, for anything that has ended: the ring above the log
     counts these */
  outcome?: Outcome;
  title: string;
  sub: string;
  /* the day it happened, ISO, so the range filter can compare it */
  day: string;
  /* the desk clock, so the timeline can stamp it */
  at: string;
  /* the same moment said the way a row reads it: started, waiting, finished */
  time: string;
  /* the surface this work is happening on, so a row can jump to it */
  where: { label: string; role: Role; view?: 'testbox' };
};

export type AgentFile = {
  id: string;
  name: string;
  kind: 'skill' | 'doc' | 'sheet';
  meta: string;
};

/* Which glyph stands for the agent in the list. The view holds the mapping,
   because an icon is a rendering decision and not a property of the work. */
export type AgentIcon = 'decide' | 'screen' | 'research' | 'model' | 'risk' | 'compliance' | 'execute';

export type Agent = {
  id: string;
  name: string;
  icon: AgentIcon;
  sub: string;
  /* what it does, in a sentence someone outside the desk could read */
  does: string;
  /* the instructions it runs on, in order */
  steps: string[];
  files: AgentFile[];
  runs: string;
  autonomy: 'Supervised' | 'Bounded' | 'Manual';
};

export const AGENTS: Agent[] = [
  /* The only agent that decides rather than produces. Everything the others
     raise ends on its desk, and what it settles is what the book does. */
  {
    id: 'pm',
    name: 'Portfolio manager',
    icon: 'decide',
    sub: 'Makes the call and writes it down',
    does: 'Takes what every other agent raises and settles it: which proposals go through, which are cut back, which are refused. It never originates a trade of its own, and it records the reason and the time behind every decision so the book can be read backwards.',
    steps: [
      'Collect everything raised since the last pass: signals, breaches, blocks and drafted orders.',
      'Weigh each one against the mandate, the cash floor and what is already working on the desk.',
      'Decide: approve as drafted, approve resized, defer with a condition, or refuse.',
      'Refuse anything that would need a hard limit released, and hand it to the officer who can.',
      'Write the decision, the reason, the time and the surface it touched to the decision log.',
    ],
    files: [
      { id: 'f14', name: 'decision-policy.skill.md', kind: 'skill', meta: 'Skill · 9.4 KB' },
      { id: 'f15', name: 'mandate-limits.md', kind: 'doc', meta: 'Doc · 8.2 KB' },
      { id: 'f16', name: 'decision-log.xlsx', kind: 'sheet', meta: 'Sheet · today' },
    ],
    /* the same count the dashboard metric reads, which is the length of
       DECISIONS below */
    runs: '8 decisions today',
    autonomy: 'Supervised',
  },
  {
    id: 'screener',
    name: 'Screener',
    icon: 'screen',
    sub: 'Finds names worth a second look',
    does: 'Sweeps the universe every morning and after every close, ranks what has moved against its own history, and opens an idea for anything that clears the bar. It does not size or recommend; it only decides what deserves someone reading it.',
    steps: [
      'Pull the full universe and drop anything below $2B market cap or 200k average daily volume.',
      'Rank on the six factors in the weekly parameter file, refit monthly.',
      'Discard names already open as an idea, held above 1% of the book, or on the restricted list.',
      'Open an idea for the top twenty, attach the sources that drove the rank, and set conviction from factor agreement.',
      'Escalate to the analyst when two sources disagree by more than one turn of multiple.',
    ],
    files: [
      { id: 'f1', name: 'weekly-screen.skill.md', kind: 'skill', meta: 'Skill · 4.1 KB' },
      { id: 'f2', name: 'factor-weights.xlsx', kind: 'sheet', meta: 'Sheet · updated Monday' },
      { id: 'f3', name: 'universe-rules.md', kind: 'doc', meta: 'Doc · 2.8 KB' },
    ],
    runs: '312 runs this month',
    autonomy: 'Bounded',
  },
  {
    id: 'research',
    name: 'Research',
    icon: 'research',
    sub: 'Builds the case behind an idea',
    does: 'Takes an open idea and assembles the evidence for and against it from filings, transcripts, the data feeds and prior notes. It writes the memo, and it stops and asks when the sources will not reconcile.',
    steps: [
      'Read every filing and transcript for the name over the last eight quarters.',
      'Extract the figures the thesis depends on and record where each one came from.',
      'Flag any figure two sources report differently and stop before the memo goes out.',
      'Write what the filings say, where the case is weak, and what the tape shows, in that order.',
      'Hand the memo to the analyst with the conviction and the open questions attached.',
    ],
    files: [
      { id: 'f4', name: 'memo-structure.skill.md', kind: 'skill', meta: 'Skill · 6.3 KB' },
      { id: 'f5', name: 'source-precedence.md', kind: 'doc', meta: 'Doc · 1.9 KB' },
    ],
    runs: '148 runs this month',
    autonomy: 'Supervised',
  },
  {
    id: 'modelling',
    name: 'Modelling',
    icon: 'model',
    sub: 'Runs the numbers behind the thesis',
    does: 'Builds and re-runs the valuation and sensitivity models that sit under an idea, sweeps the disputed inputs, and reports where the answer stops holding.',
    steps: [
      'Pick the template that fits the thesis, or build from the closest prior model.',
      'Seed every parameter from the filings rather than from the last run.',
      'Sweep each disputed input across its plausible range and record where the output flips.',
      'Fail the run and escalate if the model disagrees with the prior version by more than two turns.',
      'Publish the model to the bench so a human can move the inputs themselves.',
    ],
    files: [
      { id: 'f6', name: 'sensitivity-sweep.skill.md', kind: 'skill', meta: 'Skill · 5.7 KB' },
      { id: 'f7', name: 'template-library.md', kind: 'doc', meta: 'Doc · 3.4 KB' },
    ],
    runs: '96 runs this month',
    autonomy: 'Supervised',
  },
  {
    id: 'risk',
    name: 'Risk',
    icon: 'risk',
    sub: 'Watches every limit, all day',
    does: 'Checks each order and the whole book against the mandate continuously. It resolves what it can inside policy and escalates anything that would breach a hard limit.',
    steps: [
      'Re-check every position against the mandate on each price tick and each fill.',
      'Resolve soft breaches by proposing the smallest trade that clears them.',
      'Never act on a hard limit; escalate to the risk officer with the drafted trade attached.',
      'Re-run the fitted VaR and covariance models nightly and report when realised vol leaves the fitted envelope.',
      'Write every check, proposal and decision to the sealed log.',
    ],
    files: [
      { id: 'f8', name: 'mandate-limits.md', kind: 'doc', meta: 'Doc · 8.2 KB' },
      { id: 'f9', name: 'breach-triage.skill.md', kind: 'skill', meta: 'Skill · 4.8 KB' },
      { id: 'f10', name: 'stress-library.xlsx', kind: 'sheet', meta: 'Sheet · 12 scenarios' },
    ],
    runs: '18,492 checks today',
    autonomy: 'Bounded',
  },
  {
    id: 'compliance',
    name: 'Compliance',
    icon: 'compliance',
    sub: 'Stops what should not trade',
    does: 'Holds the restricted list and the firm rules, and blocks any order that trips them. It cannot release its own blocks; only a person can.',
    steps: [
      'Refresh the restricted list from legal at the open and on every amendment.',
      'Gate every order before it reaches a venue.',
      'Block rather than resize, and never release a block without a human decision.',
      'Attach the rule and the mandate clause to each block so the reason is on the record.',
    ],
    files: [{ id: 'f11', name: 'restricted-list.md', kind: 'doc', meta: 'Doc · updated 06:00' }],
    runs: '44 orders gated today',
    autonomy: 'Manual',
  },
  {
    id: 'execution',
    name: 'Execution',
    icon: 'execute',
    sub: 'Works the orders on the desk',
    does: 'Slices approved orders across the day and the venues, keeps inside the participation ceiling, and hands back anything that falls behind its schedule.',
    steps: [
      'Slice the parent order to the schedule the trader set, or to arrival if none was given.',
      'Stay under the participation ceiling on every venue and every interval.',
      'Cross in the dark at the midpoint where the size is there to do it.',
      'Stop and escalate if the fill falls more than ten minutes behind the schedule.',
      'Report slippage against arrival on every parent order at the close.',
    ],
    files: [
      { id: 'f12', name: 'venue-routing.skill.md', kind: 'skill', meta: 'Skill · 7.1 KB' },
      { id: 'f13', name: 'participation-caps.md', kind: 'doc', meta: 'Doc · 1.4 KB' },
    ],
    runs: '38 orders worked today',
    autonomy: 'Bounded',
  },
];

/* The desk clock. Every date in this file is measured against it rather than
   against the machine calendar, so the log reads the same tomorrow. */
export const TODAY = '2026-09-11';
export const YESTERDAY = '2026-09-10';

export const AGENT_EVENTS: AgentEvent[] = [
  /* ---- today ---- */
  {
    id: 'e11',
    agent: 'pm',
    state: 'doing',
    kind: 'decision',
    title: 'Weighing the AVGO resize against the cash floor',
    sub: 'Full size takes technology past the one-print rule',
    day: TODAY,
    at: '15:11',
    time: 'started 15:11',
    where: { label: 'the portfolio dashboard', role: 'pm' },
  },
  {
    id: 'e1',
    agent: 'execution',
    state: 'doing',
    kind: 'run',
    title: 'Working the AVGO parent order',
    sub: 'Sell 240,000 · 62% filled, behind schedule',
    day: TODAY,
    at: '14:32',
    time: 'started 14:32',
    where: { label: 'the trading desk', role: 'trader' },
  },
  {
    id: 'e3',
    agent: 'modelling',
    state: 'doing',
    kind: 'run',
    title: 'Sweeping the VRT backlog figure',
    sub: 'Backlog $6.5B to $7.8B, 84 of 130 runs',
    day: TODAY,
    at: '13:18',
    time: 'started 13:18',
    where: { label: 'the model testbox', role: 'analyst', view: 'testbox' },
  },
  {
    id: 'e2',
    agent: 'risk',
    state: 'doing',
    kind: 'run',
    title: 'Re-running VaR after the NVDA move',
    sub: 'Realised vol 5.4% against 1.1% fitted',
    day: TODAY,
    at: '09:41',
    time: 'started 09:41',
    where: { label: 'the risk review bench', role: 'risk', view: 'testbox' },
  },
  {
    id: 'e4',
    agent: 'research',
    state: 'pending',
    kind: 'escalation',
    outcome: 'escalated',
    title: 'VRT memo held on a source conflict',
    sub: 'Two filings at $7.4B against four at $6.9B',
    day: TODAY,
    at: '13:06',
    time: 'waiting 12m',
    where: { label: 'the research workspace', role: 'analyst' },
  },
  {
    id: 'e6',
    agent: 'execution',
    state: 'pending',
    kind: 'run',
    title: 'NVDA trim ready to work',
    sub: '$1.8M sliced 13:00 to 15:45, awaiting release',
    day: TODAY,
    at: '12:44',
    time: 'waiting 34m',
    where: { label: 'the trading desk', role: 'trader' },
  },
  {
    id: 'e5',
    agent: 'compliance',
    state: 'pending',
    kind: 'block',
    outcome: 'escalated',
    title: 'PLTR order blocked at the gate',
    sub: 'Restricted list, needs a human release',
    day: TODAY,
    at: '12:37',
    time: 'waiting 41m',
    where: { label: 'the portfolio dashboard', role: 'pm' },
  },
  {
    id: 'e8',
    agent: 'execution',
    state: 'done',
    kind: 'fill',
    outcome: 'clean',
    title: 'Filled the LLY buy',
    sub: '6,200 at 894.15, 1.8bp inside arrival',
    day: TODAY,
    at: '14:11',
    time: 'finished 14:11',
    where: { label: 'the trading desk', role: 'trader' },
  },
  {
    id: 'e12',
    agent: 'pm',
    state: 'done',
    kind: 'decision',
    outcome: 'clean',
    title: 'Refused the TSM top-up on the semis cap',
    sub: 'Sent the cap to the risk officer instead',
    day: TODAY,
    at: '13:52',
    time: 'finished 13:52',
    where: { label: 'the risk review bench', role: 'risk', view: 'testbox' },
  },
  {
    id: 'e9',
    agent: 'risk',
    state: 'done',
    kind: 'run',
    outcome: 'clean',
    title: 'Resolved the semis soft breach',
    sub: 'Proposed a balanced trim, sent to the PM',
    day: TODAY,
    at: '11:26',
    time: 'finished 11:26',
    where: { label: 'the portfolio dashboard', role: 'pm' },
  },
  {
    id: 'e10',
    agent: 'modelling',
    state: 'done',
    kind: 'escalation',
    outcome: 'failed',
    title: 'Rebuilt the AVGO margin bridge',
    sub: 'Failed its sanity check, escalated',
    day: TODAY,
    at: '10:52',
    time: 'finished 10:52',
    where: { label: 'the model testbox', role: 'analyst', view: 'testbox' },
  },
  {
    id: 'e7',
    agent: 'screener',
    state: 'done',
    kind: 'run',
    outcome: 'clean',
    title: 'Opened seven ideas from the morning sweep',
    sub: 'VRT, AVGO, NEE, DE, SHEL, ETN, PWR',
    day: TODAY,
    at: '09:14',
    time: 'finished 09:14',
    where: { label: 'the research workspace', role: 'analyst' },
  },

  /* ---- yesterday ---- */
  {
    id: 'e13',
    agent: 'pm',
    state: 'done',
    kind: 'decision',
    outcome: 'clean',
    title: 'Approved the NEE starter at 1.2%',
    sub: 'Funded out of the cash buffer, no trim needed',
    day: YESTERDAY,
    at: '16:04',
    time: 'finished 16:04',
    where: { label: 'the portfolio dashboard', role: 'pm' },
  },
  {
    id: 'e14',
    agent: 'risk',
    state: 'done',
    kind: 'run',
    outcome: 'clean',
    title: 'Nightly VaR refit cleared',
    sub: 'Realised vol inside the fitted envelope on every sleeve',
    day: YESTERDAY,
    at: '15:41',
    time: 'finished 15:41',
    where: { label: 'the risk review bench', role: 'risk', view: 'testbox' },
  },
  {
    id: 'e18',
    agent: 'modelling',
    state: 'done',
    kind: 'run',
    outcome: 'clean',
    title: 'Swept the DE parts-margin input',
    sub: '130 runs, the answer holds down to 38% gross',
    day: YESTERDAY,
    at: '14:22',
    time: 'finished 14:22',
    where: { label: 'the model testbox', role: 'analyst', view: 'testbox' },
  },
  {
    id: 'e15',
    agent: 'compliance',
    state: 'done',
    kind: 'block',
    outcome: 'escalated',
    title: 'Blocked the ARM add',
    sub: 'Quiet period on the secondary, released 16:30 by a person',
    day: YESTERDAY,
    at: '11:18',
    time: 'finished 11:18',
    where: { label: 'the portfolio dashboard', role: 'pm' },
  },
  {
    id: 'e16',
    agent: 'research',
    state: 'done',
    kind: 'run',
    outcome: 'clean',
    title: 'ETN memo published',
    sub: 'Four filings, two transcripts, conviction medium',
    day: YESTERDAY,
    at: '10:02',
    time: 'finished 10:02',
    where: { label: 'the research workspace', role: 'analyst' },
  },
  {
    id: 'e17',
    agent: 'screener',
    state: 'done',
    kind: 'run',
    outcome: 'clean',
    title: 'Opened five ideas from the morning sweep',
    sub: 'ETN, PWR, NEE, DE, SHEL',
    day: YESTERDAY,
    at: '09:12',
    time: 'finished 09:12',
    where: { label: 'the research workspace', role: 'analyst' },
  },

  /* ---- the session before ---- */
  {
    id: 'e19',
    agent: 'pm',
    state: 'done',
    kind: 'decision',
    outcome: 'clean',
    title: 'Cut the semis sleeve to 19.4%',
    sub: 'Went ahead of the cap rather than into it',
    day: '2026-09-09',
    at: '15:58',
    time: 'finished 15:58',
    where: { label: 'the portfolio dashboard', role: 'pm' },
  },
  {
    id: 'e20',
    agent: 'execution',
    state: 'done',
    kind: 'fill',
    outcome: 'clean',
    title: 'Filled the MSFT trim',
    sub: '18,400 at 512.80, 0.9bp inside arrival',
    day: '2026-09-09',
    at: '15:12',
    time: 'finished 15:12',
    where: { label: 'the trading desk', role: 'trader' },
  },
  {
    id: 'e22',
    agent: 'research',
    state: 'done',
    kind: 'note',
    outcome: 'clean',
    title: 'Added a note to the VRT idea',
    sub: 'The contract award is one customer, flagged for the memo',
    day: '2026-09-09',
    at: '13:44',
    time: 'finished 13:44',
    where: { label: 'the research workspace', role: 'analyst' },
  },
  {
    id: 'e21',
    agent: 'risk',
    state: 'done',
    kind: 'escalation',
    outcome: 'escalated',
    title: 'Escalated the duration overshoot',
    sub: 'A hard limit, so it went to the risk officer at 09:40',
    day: '2026-09-09',
    at: '09:36',
    time: 'finished 09:36',
    where: { label: 'the risk review bench', role: 'risk', view: 'testbox' },
  },
];

export const STATE_LABEL: Record<EventState, string> = {
  doing: 'Doing',
  pending: 'Pending',
  done: 'Done',
};

export function agentOf(id: string): Agent {
  return AGENTS.find((a) => a.id === id)!;
}

/* ---------------- the decision log ---------------- */

/* What the portfolio manager agent settled, and on what terms. The four
   calls are the whole vocabulary: anything that cannot be said in one of
   them is not a decision yet. */
export type DecisionCall = 'approved' | 'resized' | 'deferred' | 'refused';

export const CALL_LABEL: Record<DecisionCall, string> = {
  approved: 'Approved',
  resized: 'Resized',
  deferred: 'Deferred',
  refused: 'Refused',
};

export type Decision = {
  id: string;
  /* when exactly, on the desk clock */
  time: string;
  title: string;
  call: DecisionCall;
  /* what exactly was done */
  did: string;
  /* the reason, kept to the one that actually bound */
  why: string;
  /* where exactly: the surface it touched, so the log can open it */
  where: { label: string; role: Role; view?: 'testbox' };
  /* which agent raised the thing that was decided */
  raisedBy: string;
};

/* Newest first, the way the log is read. */
export const DECISIONS: Decision[] = [
  {
    id: 'd1',
    time: '15:18',
    title: 'AVGO add, funded out of MSFT',
    call: 'resized',
    did: 'Approved at 0.6% rather than the 0.9% drafted, with the MSFT trim cut to match.',
    why: 'The full size took technology past the point where one earnings print moves the book more than a percent.',
    where: { label: 'the portfolio dashboard', role: 'pm' },
    raisedBy: 'research',
  },
  {
    id: 'd2',
    time: '14:41',
    title: 'AVGO parent order falling behind schedule',
    call: 'approved',
    did: 'Released the rate change the execution agent asked for, lifting participation from 12% to 15% of volume.',
    why: 'The order was ten minutes behind with an hour of liquidity left, and the wider rate still sits inside the ceiling.',
    where: { label: 'the trading desk', role: 'trader' },
    raisedBy: 'execution',
  },
  {
    id: 'd3',
    time: '13:52',
    title: 'TSM top-up on the valuation gap',
    call: 'refused',
    did: 'Refused the 0.8% top-up and sent the semis cap to the risk officer instead.',
    why: 'The add would take semiconductors to 22.1% against a 20% hard cap, which no agent can release.',
    where: { label: 'the risk review bench', role: 'risk', view: 'testbox' },
    raisedBy: 'risk',
  },
  {
    id: 'd4',
    time: '13:20',
    title: 'VRT starter position',
    call: 'deferred',
    did: 'Held the 1.8% starter until the modelling agent finishes the backlog sweep.',
    why: 'The whole conviction rests on one contract, and the backlog figure is still disputed between two filings.',
    where: { label: 'the model testbox', role: 'analyst', view: 'testbox' },
    raisedBy: 'screener',
  },
  {
    id: 'd5',
    time: '11:34',
    title: 'Semis soft breach at 21.3%',
    call: 'approved',
    did: 'Took the balanced trim the risk agent proposed: 0.7% out of NVDA and 0.6% out of ASML.',
    why: 'The trim clears the cap before the close and leaves the sector thesis intact on both names.',
    where: { label: 'the portfolio dashboard', role: 'pm' },
    raisedBy: 'risk',
  },
  {
    id: 'd6',
    time: '11:02',
    title: 'PLTR position opened against the restricted list',
    call: 'refused',
    did: 'Refused the position and escalated the block to compliance for a human release.',
    why: 'The name went on the firm restricted list overnight, and no agent can release its own block.',
    where: { label: 'the portfolio dashboard', role: 'pm' },
    raisedBy: 'compliance',
  },
  {
    id: 'd7',
    time: '09:48',
    title: 'LLY buy at the open',
    call: 'approved',
    did: 'Approved 6,200 shares as drafted, worked against arrival.',
    why: 'Nothing in the mandate bound, and the cash buffer covered it without a funding trade.',
    where: { label: 'the trading desk', role: 'trader' },
    raisedBy: 'execution',
  },
  {
    id: 'd8',
    time: '09:21',
    title: 'Seven ideas from the morning sweep',
    call: 'resized',
    did: 'Sent three of the seven through to research and closed the rest without a memo.',
    why: 'Four of them repeat exposures the book already carries, so a memo would only restate what is held.',
    where: { label: 'the research workspace', role: 'analyst' },
    raisedBy: 'screener',
  },
];

/* The metric on the dashboard reads off the log rather than a number typed
   somewhere else, so the two can never disagree. */
export const DECISIONS_TODAY = DECISIONS.length;

/* ============================================================
   How the agents are actually running
   ============================================================ */

/* Every run an agent finishes ends one of three ways, and the split is the
   only performance number the desk trusts: a run that finished clean, one
   that stopped and asked for a person, and one that failed its own check.
   Percentages of the last hundred runs, so the three always sum to 100. */
export type AgentPerf = {
  clean: number;
  escalated: number;
  failed: number;
  /* runs per session over the last seven, oldest first */
  recent: number[];
  /* how long the middle run takes */
  median: string;
  /* change in the clean rate against the seven sessions before, in points */
  delta: number;
};

export const AGENT_PERF: Record<string, AgentPerf> = {
  pm: { clean: 86, escalated: 12, failed: 2, recent: [6, 9, 7, 8, 11, 9, 8], median: '4m 10s', delta: 1.2 },
  screener: { clean: 97, escalated: 3, failed: 0, recent: [14, 16, 15, 18, 15, 17, 16], median: '38s', delta: 0.4 },
  research: { clean: 88, escalated: 10, failed: 2, recent: [7, 6, 9, 8, 7, 9, 8], median: '6m 02s', delta: -1.8 },
  modelling: { clean: 81, escalated: 12, failed: 7, recent: [5, 7, 6, 4, 8, 7, 6], median: '11m 24s', delta: -3.1 },
  risk: { clean: 94, escalated: 5, failed: 1, recent: [188, 192, 176, 205, 198, 211, 203], median: '0.8s', delta: 0.6 },
  compliance: { clean: 99, escalated: 1, failed: 0, recent: [40, 38, 44, 41, 39, 46, 44], median: '0.4s', delta: 0 },
  execution: { clean: 91, escalated: 8, failed: 1, recent: [31, 28, 35, 33, 30, 37, 38], median: '2m 51s', delta: 2.4 },
};

export function perfOf(id: string): AgentPerf {
  return AGENT_PERF[id];
}

/* The three outcomes, named once so the ring, the legend and the tooltip
   cannot drift apart. */
export type Outcome = 'clean' | 'escalated' | 'failed';

export const OUTCOME_LABEL: Record<Outcome, string> = {
  clean: 'Finished clean',
  escalated: 'Asked a person',
  failed: 'Failed a check',
};

/* The one word that goes in the middle of the ring, which has room for
   one word. */
export const OUTCOME_SHORT: Record<Outcome, string> = {
  clean: 'clean',
  escalated: 'escalated',
  failed: 'failed',
};

export const OUTCOME_NOTE: Record<Outcome, string> = {
  clean: 'Ran to the end of its instructions with nothing to report.',
  escalated: 'Stopped on purpose and handed the work to someone who can decide.',
  failed: 'Disagreed with its own check and stopped short of an answer.',
};

export type DeskPerf = {
  /* runs in the last session, by outcome */
  counts: Record<Outcome, number>;
  runs: number;
  /* the clean rate, which is the figure in the middle of the ring */
  rate: number;
  /* points of clean rate gained or lost against the prior week */
  delta: number;
};

/* Rolled up from the agents rather than typed in, so the ring and the list
   can never tell two different stories. Each agent is weighted by the runs
   it actually did in the last session. */
export function deskPerf(ids: string[] = AGENTS.map((a) => a.id)): DeskPerf {
  const counts: Record<Outcome, number> = { clean: 0, escalated: 0, failed: 0 };
  let runs = 0;
  let weighted = 0;

  for (const id of ids) {
    const p = AGENT_PERF[id];
    if (!p) continue;
    const n = p.recent[p.recent.length - 1];
    runs += n;
    weighted += p.delta * n;
    counts.clean += Math.round((p.clean / 100) * n);
    counts.escalated += Math.round((p.escalated / 100) * n);
    counts.failed += Math.round((p.failed / 100) * n);
  }

  const total = counts.clean + counts.escalated + counts.failed || 1;
  return {
    counts,
    runs,
    rate: (counts.clean / total) * 100,
    delta: runs ? weighted / runs : 0,
  };
}

/* How many agents were working at once through the session. The load curve
   is what tells a person whether the desk is quiet or stacked, and it is the
   only place the answer is visible at a glance. */
export const LOAD: { at: string; n: number }[] = [
  { at: '08:00', n: 1 },
  { at: '09:00', n: 5 },
  { at: '10:00', n: 4 },
  { at: '11:00', n: 6 },
  { at: '12:00', n: 3 },
  { at: '13:00', n: 5 },
  { at: '14:00', n: 6 },
  { at: '15:00', n: 4 },
  { at: '16:00', n: 4 },
];

/* ---------------- what a run is doing this second ---------------- */

/* For anything still running: which instruction it is on, and the lines it
   has written since it started. Keyed by event, because the same agent can
   be on two runs at once. */
export type LiveRun = {
  /* the instruction it is on, one-based against the agent's own steps */
  at: number;
  /* what it is doing inside that instruction, in one line */
  note: string;
  /* what it has written so far, oldest first */
  log: { at: string; line: string }[];
};

export const LIVE_RUNS: Record<string, LiveRun> = {
  e11: {
    at: 3,
    note: 'Drafting the resize at 0.6% against the 0.9% asked for',
    log: [
      { at: '15:11', line: 'Collected 14 items raised since the 13:00 pass' },
      { at: '15:13', line: 'Cash floor holds at 2.1% with the AVGO add at full size' },
      { at: '15:16', line: 'Technology reaches 31.4%, past the one-print rule at 30%' },
    ],
  },
  e1: {
    at: 2,
    note: 'Holding 12% of volume against a 15% ceiling',
    log: [
      { at: '14:32', line: 'Sliced the parent into 9 child orders against arrival' },
      { at: '15:02', line: '148,800 of 240,000 filled, 1.4bp inside arrival' },
      { at: '15:19', line: 'Ten minutes behind schedule, asked the PM for a rate change' },
    ],
  },
  e3: {
    at: 3,
    note: 'Sweeping the backlog figure across $6.5B to $7.8B',
    log: [
      { at: '13:18', line: 'Seeded 41 parameters from the last four filings' },
      { at: '13:44', line: 'Run 40 of 130, the answer holds above $6.9B backlog' },
      { at: '14:51', line: 'Run 84 of 130, two runs flipped the sign below $6.7B' },
    ],
  },
  e2: {
    at: 4,
    note: 'Realised vol is outside the fitted envelope on the semis sleeve',
    log: [
      { at: '09:41', line: 'Re-fitted the covariance on 260 sessions' },
      { at: '10:20', line: 'Realised vol 5.4% against 1.1% fitted on NVDA' },
      { at: '14:58', line: 'Re-running the whole book at the wider envelope' },
    ],
  },
};

/* ---------------- reading the log by day ---------------- */

/* The days the log actually holds, newest first. The range filter offers
   these rather than a calendar, because a day with nothing on it is not a
   thing anyone wants to land on. */
export const DAYS: string[] = [...new Set(AGENT_EVENTS.map((e) => e.day))].sort().reverse();

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* Sep 11, 2026. Parsed off the string rather than through a Date, so the
   desk clock and the machine clock cannot disagree. */
export function dateOf(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${MONTHS[Number(m) - 1]} ${Number(d)}, ${y}`;
}

/* Today and Yesterday are what a person says, so the two most recent days
   say it. Everything older takes its date. */
export function dayLabel(iso: string): string {
  if (iso === TODAY) return 'Today';
  if (iso === YESTERDAY) return 'Yesterday';
  return dateOf(iso);
}

/* Sep 11, 2026 at 03:11 PM — the stamp the timeline puts on a row. */
export function stampOf(e: AgentEvent): string {
  const [h, m] = e.at.split(':').map(Number);
  const am = h < 12;
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${dateOf(e.day)} at ${String(hh).padStart(2, '0')}:${String(m).padStart(2, '0')} ${am ? 'AM' : 'PM'}`;
}

/* Ordering the log is a two-key sort the timeline would otherwise repeat in
   three places: newest day first, and inside a day the latest clock first. */
export function byNewest(a: AgentEvent, b: AgentEvent): number {
  return a.day === b.day ? b.at.localeCompare(a.at) : b.day.localeCompare(a.day);
}
