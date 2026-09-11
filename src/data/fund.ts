export type Point = { t: string; v: number };

/* Deterministic pseudo-random walk so the chart looks like a real NAV series. */
function series(n: number, start: number, drift: number, vol: number, seed: number): number[] {
  let s = seed;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296 - 0.5;
  };
  const out: number[] = [];
  let v = start;
  for (let i = 0; i < n; i++) {
    v = v * (1 + drift + rnd() * vol);
    out.push(v);
  }
  return out;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function label(i: number, n: number, range: string): string {
  if (range === '1D') {
    const mins = 9 * 60 + 30 + Math.round((i / (n - 1)) * 390);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
  }
  if (range === '1W' || range === '1M') {
    const d = new Date(2026, 8, 10);
    d.setDate(d.getDate() - (n - 1 - i));
    return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  }
  const monthsBack = range === '3M' ? 3 : range === 'YTD' ? 8 : range === '1Y' ? 12 : 36;
  const d = new Date(2026, 8, 10);
  d.setMonth(d.getMonth() - Math.round((1 - i / (n - 1)) * monthsBack));
  return `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
}

export const RANGES = ['1D', '1W', '1M', '3M', 'YTD', '1Y', 'ALL'] as const;
export type Range = (typeof RANGES)[number];

const SPEC: Record<Range, [number, number, number, number, number]> = {
  //        points  start     drift     vol     seed
  '1D': [78, 128.05, 0.00012, 0.0016, 7],
  '1W': [35, 126.4, 0.0006, 0.0028, 19],
  '1M': [44, 121.9, 0.0012, 0.004, 33],
  '3M': [62, 112.6, 0.0021, 0.0055, 51],
  YTD: [80, 96.4, 0.0032, 0.0062, 88],
  '1Y': [96, 88.1, 0.0035, 0.0068, 104],
  ALL: [120, 42.0, 0.0091, 0.0074, 211],
};

/* Headline return for each range. The generated walk is stretched to land on
   these exactly, so the chart and the printed percentages never disagree. */
export const RETURN: Record<Range, number> = {
  '1D': 0.84,
  '1W': 1.92,
  '1M': 3.12,
  '3M': 6.44,
  YTD: 12.41,
  '1Y': 15.83,
  ALL: 186.4,
};

const END = 128.43;

export function navSeries(range: Range): Point[] {
  const [n, start, drift, vol, seed] = SPEC[range];
  const raw = series(n, start, drift, vol, seed);
  const scaled = raw.map((v) => (v * END) / raw[raw.length - 1]);
  const wantFirst = END / (1 + RETURN[range] / 100);
  const corr = wantFirst / scaled[0];
  return scaled.map((v, i) => ({
    t: label(i, n, range),
    v: +(v * Math.pow(corr, 1 - i / (n - 1))).toFixed(3),
  }));
}

export const BENCH: Record<Range, number> = {
  '1D': 0.19,
  '1W': 0.62,
  '1M': 1.94,
  '3M': 4.11,
  YTD: 9.82,
  '1Y': 12.44,
  ALL: 61.2,
};

/* ---------------- positions ---------------- */

export type Position = {
  ticker: string;
  name: string;
  sector: string;
  qty: number;
  price: number;
  weight: number;
  dayPct: number;
  pnl: number;
  agent: string;
};

export const POSITIONS: Position[] = [
  { ticker: 'NVDA', name: 'NVIDIA Corp', sector: 'Semis', qty: 18400, price: 184.22, weight: 9.4, dayPct: 2.14, pnl: 1284400, agent: 'Momentum' },
  { ticker: 'MSFT', name: 'Microsoft Corp', sector: 'Software', qty: 21050, price: 512.6, weight: 8.1, dayPct: 0.42, pnl: 942120, agent: 'Quality' },
  { ticker: 'LLY', name: 'Eli Lilly & Co', sector: 'Pharma', qty: 6200, price: 894.15, weight: 7.6, dayPct: -0.88, pnl: 611800, agent: 'Quality' },
  { ticker: 'TSM', name: 'Taiwan Semi ADR', sector: 'Semis', qty: 32800, price: 241.9, weight: 6.2, dayPct: 1.63, pnl: 508440, agent: 'Momentum' },
  { ticker: 'JPM', name: 'JPMorgan Chase', sector: 'Financials', qty: 14700, price: 288.4, weight: 5.4, dayPct: 0.21, pnl: 214900, agent: 'Value' },
  { ticker: 'XOM', name: 'Exxon Mobil', sector: 'Energy', qty: 26400, price: 132.05, weight: 4.4, dayPct: -1.42, pnl: -186300, agent: 'Value' },
  { ticker: 'UNH', name: 'UnitedHealth Grp', sector: 'Healthcare', qty: 5900, price: 402.8, weight: 3.9, dayPct: -2.31, pnl: -344700, agent: 'Value' },
  { ticker: 'ASML', name: 'ASML Holding', sector: 'Semis', qty: 2400, price: 1042.3, weight: 3.3, dayPct: 1.05, pnl: 268100, agent: 'Momentum' },
  { ticker: 'V', name: 'Visa Inc', sector: 'Financials', qty: 9800, price: 356.7, weight: 3.1, dayPct: 0.08, pnl: 96400, agent: 'Quality' },
  { ticker: 'CAT', name: 'Caterpillar Inc', sector: 'Industrials', qty: 4300, price: 468.9, weight: 2.4, dayPct: -0.34, pnl: 41200, agent: 'Value' },
];

/* ---------------- transactions ---------------- */

export type Txn = {
  id: string;
  time: string;
  side: 'BUY' | 'SELL';
  ticker: string;
  qty: number;
  price: number;
  agent: string;
  status: 'Filled' | 'Partial' | 'Pending' | 'Blocked';
};

export const TXNS: Txn[] = [
  { id: 'T-90412', time: '14:32:08', side: 'BUY', ticker: 'TSM', qty: 4200, price: 241.4, agent: 'Momentum', status: 'Filled' },
  { id: 'T-90411', time: '14:18:51', side: 'SELL', ticker: 'UNH', qty: 1800, price: 403.6, agent: 'Risk', status: 'Filled' },
  { id: 'T-90409', time: '13:54:12', side: 'BUY', ticker: 'NVDA', qty: 900, price: 183.05, agent: 'Momentum', status: 'Partial' },
  { id: 'T-90404', time: '13:11:44', side: 'SELL', ticker: 'XOM', qty: 6400, price: 133.2, agent: 'Value', status: 'Filled' },
  { id: 'T-90398', time: '12:40:27', side: 'BUY', ticker: 'ASML', qty: 600, price: 1038.9, agent: 'Momentum', status: 'Pending' },
  { id: 'T-90391', time: '11:22:03', side: 'BUY', ticker: 'PLTR', qty: 12000, price: 74.8, agent: 'Momentum', status: 'Blocked' },
  { id: 'T-90387', time: '10:47:19', side: 'SELL', ticker: 'CAT', qty: 1100, price: 470.2, agent: 'Value', status: 'Filled' },
  { id: 'T-90380', time: '09:58:36', side: 'BUY', ticker: 'JPM', qty: 3300, price: 287.1, agent: 'Value', status: 'Filled' },
];

/* ---------------- monitor ---------------- */

export type Monitor = {
  name: string;
  agent: string;
  value: string;
  limit: string;
  pct: number;
  state: 'ok' | 'warn' | 'breach';
};

export const MONITORS: Monitor[] = [
  { name: 'Gross exposure', agent: 'Risk', value: '138%', limit: '150%', pct: 92, state: 'warn' },
  { name: 'Single-name cap', agent: 'Risk', value: '9.4%', limit: '10%', pct: 94, state: 'warn' },
  { name: 'Sector cap, semis', agent: 'Risk', value: '21.3%', limit: '20%', pct: 106, state: 'breach' },
  { name: '1-day VaR (99%)', agent: 'Risk', value: '$2.1M', limit: '$3.0M', pct: 70, state: 'ok' },
  { name: 'Cash buffer', agent: 'Treasury', value: '6.2%', limit: '5% floor', pct: 41, state: 'ok' },
  { name: 'Tracking error', agent: 'Risk', value: '4.8%', limit: '6.0%', pct: 80, state: 'ok' },
  { name: 'Restricted list hits', agent: 'Compliance', value: '1', limit: '0', pct: 100, state: 'breach' },
];

/* ---------------- allocation ---------------- */

export type Slice = { label: string; pct: number; delta: number; tone: string };

export const ALLOCATION: Slice[] = [
  { label: 'Semiconductors', pct: 21.3, delta: 2.4, tone: '#111213' },
  { label: 'Software', pct: 17.8, delta: 0.6, tone: '#3d4247' },
  { label: 'Financials', pct: 14.2, delta: -0.9, tone: '#63696f' },
  { label: 'Healthcare', pct: 12.9, delta: -1.8, tone: '#878d93' },
  { label: 'Industrials', pct: 10.4, delta: 0.2, tone: '#a8adb2' },
  { label: 'Energy', pct: 8.6, delta: -1.1, tone: '#c4c8cc' },
  { label: 'Consumer', pct: 8.6, delta: 0.4, tone: '#dcdfe1' },
  { label: 'Cash', pct: 6.2, delta: 0.2, tone: '#eef0f1' },
];


/* ---------------- watchlist ---------------- */

export type Watch = {
  ticker: string;
  name: string;
  price: number;
  pct: number;
  note: string;
  spark: number[];
};

function spark(seed: number, up: boolean): number[] {
  return series(56, 100, up ? 0.0018 : -0.0014, 0.019, seed);
}

export const WATCHLIST: Watch[] = [
  { ticker: 'VRT', name: 'Vertiv Holdings', price: 148.32, pct: 3.42, note: 'Research memo pending', spark: spark(3, true) },
  { ticker: 'AVGO', name: 'Broadcom Inc', price: 361.05, pct: 1.88, note: 'Blocked by semis cap', spark: spark(11, true) },
  { ticker: 'PLTR', name: 'Palantir Tech', price: 74.61, pct: -1.24, note: 'Restricted', spark: spark(27, false) },
  { ticker: 'NEE', name: 'NextEra Energy', price: 82.44, pct: 0.51, note: 'Watching the rate path', spark: spark(41, true) },
  { ticker: 'CRWD', name: 'CrowdStrike', price: 428.9, pct: -0.77, note: 'Valuation screen fail', spark: spark(57, false) },
  { ticker: 'DE', name: 'Deere & Co', price: 512.18, pct: 0.94, note: 'Value candidate', spark: spark(69, true) },
  { ticker: 'SHEL', name: 'Shell plc', price: 71.26, pct: -1.61, note: 'Pair against XOM', spark: spark(83, false) },
];

/* ---------------- header ---------------- */

export const NAV = {
  value: 128430000,
  dayPct: 0.84,
  dayAbs: 1070000,
  ytdPct: 12.41,
};

/* ---------------- comparison series ---------------- */

export type Book = { id: string; label: string; sub: string };

export const BOOKS: Book[] = [
  { id: 'total', label: 'Portfolio', sub: 'Total fund' },
  { id: 'excash', label: 'Portfolio ex-cash', sub: 'Invested only' },
  { id: 'momentum', label: 'Momentum sleeve', sub: '34.2% of NAV' },
  { id: 'quality', label: 'Quality sleeve', sub: '26.4% of NAV' },
  { id: 'value', label: 'Value sleeve', sub: '21.7% of NAV' },
  { id: 'event', label: 'Event driven', sub: '11.5% of NAV' },
];

export type Comparand = { id: string; label: string; sub: string };

export const COMPARANDS: Comparand[] = [
  { id: 'SPX', label: 'S&P 500', sub: 'US large cap' },
  { id: 'NDX', label: 'Nasdaq 100', sub: 'US growth' },
  { id: 'RUT', label: 'Russell 2000', sub: 'US small cap' },
  { id: 'DJIA', label: 'Dow Jones', sub: 'US blue chip' },
  { id: 'SOXX', label: 'Semis index', sub: 'Sector' },
  { id: 'XLK', label: 'Technology', sub: 'Sector' },
  { id: 'XLF', label: 'Financials', sub: 'Sector' },
  { id: 'XLE', label: 'Energy', sub: 'Sector' },
  { id: 'XLV', label: 'Healthcare', sub: 'Sector' },
  { id: 'MSCI', label: 'MSCI World', sub: 'Global equity' },
  { id: 'EEM', label: 'EM equity', sub: 'Global equity' },
  { id: 'AGG', label: 'US aggregate', sub: 'Fixed income' },
  { id: 'GLD', label: 'Gold', sub: 'Commodity' },
  { id: 'BTC', label: 'Bitcoin', sub: 'Crypto' },
  { id: 'HFRI', label: 'HFRI equity hedge', sub: 'Peer group' },
  { id: 'VIX', label: 'Volatility index', sub: 'Derived' },
];

/* One-year return and walk character per series, scaled per range below. */
const CHAR: Record<string, [number, number, number]> = {
  //          1Y return   vol    seed
  total: [15.83, 0.0062, 88],
  excash: [16.91, 0.0064, 131],
  momentum: [24.4, 0.0102, 174],
  quality: [13.2, 0.0051, 219],
  value: [6.8, 0.0058, 262],
  event: [9.4, 0.0071, 307],
  SPX: [12.44, 0.0048, 401],
  NDX: [18.62, 0.0071, 447],
  RUT: [4.31, 0.0083, 492],
  DJIA: [8.14, 0.0042, 538],
  SOXX: [27.9, 0.0121, 583],
  XLK: [21.4, 0.0079, 629],
  XLF: [10.2, 0.0055, 674],
  XLE: [-3.6, 0.0094, 719],
  XLV: [2.8, 0.0051, 765],
  MSCI: [10.9, 0.0044, 810],
  EEM: [6.2, 0.0077, 856],
  AGG: [3.1, 0.0016, 901],
  GLD: [14.7, 0.0059, 947],
  BTC: [42.6, 0.0231, 992],
  HFRI: [7.9, 0.0033, 1038],
  VIX: [-11.4, 0.0298, 1083],
};

const SPAN: Record<Range, number> = {
  '1D': 0.004, '1W': 0.02, '1M': 0.083, '3M': 0.25, YTD: 0.67, '1Y': 1, ALL: 3.4,
};

/* Percent-change series for any book or comparand, rebased to zero at the
   start of the range so every line on the chart shares an origin. */
export function pctSeries(id: string, range: Range): Point[] {
  const [annual, vol, seed] = CHAR[id] ?? CHAR.SPX;
  const target = id === 'total' ? RETURN[range] : annual * SPAN[range];
  const n = SPEC[range][0];
  const raw = series(n, 100, 0, vol, seed + n);
  const corr = raw[n - 1] / raw[0];
  return raw.map((v, i) => {
    const drift = 1 + (target / 100) * (i / (n - 1));
    const shape = (v / raw[0]) * Math.pow(corr, -i / (n - 1));
    return { t: label(i, n, range), v: +((shape * drift - 1) * 100).toFixed(3) };
  });
}

/* ---------------- metric catalogue ---------------- */

export type MetricDef = {
  id: string;
  label: string;
  value: string;
  sub: string;
  tone?: 'up' | 'down' | 'warn';
  /* a figure with a record behind it. The number becomes a way in to the
     record rather than the end of it. */
  panel?: 'decisions';
};

export const METRICS: MetricDef[] = [
  { id: 'nav', label: 'Net asset value', value: '$128.43M', sub: '+12.41% YTD', tone: 'up' },
  { id: 'decisions', label: 'Decisions today', value: '8', sub: 'By the PM agent', panel: 'decisions' },
  { id: 'risk', label: 'Risk factor', value: '0.87', sub: 'Moderate beta' },
  { id: 'day', label: 'Day P/L', value: '+$1.07M', sub: '+0.84%', tone: 'up' },
  { id: 'cash', label: 'Cash', value: '6.2%', sub: '5% floor' },
  { id: 'gross', label: 'Gross exposure', value: '138%', sub: '150% cap' },
  { id: 'net', label: 'Net exposure', value: '62%', sub: 'Long biased' },
  { id: 'mtd', label: 'Month to date', value: '+3.12%', sub: 'Bench +1.94%', tone: 'up' },
  { id: 'sharpe', label: 'Sharpe', value: '1.24', sub: 'Trailing 1Y' },
  { id: 'sortino', label: 'Sortino', value: '1.87', sub: 'Trailing 1Y' },
  { id: 'alpha', label: 'Alpha', value: '+5.3%', sub: 'Vs S&P 500', tone: 'up' },
  { id: 'vol', label: 'Volatility', value: '14.2%', sub: 'Annualised' },
  { id: 'dd', label: 'Max drawdown', value: '-8.4%', sub: 'Since launch', tone: 'down' },
  { id: 'var', label: '1-day VaR', value: '$2.1M', sub: '99%, $3.0M cap' },
  { id: 'te', label: 'Tracking error', value: '4.8%', sub: '6.0% cap' },
  { id: 'turnover', label: 'Turnover', value: '41%', sub: 'Annualised' },
  { id: 'names', label: 'Names held', value: '38', sub: '10 core' },
];
