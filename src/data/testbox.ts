import { DT, gbm, normals, pin } from './gbm';

export type Param = {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  def: number;
  /* how strongly this parameter pushes the modelled outcome */
  coef: number;
};

export type TestModel = {
  id: string;
  name: string;
  on: string;
  summary: string;
  baseDrift: number;
  vol: number;
  seed: number;
  params: Param[];
  extra: Param[];
  /* the one line this model contributes to the report */
  line: (v: Record<string, number>) => string;
};


export const MODELS: TestModel[] = [
  {
    id: 'backlog',
    name: 'Backlog sensitivity',
    on: 'VRT',
    summary: 'Sweeps the disputed backlog figure through to the entry multiple.',
    baseDrift: 0.9,
    vol: 0.5,
    seed: 11,
    params: [
      { id: 'backlog', label: 'Backlog', unit: '$B', min: 6.5, max: 7.8, step: 0.1, def: 6.9, coef: 1.6 },
      { id: 'growth', label: 'Order growth', unit: '%', min: 2, max: 20, step: 0.5, def: 11, coef: 1.1 },
      { id: 'multiple', label: 'Exit multiple', unit: 'x', min: 12, max: 28, step: 0.5, def: 18.5, coef: 0.7 },
    ],
    extra: [
      { id: 'margin', label: 'Gross margin', unit: '%', min: 28, max: 42, step: 0.5, def: 35, coef: 0.9 },
      { id: 'convert', label: 'Conversion lag', unit: 'qtr', min: 0, max: 4, step: 1, def: 1, coef: -0.8 },
      { id: 'share', label: 'Share gain', unit: 'pts', min: -2, max: 6, step: 0.5, def: 1, coef: 0.6 },
    ],
    line: (v) =>
      `At a $${v.backlog?.toFixed(1)}B backlog and ${v.growth?.toFixed(1)}% order growth, the entry clears at ${v.multiple?.toFixed(1)}x. The gap to the current price is ${(((v.backlog - 6.9) * 9 + (v.growth - 11) * 1.4 + 11) as number).toFixed(0)}%.`,
  },
  {
    id: 'margin',
    name: 'Margin bridge',
    on: 'AVGO',
    summary: 'Runs the custom silicon mix shift through to gross margin.',
    baseDrift: 0.6,
    vol: 0.4,
    seed: 17,
    params: [
      { id: 'mix', label: 'Custom mix', unit: '%', min: 15, max: 35, step: 1, def: 25, coef: 1.4 },
      { id: 'price', label: 'Pricing', unit: '%', min: -3, max: 6, step: 0.5, def: 1.5, coef: 1 },
      { id: 'opex', label: 'Opex growth', unit: '%', min: 0, max: 12, step: 0.5, def: 6, coef: -0.9 },
    ],
    extra: [
      { id: 'yield', label: 'Wafer yield', unit: '%', min: 70, max: 95, step: 1, def: 86, coef: 0.7 },
      { id: 'mix2', label: 'Second customer', unit: '%', min: 0, max: 40, step: 5, def: 0, coef: -1.2 },
    ],
    line: (v) =>
      `Mix at ${v.mix?.toFixed(0)}% with ${v.price?.toFixed(1)}% pricing puts gross margin ${(((v.mix - 25) * 0.03 + (v.price - 1.5) * 0.12 + 0.9) as number).toFixed(2)} points above the consensus bridge.`,
  },
  {
    id: 'leadlag',
    name: 'Lead lag, credit weighted',
    on: 'DE',
    summary: 'Tests whether dealer inventory leads orders once credit cycles are weighted up.',
    baseDrift: 0.4,
    vol: 0.7,
    seed: 26,
    params: [
      { id: 'lead', label: 'Lead', unit: 'qtr', min: 1, max: 4, step: 1, def: 2, coef: 0.9 },
      { id: 'credit', label: 'Credit weight', unit: '%', min: 0, max: 100, step: 5, def: 35, coef: -1.1 },
    ],
    extra: [
      { id: 'regions', label: 'Regions included', unit: '', min: 2, max: 5, step: 1, def: 4, coef: 0.5 },
      { id: 'window', label: 'Sample window', unit: 'yr', min: 5, max: 25, step: 1, def: 15, coef: 0.4 },
    ],
    line: (v) =>
      `A ${v.lead?.toFixed(0)} quarter lead holds with credit weighted at ${v.credit?.toFixed(0)}%, giving a hit rate of ${((78 - (v.credit - 35) * 0.28) as number).toFixed(0)}% across the sample.`,
  },
  {
    id: 'meanrev',
    name: 'Mean reversion',
    on: 'SHEL / XOM',
    summary: 'Prices the refining spread pair against its historical band.',
    baseDrift: 0.2,
    vol: 0.9,
    seed: 92,
    params: [
      { id: 'halflife', label: 'Half life', unit: 'd', min: 5, max: 90, step: 5, def: 35, coef: -0.9 },
      { id: 'entry', label: 'Entry z', unit: 'σ', min: 0.5, max: 3, step: 0.1, def: 1.6, coef: 1.2 },
      { id: 'exit', label: 'Exit z', unit: 'σ', min: 0, max: 1.5, step: 0.1, def: 0.4, coef: -0.6 },
    ],
    extra: [
      { id: 'cost', label: 'Carry cost', unit: 'bps', min: 0, max: 40, step: 2, def: 14, coef: -1 },
      { id: 'cap', label: 'Position cap', unit: '%', min: 0.5, max: 4, step: 0.5, def: 2, coef: 0.5 },
    ],
    line: (v) =>
      `Entering at ${v.entry?.toFixed(1)}σ with a ${v.halflife?.toFixed(0)} day half life returns ${((v.entry - 1.6) * 4 + (35 - v.halflife) * 0.06 + 6.2).toFixed(1)}% annualised before carry.`,
  },
];

export function defaults(m: TestModel): Record<string, number> {
  const out: Record<string, number> = {};
  m.params.forEach((p) => (out[p.id] = p.def));
  return out;
}

/* Range switcher on every model chart. The walk is generated once at its
   longest span and then read from the tail, so switching range narrows the
   window on the same history instead of drawing a different one. */
export const MODEL_RANGES = ['1D', '5D', '3M', '1Y', '3Y', '5Y', 'Max'] as const;
export type ModelRange = (typeof MODEL_RANGES)[number];

const RANGE_STEPS: Record<ModelRange, number> = { '1D': 78, '5D': 5, '3M': 63, '1Y': 252, '3Y': 756, '5Y': 1260, Max: 2520 };
const RANGE_DAYS: Record<ModelRange, number> = { '1D': 1, '5D': 7, '3M': 91, '1Y': 365, '3Y': 1095, '5Y': 1825, Max: 3652 };
const MAX_STEPS = RANGE_STEPS.Max;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TODAY = new Date(2026, 8, 10);

function settings(m: TestModel, params: Param[], values: Record<string, number>) {
  let effect = 0;
  params.forEach((p) => {
    const v = values[p.id] ?? p.def;
    effect += p.coef * ((v - p.def) / (p.max - p.min));
  });
  return { mu: m.baseDrift * 0.18 + effect * 0.34, sigma: 0.08 + m.vol * 0.13 };
}

export function modelPath(m: TestModel, params: Param[], values: Record<string, number>, range: ModelRange = '1Y'): number[] {
  const { mu, sigma } = settings(m, params, values);
  const full = gbm(100, mu, sigma, normals(MAX_STEPS, m.seed * 7 + 13));

  /* A single session needs its own clock, so the intraday view is stepped at
     one seventy-eighth of a day and pinned to the close it belongs to. */
  if (range === '1D') {
    const open = full[full.length - 2];
    const intra = gbm(open, mu, sigma, normals(78, m.seed * 31 + 5), DT / 78);
    return pin(intra, open, (full[full.length - 1] / open - 1) * 100);
  }
  return full.slice(full.length - 1 - RANGE_STEPS[range]);
}

function stamp(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function windowOf(range: ModelRange): string {
  const from = new Date(TODAY);
  from.setDate(from.getDate() - RANGE_DAYS[range]);
  return range === '1D' ? `${stamp(TODAY)} &middot; 09:30 to 16:00` : `${stamp(from)} to ${stamp(TODAY)}`;
}

export function modelLabels(range: ModelRange = '1Y'): string[] {
  const n = range === '1D' ? 79 : RANGE_STEPS[range] + 1;
  if (range === '1D') {
    return Array.from({ length: n }, (_, i) => {
      const mins = 9 * 60 + 30 + Math.round((i / (n - 1)) * 390);
      const h = Math.floor(mins / 60);
      return `${((h + 11) % 12) + 1}:${String(mins % 60).padStart(2, '0')}`;
    });
  }
  const days = RANGE_DAYS[range];
  const long = days > 400;
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(TODAY);
    d.setDate(d.getDate() - Math.round((1 - i / (n - 1)) * days));
    return long ? `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}` : `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  });
}

export function outcome(m: TestModel, params: Param[], values: Record<string, number>, range: ModelRange = '1Y'): number {
  const p = modelPath(m, params, values, range);
  return (p[p.length - 1] / p[0] - 1) * 100;
}

export const FORMATS = [
  { id: 'memo', label: 'Model memo', sub: 'PDF, three pages' },
  { id: 'slides', label: 'Slide summary', sub: 'Six slides' },
  { id: 'doc', label: 'Shared doc', sub: 'Editable, commentable' },
  { id: 'notebook', label: 'Notebook export', sub: 'Code and outputs' },
];
