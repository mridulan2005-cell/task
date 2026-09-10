/* Geometric Brownian Motion paths.

   Every path is driven by a seeded generator, so a redraw or a slider move
   reproduces the same walk instead of reshuffling the market underneath the
   reader. Shocks come from Box-Muller on that seeded stream. */

export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* Box-Muller: two uniforms in, one standard normal out. */
export function normals(n: number, seed: number): number[] {
  const u = rng(seed);
  const out: number[] = [];
  while (out.length < n) {
    const a = Math.max(u(), 1e-12);
    const b = u();
    const r = Math.sqrt(-2 * Math.log(a));
    out.push(r * Math.cos(2 * Math.PI * b));
    if (out.length < n) out.push(r * Math.sin(2 * Math.PI * b));
  }
  return out;
}

export const DT = 1 / 252;

/* price(t+1) = price(t) × (1 + mu·dt + sigma·√dt·z) */
export function gbm(start: number, mu: number, sigma: number, shocks: number[], dt = DT): number[] {
  const out = [start];
  const root = Math.sqrt(dt);
  for (let i = 0; i < shocks.length; i++) {
    const prev = out[out.length - 1];
    out.push(prev * (1 + mu * dt + sigma * root * shocks[i]));
  }
  return out;
}

/* Pins the final value on a declared return while keeping the walk's shape, so
   the chart and the figures printed elsewhere in the workspace agree. */
export function pin(path: number[], start: number, target: number): number[] {
  const want = start * (1 + target / 100);
  const factor = want / path[path.length - 1];
  const n = path.length - 1;
  return path.map((v, i) => v * Math.pow(factor, i / n));
}

/* A market shock shared by every series, plus one idiosyncratic shock each.
   The blend is corr·market + √(1-corr²)·own, so the lines move together
   without ever being the same line. */
export function correlated(marketShocks: number[], ownSeed: number, corr: number): number[] {
  const own = normals(marketShocks.length, ownSeed);
  const rest = Math.sqrt(Math.max(0, 1 - corr * corr));
  return marketShocks.map((m, i) => corr * m + rest * own[i]);
}

/* ---------------- workspace series ---------------- */

export type Character = { mu: number; sigma: number; corr: number; seed: number };

export const CHARACTER: Record<string, Character> = {
  total: { mu: 0.16, sigma: 0.142, corr: 0.88, seed: 1201 },
  excash: { mu: 0.17, sigma: 0.151, corr: 0.88, seed: 1301 },
  momentum: { mu: 0.24, sigma: 0.238, corr: 0.79, seed: 1401 },
  quality: { mu: 0.13, sigma: 0.118, corr: 0.91, seed: 1501 },
  value: { mu: 0.07, sigma: 0.134, corr: 0.83, seed: 1601 },
  event: { mu: 0.09, sigma: 0.164, corr: 0.55, seed: 1701 },

  SPX: { mu: 0.124, sigma: 0.148, corr: 0.99, seed: 2101 },
  NDX: { mu: 0.186, sigma: 0.204, corr: 0.95, seed: 2201 },
  RUT: { mu: 0.043, sigma: 0.221, corr: 0.87, seed: 2301 },
  DJIA: { mu: 0.081, sigma: 0.129, corr: 0.94, seed: 2401 },
  SOXX: { mu: 0.279, sigma: 0.318, corr: 0.86, seed: 2501 },
  XLK: { mu: 0.214, sigma: 0.216, corr: 0.93, seed: 2601 },
  XLF: { mu: 0.102, sigma: 0.181, corr: 0.88, seed: 2701 },
  XLE: { mu: -0.036, sigma: 0.264, corr: 0.51, seed: 2801 },
  XLV: { mu: 0.028, sigma: 0.147, corr: 0.72, seed: 2901 },
  MSCI: { mu: 0.109, sigma: 0.139, corr: 0.96, seed: 3001 },
  EEM: { mu: 0.062, sigma: 0.192, corr: 0.74, seed: 3101 },
  AGG: { mu: 0.031, sigma: 0.049, corr: 0.18, seed: 3201 },
  GLD: { mu: 0.147, sigma: 0.131, corr: 0.09, seed: 3301 },
  BTC: { mu: 0.426, sigma: 0.602, corr: 0.41, seed: 3401 },
  HFRI: { mu: 0.079, sigma: 0.071, corr: 0.81, seed: 3501 },
  VIX: { mu: -0.114, sigma: 0.842, corr: -0.72, seed: 3601 },
};

export const STEPS: Record<string, number> = {
  '1D': 78,
  '1W': 5,
  '1M': 21,
  '3M': 63,
  YTD: 176,
  '1Y': 252,
  ALL: 756,
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TODAY = new Date(2026, 8, 10);

export function labelsFor(range: string, n: number): string[] {
  const out: string[] = [];
  if (range === '1D') {
    for (let i = 0; i < n; i++) {
      const mins = 9 * 60 + 30 + Math.round((i / (n - 1)) * 390);
      const h = Math.floor(mins / 60);
      out.push(`${((h + 11) % 12) + 1}:${String(mins % 60).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`);
    }
    return out;
  }
  const days = range === 'ALL' ? 1096 : range === '1Y' ? 365 : range === 'YTD' ? 252 : range === '3M' ? 91 : range === '1M' ? 30 : 7;
  for (let i = 0; i < n; i++) {
    const d = new Date(TODAY);
    d.setDate(d.getDate() - Math.round((1 - i / (n - 1)) * days));
    out.push(range === 'ALL' || range === '1Y' ? `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}` : `${MONTHS[d.getMonth()]} ${d.getDate()}`);
  }
  return out;
}

/* One market, many series. Returns dollar paths that all start from the same
   opening value, which is the growth-of-NAV view a PM actually compares on. */
export function marketPaths(ids: string[], range: string, start: number, targets: Record<string, number>) {
  const n = STEPS[range] ?? 252;
  const market = normals(n, 7717 + n);
  return ids.map((id) => {
    const c = CHARACTER[id] ?? CHARACTER.SPX;
    const shocks = correlated(market, c.seed + n, c.corr);
    const raw = gbm(start, c.mu, c.sigma, shocks);
    return targets[id] === undefined ? raw : pin(raw, start, targets[id]);
  });
}
