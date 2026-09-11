import type { Role } from '../components/TopBar';

/* Twelve columns. A widget takes a third, a half or the whole row, and never
   anything in between, so that a dashboard built by hand still lines up. */
export type Span = 4 | 6 | 12;

export type WidgetGroup = 'Portfolio' | 'Risk' | 'Execution' | 'Research';

export type WidgetDef = {
  id: string;
  name: string;
  blurb: string;
  group: WidgetGroup;
  /* the widths this one reads well at, narrowest first; a table that needs the
     full row simply does not offer the others */
  spans: Span[];
  /* the desk it was drawn for. Every widget can still be added by anyone, this
     only decides what the catalogue offers first. */
  home: Role[];
};

export type Placed = { id: string; span: Span };

export const WIDGETS: WidgetDef[] = [
  {
    id: 'metrics',
    name: 'Fund metrics',
    blurb: 'Net asset value, day P/L and the four figures you choose beside them',
    group: 'Portfolio',
    spans: [12],
    home: ['pm', 'risk'],
  },
  {
    id: 'portfolio',
    name: 'Portfolio performance',
    blurb: 'The book against its benchmarks over any range',
    group: 'Portfolio',
    spans: [12, 6],
    home: ['pm', 'risk', 'trader', 'analyst'],
  },
  {
    id: 'holdings',
    name: 'Positions and transactions',
    blurb: 'Holdings, the day’s transactions and what the monitors are watching',
    group: 'Portfolio',
    spans: [12],
    home: ['pm'],
  },
  {
    id: 'allocation',
    name: 'Asset allocation',
    blurb: 'Weights by sector, agent or region, with drift against the mandate',
    group: 'Portfolio',
    spans: [6, 12],
    home: ['pm'],
  },
  {
    id: 'watchlist',
    name: 'Watchlist',
    blurb: 'The names you follow, with the intraday tape beside each one',
    group: 'Portfolio',
    spans: [6, 4, 12],
    home: ['pm', 'trader', 'analyst'],
  },
  {
    id: 'workbench',
    name: 'Research workbench',
    blurb: 'Ideas on one side, the filings and threads that back them on the other',
    group: 'Research',
    spans: [12],
    home: ['analyst'],
  },
  {
    id: 'signals',
    name: 'Investment signals',
    blurb: 'What the screener raised, ready to tag for the copilot',
    group: 'Research',
    spans: [12, 6],
    home: ['pm', 'analyst'],
  },
  {
    id: 'trade-metrics',
    name: 'Execution metrics',
    blurb: 'Filled, slippage, what is still working and how much was crossed',
    group: 'Execution',
    spans: [12],
    home: ['trader'],
  },
  {
    id: 'blotter',
    name: 'Trade blotter',
    blurb: 'Every order the desk worked today and who worked it',
    group: 'Execution',
    spans: [12],
    home: ['trader'],
  },
  {
    id: 'risk-stats',
    name: 'Risk headline',
    blurb: 'Five figures the risk desk reads before anything else',
    group: 'Risk',
    spans: [12],
    home: ['risk'],
  },
  {
    id: 'risk-state',
    name: 'Risk state',
    blurb: 'Current exposure against every limit in the mandate',
    group: 'Risk',
    spans: [6, 12],
    home: ['risk', 'pm'],
  },
  {
    id: 'protection',
    name: 'Risk protection',
    blurb: 'What the agents stopped today, and what it was worth',
    group: 'Risk',
    spans: [6, 4, 12],
    home: ['risk'],
  },
  {
    id: 'ideas-feed',
    name: 'Ideas surfaced',
    blurb: 'What the agents opened today, newest first, straight into the hub',
    group: 'Research',
    spans: [6, 12, 4],
    home: ['analyst', 'pm'],
  },
  {
    id: 'research-activity',
    name: 'What the agents read',
    blurb: 'Every sweep the research agents ran today and what came out of it',
    group: 'Research',
    spans: [6, 12],
    home: ['analyst'],
  },
  {
    id: 'activity',
    name: 'Agent activity',
    blurb: 'The overnight run, resolved and unresolved',
    group: 'Risk',
    spans: [6, 12],
    home: ['risk', 'pm'],
  },
  {
    id: 'evaluation',
    name: 'AI risk evaluation',
    blurb: 'How an order is resized to stay inside the limits',
    group: 'Risk',
    spans: [12],
    home: ['risk'],
  },
  {
    id: 'simulation',
    name: 'Continuous simulation',
    blurb: 'Scenarios run against the book through the day',
    group: 'Risk',
    spans: [6, 12],
    home: ['risk'],
  },
];

export const GROUPS: WidgetGroup[] = ['Portfolio', 'Risk', 'Execution', 'Research'];

export function widgetDef(id: string): WidgetDef | undefined {
  return WIDGETS.find((w) => w.id === id);
}

/* What a new account is handed. The role decides the starting layout, and the
   first thing anyone does with it is change it. */
export const ROLE_LAYOUT: Record<Role, Placed[]> = {
  pm: [
    { id: 'metrics', span: 12 },
    { id: 'portfolio', span: 12 },
    { id: 'holdings', span: 12 },
    { id: 'allocation', span: 6 },
    { id: 'activity', span: 6 },
    { id: 'signals', span: 12 },
  ],
  trader: [
    { id: 'trade-metrics', span: 12 },
    { id: 'portfolio', span: 12 },
    { id: 'blotter', span: 12 },
    { id: 'watchlist', span: 6 },
    { id: 'allocation', span: 6 },
  ],
  risk: [
    { id: 'risk-stats', span: 12 },
    { id: 'risk-state', span: 6 },
    { id: 'protection', span: 6 },
    { id: 'portfolio', span: 12 },
    { id: 'activity', span: 6 },
    { id: 'simulation', span: 6 },
    { id: 'evaluation', span: 12 },
  ],
  /* The analyst reads the book like everyone else, then reads what the agents
     read. The workspace itself is a tab now, not a widget. */
  analyst: [
    { id: 'portfolio', span: 12 },
    { id: 'ideas-feed', span: 6 },
    { id: 'research-activity', span: 6 },
    { id: 'watchlist', span: 6 },
    { id: 'signals', span: 6 },
  ],
};

/* Bumped with the analyst layout, so a saved v1 board does not strand anyone
   on the old workbench-as-widget arrangement. */
const KEY = 'rise.dashboard.v2';

export function loadLayout(role: Role): Placed[] {
  try {
    const raw = window.localStorage.getItem(`${KEY}.${role}`);
    if (!raw) return ROLE_LAYOUT[role];
    const saved = JSON.parse(raw) as Placed[];
    /* A widget that has since been retired is dropped rather than crashing the
       dashboard someone saved a month ago. */
    const clean = saved.filter((p) => widgetDef(p.id));
    return clean.length ? clean : ROLE_LAYOUT[role];
  } catch {
    return ROLE_LAYOUT[role];
  }
}

/* Whether this desk has ever been rearranged, which is how the dashboard
   knows to explain the starting layout once and then stop. */
export function hasLayout(role: Role): boolean {
  try {
    return window.localStorage.getItem(`${KEY}.${role}`) !== null;
  } catch {
    return false;
  }
}

export function saveLayout(role: Role, items: Placed[]) {
  try {
    window.localStorage.setItem(`${KEY}.${role}`, JSON.stringify(items));
  } catch {
    /* a private window is allowed to forget the layout */
  }
}

export function clearLayout(role: Role) {
  try {
    window.localStorage.removeItem(`${KEY}.${role}`);
  } catch {
    /* nothing to clear */
  }
}
