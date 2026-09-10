import type { Item } from './needs';

export const ANALYST_NEEDS: Item[] = [
  {
    id: 'A-1',
    priority: 'critical',
    agent: 'Research',
    title: 'Backlog conflict blocks the VRT memo',
    age: '12m',
    confidence: 62,
    context:
      'The Vertiv idea cleared every diligence gate except one. The entry multiple depends on a backlog figure that two of six sources report differently.',
    raised:
      'Two filings put the backlog at $7.4B against four that report $6.9B. The gap looks like a reporting boundary rather than a dispute over demand, but nobody has reconciled it, and the memo cannot go to committee until someone does.',
    evidence: [
      { k: 'Sources', v: '46 reviewed, 2 in conflict' },
      { k: 'Spread', v: '$6.9B against $7.4B' },
      { k: 'Effect', v: 'About one turn of multiple' },
      { k: 'Raised by', v: 'Screener agent at 09:14' },
    ],
    impact:
      'Sizing on the wrong figure misprices the entry by roughly a turn. Waiting costs entry price, since the name has already run today.',
    impactStats: [
      { k: 'Day move', v: '+3.42%', tone: 'up' },
      { k: 'Confidence', v: '62%', tone: 'warn' },
      { k: 'Proposed size', v: '1.8%' },
    ],
    via: 'Research agent',
    sources: [
      { label: 'Backlog comparison, 46 sources', kind: 'sheet' },
      { label: 'Vertiv Q3 transcript', kind: 'doc' },
      { label: 'vrt-model (repo)', kind: 'repo' },
      { label: 'Team drive, power research', kind: 'drive' },
    ],
    options: [
      {
        label: 'Reconcile first',
        text: 'Pull the two dissenting filings side by side and reconcile the reporting boundary before the memo moves. Hold the committee slot for tomorrow morning and keep the model on the conservative figure until it resolves.',
      },
      {
        label: 'Send both',
        text: 'Take the memo to committee with both backlog figures and the entry multiple shown under each. Flag the conflict on the front page rather than resolving it first.',
      },
      {
        label: 'Ask the source',
        text: 'Put the reconciliation question to the two dissenting sources directly and hold the memo until they answer. Expect a two day delay.',
      },
    ],
  },
  {
    id: 'A-2',
    priority: 'high',
    agent: 'Modelling',
    title: 'Margin bridge failed its sanity check',
    age: '38m',
    confidence: 74,
    context: 'The Broadcom margin bridge runs the mix shift through to gross margin. It is one of three models feeding the AVGO idea.',
    raised:
      'The run returned a 1.4 point margin lift, which sits outside the band the same model produced on eight prior quarters. Either the mix input is wrong or the relationship has changed.',
    evidence: [
      { k: 'Output', v: '+1.4pts gross margin' },
      { k: 'Historic band', v: '+0.2 to +0.9pts' },
      { k: 'Suspect input', v: 'Mix share, inferred' },
      { k: 'Run', v: 'M-4471 at 13:52' },
    ],
    impact:
      'The whole AVGO case rests on this bridge. Publishing the number without resolving it would put an unsupported figure in front of the committee.',
    impactStats: [
      { k: 'Idea affected', v: 'AVGO' },
      { k: 'Out of band by', v: '0.5pts', tone: 'warn' },
      { k: 'Sources', v: '31' },
    ],
    via: 'Modelling agent',
    sources: [
      { label: 'margin-bridge (repo)', kind: 'repo' },
      { label: 'Segment history, eight quarters', kind: 'sheet' },
      { label: 'Supplier capacity release', kind: 'doc' },
    ],
    options: [
      {
        label: 'Re-run bounded',
        text: 'Re-run the bridge with mix held at 20, 25 and 30 percent and report the range rather than a point estimate. Takes about six minutes and needs no new data.',
      },
      {
        label: 'Check the input',
        text: 'Verify the inferred mix share against the supplier disclosure before running anything else. If the capacity serves a second customer the input is wrong, not the model.',
      },
    ],
  },
  {
    id: 'A-3',
    priority: 'high',
    agent: 'Data',
    title: 'Regional order feed went stale six hours ago',
    age: '6h',
    confidence: 99,
    context: 'The Deere idea is in testing against a regional order series that updates hourly through the vendor feed.',
    raised:
      'The feed last delivered at 08:02 and has returned empty since. The lead-lag test currently running is reading the stale copy without knowing it.',
    evidence: [
      { k: 'Last good tick', v: 'Today 08:02' },
      { k: 'Affected run', v: 'M-4468, 91% complete' },
      { k: 'Vendor status', v: 'No incident posted' },
      { k: 'Fallback', v: 'Weekly file, 4 days old' },
    ],
    impact:
      'A test that finishes on stale data looks finished. The result would carry the same confidence as a clean run with none of the support.',
    impactStats: [
      { k: 'Run progress', v: '91%', tone: 'warn' },
      { k: 'Feed age', v: '6h', tone: 'down' },
      { k: 'Ideas affected', v: '1' },
    ],
    via: 'Data agent',
    sources: [
      { label: 'Regional order feed', kind: 'feed' },
      { label: 'Dealer inventory series', kind: 'sheet' },
      { label: 'data-ops thread', kind: 'chat' },
    ],
    options: [
      {
        label: 'Halt the run',
        text: 'Stop M-4468 at 91% and mark the result unusable. Restart automatically once the feed delivers two clean ticks in a row.',
      },
      {
        label: 'Swap the source',
        text: 'Point the run at the weekly file, accept the four day lag and label the output accordingly. The lead-lag signal survives a four day lag.',
      },
    ],
  },
  {
    id: 'A-4',
    priority: 'routine',
    agent: 'Screener',
    title: 'Approve the weekly screen parameters',
    age: '1d',
    confidence: 88,
    context: 'The screener runs every Monday at 06:00 against the parameter set you approved last quarter.',
    raised:
      'Two of the screens have drifted past their hit-rate floor. The agent proposes tightening the quality gate and widening the market cap band before the next run.',
    evidence: [
      { k: 'Screens below floor', v: '2 of 7' },
      { k: 'Hit rate', v: '11% against a 15% floor' },
      { k: 'Proposed change', v: 'Quality gate, cap band' },
      { k: 'Next run', v: 'Monday 06:00' },
    ],
    impact: 'Leaving the parameters alone means another week of thin output from two screens that already produced nothing usable.',
    impactStats: [
      { k: 'Ideas last week', v: '3' },
      { k: 'Hit rate', v: '11%', tone: 'warn' },
      { k: 'Runs affected', v: '7' },
    ],
    via: 'Screener agent',
    sources: [
      { label: 'Screen parameter set', kind: 'sheet' },
      { label: 'Hit rate history', kind: 'sheet' },
      { label: 'screener (repo)', kind: 'repo' },
    ],
    options: [
      {
        label: 'Accept both',
        text: 'Tighten the quality gate and widen the market cap band as proposed, effective from Monday. The agent will report the hit rate again in two weeks.',
      },
      {
        label: 'Gate only',
        text: 'Tighten the quality gate but leave the cap band alone, so only one variable changes and the effect stays readable.',
      },
      { label: 'Leave as is', text: 'Keep the current parameters for another two weeks and revisit with a longer sample.' },
    ],
  },
];
