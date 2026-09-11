/* A task is a question the copilot keeps working after you walk away.

   A chat answers once and stops. A task carries a plan the desk can read
   while it runs, so the stepper at the top is the whole interface: you can
   tell from across the room how much of it is left. */

import type { Role } from '../components/TopBar';

/* Each step is one pass over the book. The note is what the agent was doing
   while that step was open, kept short enough to read at a glance. */
export type TaskStep = {
  label: string;
  note: string;
};

/* How often it should run again. 'once' is the default, and the only one that
   leaves nothing behind on the calendar. */
export type Repeat = 'once' | 'daily' | 'weekly';

export type Schedule = {
  repeat: Repeat;
  /* 24 hour clock, because the desk reads fills that way */
  time: string;
  /* only carried by a weekly schedule */
  day?: string;
};

/* What the task leaves behind. A task that finishes and says so has done
   nothing you can use, so the run ends in a file rather than a sentence. */
export type Result = {
  /* what it produced, named the way it is named where it lives */
  name: string;
  /* where it was filed, so it can be found without the panel */
  where: string;
  /* one line on what is inside it. Not a summary of the task. */
  note: string;
};

export type TaskRun = {
  id: string;
  /* what the task is called in a list */
  title: string;
  /* what it is a briefing for, which is not the same thing: the header reads
     "Briefing for <subject>" and a title would repeat itself there */
  subject: string;
  brief: string;
  steps: TaskStep[];
  /* how many steps have closed. The stepper is the only progress indicator. */
  done: number;
  started: string;
  result: Result;
  schedule?: Schedule;
};

export type Suggestion = {
  id: string;
  title: string;
  subject: string;
  note: string;
  result: Result;
  steps: TaskStep[];
};

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

/* Three to start from on every desk. The desk that has to write the same
   thing every morning is the one that wants a task rather than a chat, so
   the first suggestion on each role is the recurring one. */
export const SUGGESTED: Record<Role, Suggestion[]> = {
  pm: [
    {
      id: 'pm-brief',
      title: 'The morning briefing',
      subject: 'the open',
      result: { name: 'Morning briefing — 11 Sep.doc', where: 'Team drive · PM folder', note: 'Overnight moves, the agent log, and the four things that need you before the open' },
      note: 'Overnight moves, what the agents did, and what needs you before the open',
      steps: [
        { label: 'Read the book', note: 'Pulling the consolidated position file and overnight marks' },
        { label: 'Read the agents', note: 'Collecting every instruction the agent team ran overnight' },
        { label: 'Write the briefing', note: 'Ordering it by what costs the most to leave alone' },
      ],
    },
    {
      id: 'pm-limits',
      title: 'Watch the limits',
      subject: 'the mandate limits',
      result: { name: 'Limit watch — 11 Sep.xlsx', where: 'Team drive · Risk folder', note: 'Every limit with its current usage, and a drafted trim against the two closest' },
      note: 'Check every mandate limit and raise the ones inside a point of breaching',
      steps: [
        { label: 'Read the mandate', note: 'Loading sector, single-name and tracking error limits' },
        { label: 'Measure the book', note: 'Running each position against the limit it sits under' },
        { label: 'Raise the close ones', note: 'Drafting a trim for anything inside a point' },
      ],
    },
    {
      id: 'pm-attr',
      title: 'Attribute the week',
      subject: 'the week',
      result: { name: 'Weekly attribution.doc', where: 'Team drive · PM folder', note: 'The gap to the benchmark split into selection and allocation, sector by sector' },
      note: 'Split the gap to the benchmark into selection and allocation, name by name',
      steps: [
        { label: 'Pull the returns', note: 'Book and benchmark over the last five sessions' },
        { label: 'Split the gap', note: 'Separating selection from allocation on every sector' },
        { label: 'Write it up', note: 'One page, largest contributors first' },
      ],
    },
  ],
  analyst: [
    {
      id: 'an-screen',
      title: 'Run the screener',
      subject: 'the screener run',
      result: { name: 'Screen results — 11 Sep.xlsx', where: 'Idea hub · filed as ideas', note: 'Every survivor with the factor scores that ranked it and the sources behind them' },
      note: 'Sweep the universe on the house screen and file anything new as an idea',
      steps: [
        { label: 'Run the screen', note: 'Passing the universe through the house filters' },
        { label: 'Drop the knowns', note: 'Removing names already in the book or the backlog' },
        { label: 'File the rest', note: 'Writing each survivor into the idea log with its trigger' },
      ],
    },
    {
      id: 'an-recon',
      title: 'Reconcile the filings',
      subject: 'the new filings',
      result: { name: 'Filing reconciliation.doc', where: 'Team drive · Research folder', note: 'Each figure against the assumption it feeds, with every disagreement listed' },
      note: 'Read every new filing against the model it feeds and flag what disagrees',
      steps: [
        { label: 'Collect the filings', note: 'Everything filed since the last run' },
        { label: 'Match the models', note: 'Lining each figure up against the assumption it feeds' },
        { label: 'Flag the breaks', note: 'Listing every line the filing disagrees with' },
      ],
    },
    {
      id: 'an-model',
      title: 'Refresh the models',
      subject: 'the bench',
      result: { name: 'Bench refresh — 11 Sep.xlsx', where: 'Model testbox · bench', note: 'Every model marked to the close, with the ones that moved more than a point flagged' },
      note: 'Re-run every model on the bench against the latest marks and note what moved',
      steps: [
        { label: 'Load the bench', note: 'Every model with a live position behind it' },
        { label: 'Re-run them', note: 'Marking each one to the close' },
        { label: 'Note the drift', note: 'Writing up anything that moved more than a point' },
      ],
    },
  ],
  risk: [
    {
      id: 'rk-stress',
      title: 'Run the stress book',
      subject: 'the stress book',
      result: { name: 'Stress run — 11 Sep.xlsx', where: 'Risk review bench', note: 'Each standing scenario against the live book, ordered by how far past the limit it lands' },
      note: 'Put the book through every standing scenario and report what breaks first',
      steps: [
        { label: 'Load the scenarios', note: 'The standing set plus anything added this quarter' },
        { label: 'Shock the book', note: 'Running each scenario against the live position file' },
        { label: 'Report the breaks', note: 'Ordering by how far past the limit each one lands' },
      ],
    },
    {
      id: 'rk-limits',
      title: 'Limit sweep',
      subject: "today's limit sweep",
      result: { name: 'Limit sweep — 11 Sep.doc', where: 'Compliance log', note: 'Peak usage on every rule through the session, written to the sealed record' },
      note: 'Walk every rule in the mandate and record how close the book came today',
      steps: [
        { label: 'Read the rules', note: 'Every limit in force, including the quarter additions' },
        { label: 'Measure the day', note: 'Peak usage on each rule through the session' },
        { label: 'File the record', note: 'Writing the sweep to the compliance log' },
      ],
    },
    {
      id: 'rk-var',
      title: 'Reconcile VaR',
      subject: 'the VaR reconciliation',
      result: { name: 'VaR reconciliation.xlsx', where: 'Team drive · Risk folder', note: 'The overnight run against the position file, with the cause next to each unmatched line' },
      note: 'Check the overnight VaR run against the position file and explain the gap',
      steps: [
        { label: 'Pull both runs', note: 'Overnight VaR and the consolidated position file' },
        { label: 'Find the gap', note: 'Matching line by line until the difference is named' },
        { label: 'Explain it', note: 'Writing the cause next to each unmatched line' },
      ],
    },
  ],
  trader: [
    {
      id: 'td-quality',
      title: 'Execution quality',
      subject: "today's fills",
      result: { name: 'Execution quality — 11 Sep.xlsx', where: 'Team drive · Desk folder', note: 'Every fill scored against arrival and VWAP, worst spread first' },
      note: 'Score every fill against arrival and flag where the desk paid the most spread',
      steps: [
        { label: 'Pull the fills', note: 'Every fill on the blotter since the open' },
        { label: 'Score them', note: 'Measuring each against arrival and the day VWAP' },
        { label: 'Flag the worst', note: 'Listing where the desk gave up the most spread' },
      ],
    },
    {
      id: 'td-schedule',
      title: 'Watch the schedule',
      subject: 'the working orders',
      result: { name: 'Schedule check.xlsx', where: 'Trading desk · blotter', note: 'Filled against scheduled on every working order, with a rate change drafted for the laggards' },
      note: 'Track every working order against its schedule and raise the ones falling behind',
      steps: [
        { label: 'Read the orders', note: 'Every order still working on the desk' },
        { label: 'Check the pace', note: 'Filled against scheduled, order by order' },
        { label: 'Raise the laggards', note: 'Drafting a rate change for anything behind' },
      ],
    },
    {
      id: 'td-venue',
      title: 'Venue review',
      subject: "today's venues",
      result: { name: 'Venue review — 11 Sep.doc', where: 'Team drive · Desk folder', note: 'Effective spread paid by venue, and which ones are worth more or less of the flow' },
      note: 'Compare where the agent crossed today against where it got the better price',
      steps: [
        { label: 'Split by venue', note: 'Grouping the session by where each fill printed' },
        { label: 'Compare the prices', note: 'Effective spread paid on each venue' },
        { label: 'Recommend', note: 'Naming the venues worth more or less of the flow' },
      ],
    },
  ],
};

/* A task typed rather than picked still gets a plan, because the stepper is
   what makes it a task. The plan is generic on purpose: it says what the
   agent does with anything, not what it found. */
export function planFor(question: string): TaskStep[] {
  return [
    { label: 'Gather', note: 'Collecting the files and feeds this touches' },
    { label: 'Work it through', note: question },
    { label: 'Write it up', note: 'Putting the answer where the desk will find it' },
  ];
}

/* A typed task ends in a file too. It is named after what was asked, because
   that is the only thing known about it in advance. */
export function resultFor(question: string): Result {
  const short = question.length > 34 ? `${question.slice(0, 32).trim()}…` : question;
  return {
    name: `${short}.doc`,
    where: 'Team drive · your folder',
    note: 'The working, the sources it read, and the answer at the top',
  };
}

export function scheduleLabel(s: Schedule): string {
  if (s.repeat === 'once') return `Once, at ${s.time}`;
  if (s.repeat === 'daily') return `Every day at ${s.time}`;
  return `Every ${s.day ?? DAYS[0]} at ${s.time}`;
}
