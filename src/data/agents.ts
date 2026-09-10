/* The agents the desk runs, what each one is told to do, and what all of
   them are doing right now. */

import type { Role } from '../components/TopBar';

export type EventState = 'doing' | 'pending' | 'done';

export type AgentEvent = {
  id: string;
  agent: string;
  state: EventState;
  title: string;
  sub: string;
  time: string;
  /* how far through, for anything still running */
  progress?: number;
  /* the surface this work is happening on, so a row can jump to it */
  where: { label: string; role: Role; view?: 'testbox' };
};

export type AgentFile = {
  id: string;
  name: string;
  kind: 'skill' | 'doc' | 'sheet';
  meta: string;
};

export type Agent = {
  id: string;
  name: string;
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
  {
    id: 'screener',
    name: 'Screener',
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

export const AGENT_EVENTS: AgentEvent[] = [
  {
    id: 'e1',
    agent: 'execution',
    state: 'doing',
    title: 'Working the AVGO parent order',
    sub: 'Sell 240,000 · 62% filled, behind schedule',
    time: 'started 14:32',
    progress: 62,
    where: { label: 'the trading desk', role: 'trader' },
  },
  {
    id: 'e2',
    agent: 'risk',
    state: 'doing',
    title: 'Re-running VaR after the NVDA move',
    sub: 'Realised vol 5.4% against 1.1% fitted',
    time: 'started 09:41',
    progress: 78,
    where: { label: 'the risk review bench', role: 'risk', view: 'testbox' },
  },
  {
    id: 'e3',
    agent: 'modelling',
    state: 'doing',
    title: 'Sweeping the VRT backlog figure',
    sub: 'Backlog $6.5B to $7.8B, 84 of 130 runs',
    time: 'started 13:18',
    progress: 65,
    where: { label: 'the model testbox', role: 'analyst', view: 'testbox' },
  },
  {
    id: 'e4',
    agent: 'research',
    state: 'pending',
    title: 'VRT memo held on a source conflict',
    sub: 'Two filings at $7.4B against four at $6.9B',
    time: 'waiting 12m',
    where: { label: 'the research workspace', role: 'analyst' },
  },
  {
    id: 'e5',
    agent: 'compliance',
    state: 'pending',
    title: 'PLTR order blocked at the gate',
    sub: 'Restricted list, needs a human release',
    time: 'waiting 41m',
    where: { label: 'the portfolio dashboard', role: 'pm' },
  },
  {
    id: 'e6',
    agent: 'execution',
    state: 'pending',
    title: 'NVDA trim ready to work',
    sub: '$1.8M sliced 13:00 to 15:45, awaiting release',
    time: 'waiting 34m',
    where: { label: 'the trading desk', role: 'trader' },
  },
  {
    id: 'e7',
    agent: 'screener',
    state: 'done',
    title: 'Opened seven ideas from the morning sweep',
    sub: 'VRT, AVGO, NEE, DE, SHEL, ETN, PWR',
    time: 'finished 09:14',
    where: { label: 'the research workspace', role: 'analyst' },
  },
  {
    id: 'e8',
    agent: 'execution',
    state: 'done',
    title: 'Filled the LLY buy',
    sub: '6,200 at 894.15, 1.8bp inside arrival',
    time: 'finished 14:11',
    where: { label: 'the trading desk', role: 'trader' },
  },
  {
    id: 'e9',
    agent: 'risk',
    state: 'done',
    title: 'Resolved the semis soft breach',
    sub: 'Proposed a balanced trim, sent to the PM',
    time: 'finished 11:26',
    where: { label: 'the portfolio dashboard', role: 'pm' },
  },
  {
    id: 'e10',
    agent: 'modelling',
    state: 'done',
    title: 'Rebuilt the AVGO margin bridge',
    sub: 'Failed its sanity check, escalated',
    time: 'finished 10:52',
    where: { label: 'the model testbox', role: 'analyst', view: 'testbox' },
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
