export type NodeKind = 'source' | 'input' | 'formula' | 'ai' | 'output';

export type Port = { label: string; value?: string };

export type GNode = {
  id: string;
  label: string;
  kind: NodeKind;
  col: number;
  row: number;
  ins?: Port[];
  outs?: string[];
};

export type GEdge = { from: string; fromPort?: number; to: string; toPort?: number };

export type FeedKind = 'python' | 'sql' | 'excel' | 'csv' | 'api';

export type Feed = { id: string; name: string; kind: FeedKind; note: string; body: string };

export type ModelGraph = { nodes: GNode[]; edges: GEdge[]; feeds: Feed[] };

export const KIND_LABEL: Record<NodeKind, string> = {
  source: 'Source',
  input: 'Input',
  formula: 'Formula',
  ai: 'Agent',
  output: 'Output',
};

export const GRAPHS: Record<string, ModelGraph> = {
  backlog: {
    nodes: [
      { id: 'filings', label: 'Utility filings', kind: 'source', col: 0, row: 0, outs: ['Load revisions', 'Corridors'] },
      { id: 'orders', label: 'Order book', kind: 'source', col: 0, row: 1, outs: ['Backlog', 'Bookings'] },
      {
        id: 'assume',
        label: 'Assumptions',
        kind: 'input',
        col: 1,
        row: 0,
        ins: [
          { label: 'Backlog', value: '6.9' },
          { label: 'Growth', value: '11.0' },
          { label: 'Multiple', value: '18.5' },
        ],
        outs: ['Set'],
      },
      { id: 'reconcile', label: 'Reconcile filings', kind: 'ai', col: 1, row: 1, ins: [{ label: 'Sources' }], outs: ['Agreed', 'Conflicts'] },
      { id: 'bridge', label: 'Revenue bridge', kind: 'formula', col: 2, row: 0, ins: [{ label: 'Backlog' }, { label: 'Growth' }], outs: ['Revenue'] },
      { id: 'entry', label: 'Entry price', kind: 'formula', col: 2, row: 1, ins: [{ label: 'Revenue' }, { label: 'Multiple' }], outs: ['Price'] },
      { id: 'fair', label: 'Fair value', kind: 'output', col: 3, row: 0, ins: [{ label: 'Price' }, { label: 'Conflicts' }], outs: ['Gap to tape'] },
    ],
    edges: [
      { from: 'filings', fromPort: 0, to: 'assume', toPort: 0 },
      { from: 'filings', fromPort: 1, to: 'reconcile', toPort: 0 },
      { from: 'orders', fromPort: 0, to: 'assume', toPort: 0 },
      { from: 'orders', fromPort: 1, to: 'assume', toPort: 1 },
      { from: 'assume', fromPort: 0, to: 'bridge', toPort: 0 },
      { from: 'assume', fromPort: 0, to: 'bridge', toPort: 1 },
      { from: 'assume', fromPort: 0, to: 'entry', toPort: 1 },
      { from: 'bridge', fromPort: 0, to: 'entry', toPort: 0 },
      { from: 'entry', fromPort: 0, to: 'fair', toPort: 0 },
      { from: 'reconcile', fromPort: 1, to: 'fair', toPort: 1 },
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
      { id: 'supplier', label: 'Supplier release', kind: 'source', col: 0, row: 0, outs: ['Capacity', 'Programme'] },
      { id: 'segments', label: 'Segment history', kind: 'source', col: 0, row: 1, outs: ['Revenue', 'Gross profit'] },
      { id: 'attrib', label: 'Attribution', kind: 'ai', col: 1, row: 0, ins: [{ label: 'Capacity' }], outs: ['Customer', 'Confidence'] },
      {
        id: 'assume',
        label: 'Assumptions',
        kind: 'input',
        col: 1,
        row: 1,
        ins: [
          { label: 'Mix', value: '25' },
          { label: 'Pricing', value: '1.5' },
          { label: 'Opex', value: '6.0' },
        ],
        outs: ['Set'],
      },
      { id: 'bridge', label: 'Margin bridge', kind: 'formula', col: 2, row: 0, ins: [{ label: 'Mix' }, { label: 'Pricing' }, { label: 'Base' }], outs: ['Delta'] },
      { id: 'gm', label: 'Gross margin', kind: 'output', col: 3, row: 0, ins: [{ label: 'Delta' }], outs: ['Vs consensus'] },
    ],
    edges: [
      { from: 'supplier', fromPort: 0, to: 'attrib', toPort: 0 },
      { from: 'supplier', fromPort: 1, to: 'assume', toPort: 0 },
      { from: 'segments', fromPort: 0, to: 'assume', toPort: 1 },
      { from: 'segments', fromPort: 1, to: 'bridge', toPort: 2 },
      { from: 'attrib', fromPort: 0, to: 'bridge', toPort: 0 },
      { from: 'assume', fromPort: 0, to: 'bridge', toPort: 1 },
      { from: 'bridge', fromPort: 0, to: 'gm', toPort: 0 },
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
      { id: 'dealer', label: 'Dealer inventory', kind: 'source', col: 0, row: 0, outs: ['Units', 'Regions'] },
      { id: 'orders', label: 'Regional orders', kind: 'source', col: 0, row: 1, outs: ['Orders'] },
      {
        id: 'assume',
        label: 'Assumptions',
        kind: 'input',
        col: 1,
        row: 0,
        ins: [
          { label: 'Lead', value: '2' },
          { label: 'Credit', value: '35' },
        ],
        outs: ['Set'],
      },
      { id: 'label', label: 'Cycle labelling', kind: 'ai', col: 1, row: 1, ins: [{ label: 'History' }], outs: ['Cycles'] },
      { id: 'align', label: 'Cross correlation', kind: 'formula', col: 2, row: 0, ins: [{ label: 'Inventory' }, { label: 'Orders' }, { label: 'Cycles' }], outs: ['Fit'] },
      { id: 'hit', label: 'Hit rate', kind: 'output', col: 3, row: 0, ins: [{ label: 'Fit' }], outs: ['With exceptions'] },
    ],
    edges: [
      { from: 'dealer', fromPort: 0, to: 'align', toPort: 0 },
      { from: 'dealer', fromPort: 1, to: 'label', toPort: 0 },
      { from: 'orders', fromPort: 0, to: 'align', toPort: 1 },
      { from: 'assume', fromPort: 0, to: 'align', toPort: 0 },
      { from: 'label', fromPort: 0, to: 'align', toPort: 2 },
      { from: 'align', fromPort: 0, to: 'hit', toPort: 0 },
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
      { id: 'spread', label: 'Refining spread', kind: 'source', col: 0, row: 0, outs: ['Daily', 'Ten years'] },
      { id: 'band', label: 'Historical band', kind: 'formula', col: 1, row: 0, ins: [{ label: 'Series' }], outs: ['Mean', 'Sigma'] },
      {
        id: 'assume',
        label: 'Assumptions',
        kind: 'input',
        col: 1,
        row: 1,
        ins: [
          { label: 'Entry z', value: '1.6' },
          { label: 'Exit z', value: '0.4' },
          { label: 'Half life', value: '35' },
        ],
        outs: ['Set'],
      },
      { id: 'sim', label: 'Pair simulation', kind: 'formula', col: 2, row: 0, ins: [{ label: 'Band' }, { label: 'Rules' }, { label: 'Prices' }], outs: ['Path'] },
      { id: 'ret', label: 'Annualised return', kind: 'output', col: 3, row: 0, ins: [{ label: 'Path' }], outs: ['Before carry'] },
    ],
    edges: [
      { from: 'spread', fromPort: 0, to: 'band', toPort: 0 },
      { from: 'spread', fromPort: 1, to: 'sim', toPort: 2 },
      { from: 'band', fromPort: 0, to: 'sim', toPort: 0 },
      { from: 'assume', fromPort: 0, to: 'sim', toPort: 1 },
      { from: 'sim', fromPort: 0, to: 'ret', toPort: 0 },
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
  backlog: ['Reconcile the two backlog filings', 'Add a conversion lag node', 'Swap the exit multiple for a peer median'],
  margin: ['Test the attribution against a second customer', 'Add wafer yield as an input', 'Rebuild the bridge on nine quarters'],
  leadlag: ['Repoint the stale order feed', 'Weight the credit cycle up to 60%', 'Add a fifth region'],
  meanrev: ['Net the carry cost into the output', 'Widen the entry band to 2 sigma', 'Add a position cap node'],
};
