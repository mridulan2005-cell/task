export type NodeKind = 'source' | 'assumption' | 'transform' | 'output';

export type GNode = {
  id: string;
  label: string;
  detail: string;
  kind: NodeKind;
  col: number;
  row: number;
};

export type GEdge = { from: string; to: string };

export type FeedKind = 'python' | 'sql' | 'excel' | 'csv' | 'api';

export type Feed = {
  id: string;
  name: string;
  kind: FeedKind;
  note: string;
  body: string;
};

export type ModelGraph = { nodes: GNode[]; edges: GEdge[]; feeds: Feed[] };

export const GRAPHS: Record<string, ModelGraph> = {
  backlog: {
    nodes: [
      { id: 'filings', label: 'Utility filings', detail: '16 filers, quarterly', kind: 'source', col: 0, row: 1 },
      { id: 'orders', label: 'Order book', detail: 'Company disclosure', kind: 'source', col: 0, row: 2 },
      { id: 'backlog', label: 'Backlog', detail: '$6.9B, disputed', kind: 'assumption', col: 1, row: 0 },
      { id: 'growth', label: 'Order growth', detail: '11.0% a year', kind: 'assumption', col: 1, row: 1 },
      { id: 'multiple', label: 'Exit multiple', detail: '18.5x', kind: 'assumption', col: 1, row: 3 },
      { id: 'bridge', label: 'Revenue bridge', detail: 'Backlog to revenue', kind: 'transform', col: 2, row: 1 },
      { id: 'entry', label: 'Entry price', detail: 'Multiple on year two', kind: 'transform', col: 2, row: 2 },
      { id: 'fair', label: 'Fair value', detail: 'Gap to the tape', kind: 'output', col: 3, row: 2 },
    ],
    edges: [
      { from: 'filings', to: 'backlog' },
      { from: 'filings', to: 'growth' },
      { from: 'orders', to: 'backlog' },
      { from: 'orders', to: 'growth' },
      { from: 'backlog', to: 'bridge' },
      { from: 'growth', to: 'bridge' },
      { from: 'bridge', to: 'entry' },
      { from: 'multiple', to: 'entry' },
      { from: 'entry', to: 'fair' },
    ],
    feeds: [
      {
        id: 'py',
        name: 'sensitivity.py',
        kind: 'python',
        note: 'Sweeps the disputed figure',
        body: `import pandas as pd\nfrom rise import model, sweep\n\nbook = model.load("vrt.backlog")\ngrid = sweep(book, "backlog", 6.5, 7.8, step=0.1)\n\nfair = grid.assign(\n    revenue=lambda d: d.backlog * (1 + d.growth) ** 2,\n    entry=lambda d: d.revenue * d.multiple,\n)\nfair[["backlog", "entry", "gap"]].to_csv("out/vrt_sweep.csv")`,
      },
      {
        id: 'sql',
        name: 'order_book.sql',
        kind: 'sql',
        note: 'Warehouse, refreshed nightly',
        body: `select\n  filer_id,\n  period_end,\n  sum(order_value) as backlog,\n  sum(order_value) filter (where booked_at > now() - interval '90 days') as recent\nfrom disclosures.orders\nwhere ticker = 'VRT'\ngroup by 1, 2\norder by period_end desc`,
      },
      {
        id: 'xls',
        name: 'utility_filings.xlsx',
        kind: 'excel',
        note: '16 filers, hand checked',
        body: `Sheet: load_revisions\n  A  filer                B  corridor        C  prior   D  revised   E  delta\n  1  Dominion             Northern Virginia   4.10%   8.40%     +4.30\n  2  Georgia Power        Atlanta metro       3.20%   6.90%     +3.70\n  3  Oncor                Dallas              2.80%   7.10%     +4.30\n  …  13 more filers\n\nSheet: reconciliation\n  Median revision  +4.20   Largest since 2021`,
      },
    ],
  },

  margin: {
    nodes: [
      { id: 'supplier', label: 'Supplier release', detail: 'Capacity guidance', kind: 'source', col: 0, row: 1 },
      { id: 'segments', label: 'Segment history', detail: 'Eight quarters', kind: 'source', col: 0, row: 2 },
      { id: 'mix', label: 'Custom mix', detail: '25% of revenue', kind: 'assumption', col: 1, row: 0 },
      { id: 'price', label: 'Pricing', detail: '+1.5%', kind: 'assumption', col: 1, row: 2 },
      { id: 'attrib', label: 'Attribution', detail: 'Capacity to customer', kind: 'transform', col: 1, row: 3 },
      { id: 'bridge', label: 'Margin bridge', detail: 'Mix to gross margin', kind: 'transform', col: 2, row: 1 },
      { id: 'gm', label: 'Gross margin', detail: 'Against consensus', kind: 'output', col: 3, row: 1 },
    ],
    edges: [
      { from: 'supplier', to: 'mix' },
      { from: 'supplier', to: 'attrib' },
      { from: 'segments', to: 'price' },
      { from: 'segments', to: 'bridge' },
      { from: 'mix', to: 'bridge' },
      { from: 'price', to: 'bridge' },
      { from: 'attrib', to: 'bridge' },
      { from: 'bridge', to: 'gm' },
    ],
    feeds: [
      {
        id: 'py',
        name: 'bridge.py',
        kind: 'python',
        note: 'Mix to margin',
        body: `from rise import segments, bridge\n\nhist = segments.load("AVGO", quarters=8)\nmix = hist.custom_silicon / hist.revenue\n\nout = bridge(\n    base=hist.gross_margin.iloc[-1],\n    mix=mix,\n    pricing=0.015,\n    opex_growth=0.06,\n)\nprint(out.summary())`,
      },
      {
        id: 'sql',
        name: 'segments.sql',
        kind: 'sql',
        note: 'Reported segments',
        body: `select quarter, segment, revenue, gross_profit\nfrom filings.segments\nwhere ticker = 'AVGO'\n  and quarter >= '2024Q1'\norder by quarter`,
      },
    ],
  },

  leadlag: {
    nodes: [
      { id: 'dealer', label: 'Dealer inventory', detail: 'Weekly, five regions', kind: 'source', col: 0, row: 1 },
      { id: 'orders', label: 'Regional orders', detail: 'Vendor feed, stale', kind: 'source', col: 0, row: 2 },
      { id: 'lead', label: 'Lead', detail: '2 quarters', kind: 'assumption', col: 1, row: 0 },
      { id: 'credit', label: 'Credit weight', detail: '35%', kind: 'assumption', col: 1, row: 2 },
      { id: 'align', label: 'Cycle alignment', detail: 'Four prior cycles', kind: 'transform', col: 2, row: 1 },
      { id: 'hit', label: 'Hit rate', detail: 'With exceptions', kind: 'output', col: 3, row: 1 },
    ],
    edges: [
      { from: 'dealer', to: 'lead' },
      { from: 'dealer', to: 'align' },
      { from: 'orders', to: 'align' },
      { from: 'lead', to: 'align' },
      { from: 'credit', to: 'align' },
      { from: 'align', to: 'hit' },
    ],
    feeds: [
      {
        id: 'py',
        name: 'leadlag.py',
        kind: 'python',
        note: 'Cross correlation',
        body: `from rise import series, leadlag\n\ninv = series.load("DE.dealer_inventory")\nord_ = series.load("DE.regional_orders")\n\nres = leadlag(inv, ord_, max_lag=4, weight_credit=0.35)\nres.report(exceptions=True)`,
      },
      {
        id: 'csv',
        name: 'cycles.csv',
        kind: 'csv',
        note: 'Four cycles, hand labelled',
        body: `cycle,start,end,driver,lead_quarters,held\n1998,1998Q2,2001Q4,demand,2,true\n2008,2008Q3,2010Q2,credit,1,false\n2014,2014Q1,2016Q3,demand,2,true\n2019,2019Q2,2020Q4,demand,3,true`,
      },
    ],
  },

  meanrev: {
    nodes: [
      { id: 'spread', label: 'Refining spread', detail: 'Daily, ten years', kind: 'source', col: 0, row: 1 },
      { id: 'band', label: 'Historical band', detail: 'Rolling two years', kind: 'transform', col: 1, row: 0 },
      { id: 'entry', label: 'Entry z', detail: '1.6 sigma', kind: 'assumption', col: 1, row: 1 },
      { id: 'half', label: 'Half life', detail: '35 days', kind: 'assumption', col: 1, row: 2 },
      { id: 'sim', label: 'Pair simulation', detail: 'Carry net', kind: 'transform', col: 2, row: 1 },
      { id: 'ret', label: 'Annualised return', detail: 'Before carry', kind: 'output', col: 3, row: 1 },
    ],
    edges: [
      { from: 'spread', to: 'band' },
      { from: 'spread', to: 'sim' },
      { from: 'band', to: 'sim' },
      { from: 'entry', to: 'sim' },
      { from: 'half', to: 'sim' },
      { from: 'sim', to: 'ret' },
    ],
    feeds: [
      {
        id: 'py',
        name: 'pair.py',
        kind: 'python',
        note: 'Backtest',
        body: `from rise import pair\n\nbt = pair.backtest(\n    long="SHEL", short="XOM",\n    entry_z=1.6, exit_z=0.4,\n    half_life=35, carry_bps=14,\n)\nprint(bt.annualised(), bt.max_drawdown())`,
      },
      {
        id: 'api',
        name: 'spreads.api',
        kind: 'api',
        note: 'Vendor endpoint',
        body: `GET /v2/spreads?product=refining&region=nwe&from=2016-01-01\n\n200 OK  ·  2,517 rows  ·  cached 4 min ago\n{ "date": "2026-09-10", "spread": 18.42, "z": 1.71 }`,
      },
    ],
  },
};

export const FEED_TYPES = [
  { id: 'python', label: 'Python script', sub: 'Runs in the model sandbox' },
  { id: 'sql', label: 'SQL query', sub: 'Against the warehouse' },
  { id: 'excel', label: 'Excel sheet', sub: 'Uploaded or linked' },
  { id: 'csv', label: 'CSV file', sub: 'Flat file' },
  { id: 'api', label: 'API endpoint', sub: 'Vendor feed' },
];

export const SUGGESTIONS: Record<string, string[]> = {
  backlog: [
    'Reconcile the two backlog filings',
    'Add a conversion lag node',
    'Swap the exit multiple for a peer median',
  ],
  margin: ['Test the attribution against a second customer', 'Add wafer yield as an input', 'Rebuild the bridge on nine quarters'],
  leadlag: ['Repoint the stale order feed', 'Weight the credit cycle up to 60%', 'Add a fifth region'],
  meanrev: ['Net the carry cost into the output', 'Widen the entry band to 2 sigma', 'Add a position cap node'],
};
