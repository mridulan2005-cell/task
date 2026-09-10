/* The bench the risk officer tests on. Same shape as the analyst's models so
   the surface is identical; only the models and the parameters are risk ones.

   Each model computes its measure directly from the parameters, and the chart
   is scaled to land on that number, so the line and the readout never
   disagree. */

import { modelPath } from './testbox';
import type { ModelRange, Param, TestModel } from './testbox';
import { LIMITS, SHOCK, impactOf } from './riskReview';

export type { ModelRange, Param } from './testbox';
export { MODEL_RANGES } from './testbox';

export type RiskModel = TestModel & {
  /* what the chart is measuring, and how to print it */
  measure: string;
  unit: string;
  dp: number;
  /* the limit this measure is tested against, if it has one */
  limit?: number;
  /* higher is worse for every measure here except where noted */
  level: (v: Record<string, number>) => number;
};

/* z-scores for the confidence levels the VaR model offers */
function z(conf: number): number {
  if (conf >= 99.5) return 2.576;
  if (conf >= 99) return 2.326;
  if (conf >= 97.5) return 1.96;
  return 1.645;
}

export const RISK_MODELS: RiskModel[] = [
  {
    id: 'var',
    name: 'VaR sensitivity',
    on: SHOCK.ticker,
    summary: 'Sweeps the trim through 1-day parametric VaR.',
    measure: 'Portfolio VaR',
    unit: '%',
    dp: 2,
    limit: LIMITS.var,
    baseDrift: 0.4,
    vol: 0.35,
    seed: 23,
    params: [
      { id: 'trim', label: 'Trim', unit: '%', min: 0, max: 60, step: 1, def: 40, coef: -1.5 },
      { id: 'conf', label: 'Confidence', unit: '%', min: 95, max: 99.5, step: 0.5, def: 99, coef: 0.9 },
      { id: 'lookback', label: 'Lookback', unit: 'd', min: 60, max: 500, step: 20, def: 250, coef: -0.4 },
    ],
    extra: [
      { id: 'decay', label: 'Decay factor', unit: '', min: 0.9, max: 0.99, step: 0.01, def: 0.97, coef: 0.6 },
      { id: 'floor', label: 'Vol floor', unit: '%', min: 0, max: 2, step: 0.1, def: 0.8, coef: 0.5 },
    ],
    level: (v) => {
      const raw = impactOf(v.trim ?? 40).var;
      const conf = z(v.conf ?? 99) / z(99);
      const look = 1 + (250 - (v.lookback ?? 250)) / 250 * 0.06;
      return raw * conf * look;
    },
    line: (v) =>
      `A ${(v.trim ?? 40).toFixed(0)}% trim at ${(v.conf ?? 99).toFixed(1)}% confidence puts 1-day VaR at ${(
        impactOf(v.trim ?? 40).var *
        (z(v.conf ?? 99) / z(99)) *
        (1 + (250 - (v.lookback ?? 250)) / 250 * 0.06)
      ).toFixed(2)}% against a ${LIMITS.var}% limit.`,
  },
  {
    id: 'cov',
    name: 'Factor covariance',
    on: 'Book',
    summary: 'Rebuilds the covariance matrix under a correlation shift.',
    measure: 'Portfolio vol',
    unit: '%',
    dp: 2,
    baseDrift: 0.55,
    vol: 0.42,
    seed: 41,
    params: [
      { id: 'shift', label: 'Correlation shift', unit: '', min: -0.3, max: 0.6, step: 0.05, def: 0.15, coef: 1.4 },
      { id: 'shrink', label: 'Shrinkage', unit: '', min: 0, max: 0.6, step: 0.05, def: 0.2, coef: -0.8 },
      { id: 'factors', label: 'Factors', unit: '', min: 5, max: 40, step: 1, def: 18, coef: -0.5 },
    ],
    extra: [
      { id: 'half', label: 'Half-life', unit: 'd', min: 20, max: 180, step: 10, def: 60, coef: -0.4 },
      { id: 'tilt', label: 'Sector tilt', unit: 'pts', min: 0, max: 8, step: 0.5, def: 2, coef: 0.7 },
    ],
    level: (v) =>
      1.42 * Math.sqrt(1 + (v.shift ?? 0.15) * 0.9) * (1 - (v.shrink ?? 0.2) * 0.25) * (1 + (18 - (v.factors ?? 18)) / 18 * 0.05),
    line: (v) =>
      `Shifting pairwise correlation by ${(v.shift ?? 0.15).toFixed(2)} across ${(v.factors ?? 18).toFixed(0)} factors takes book vol to ${(
        1.42 *
        Math.sqrt(1 + (v.shift ?? 0.15) * 0.9) *
        (1 - (v.shrink ?? 0.2) * 0.25) *
        (1 + (18 - (v.factors ?? 18)) / 18 * 0.05)
      ).toFixed(2)}%. Diversification thins out as the shift rises.`,
  },
  {
    id: 'stress',
    name: 'Stress replay',
    on: 'Book',
    summary: 'Replays the book against a shock of your own size.',
    measure: 'Peak drawdown',
    unit: '%',
    dp: 1,
    baseDrift: -0.7,
    vol: 0.6,
    seed: 59,
    params: [
      { id: 'shock', label: 'Shock size', unit: 'σ', min: 1, max: 6, step: 0.2, def: 3.8, coef: 1.6 },
      { id: 'haircut', label: 'Liquidity haircut', unit: '%', min: 0, max: 25, step: 1, def: 8, coef: 1.0 },
      { id: 'recovery', label: 'Recovery', unit: 'd', min: 5, max: 120, step: 5, def: 40, coef: -0.6 },
    ],
    extra: [
      { id: 'contagion', label: 'Contagion', unit: 'names', min: 0, max: 12, step: 1, def: 4, coef: 0.9 },
      { id: 'funding', label: 'Funding spread', unit: 'bp', min: 0, max: 300, step: 10, def: 60, coef: 0.7 },
    ],
    level: (v) =>
      12.1 * ((v.shock ?? 3.8) / 3.8) * (1 + (v.haircut ?? 8) / 100 * 1.4) * (1 + (40 - (v.recovery ?? 40)) / 400),
    line: (v) =>
      `A ${(v.shock ?? 3.8).toFixed(1)} sigma shock with a ${(v.haircut ?? 8).toFixed(0)}% liquidity haircut draws the book down ${(
        12.1 *
        ((v.shock ?? 3.8) / 3.8) *
        (1 + (v.haircut ?? 8) / 100 * 1.4) *
        (1 + (40 - (v.recovery ?? 40)) / 400)
      ).toFixed(1)}% at the trough.`,
  },
  {
    id: 'conc',
    name: 'Concentration limits',
    on: SHOCK.ticker,
    summary: 'Enforces the single-name cap inside a turnover budget.',
    measure: `${SHOCK.ticker} weight`,
    unit: '%',
    dp: 2,
    limit: LIMITS.singleName,
    baseDrift: 0.3,
    vol: 0.28,
    seed: 71,
    params: [
      { id: 'cap', label: 'Single-name cap', unit: '%', min: 3, max: 10, step: 0.5, def: 5, coef: 1.2 },
      { id: 'band', label: 'Rebalance band', unit: 'pts', min: 0, max: 2, step: 0.1, def: 0.5, coef: 0.8 },
      { id: 'turnover', label: 'Turnover budget', unit: '%', min: 5, max: 40, step: 1, def: 15, coef: -1.1 },
    ],
    extra: [
      { id: 'lots', label: 'Tax-lot age', unit: 'mo', min: 0, max: 24, step: 1, def: 14, coef: 0.5 },
      { id: 'sector', label: 'Sector cap', unit: '%', min: 15, max: 35, step: 1, def: 25, coef: 0.4 },
    ],
    level: (v) =>
      Math.max(Math.min(SHOCK.weight, (v.cap ?? 5) + (v.band ?? 0.5)), SHOCK.weight * (1 - (v.turnover ?? 15) / 100)),
    line: (v) =>
      `A ${(v.cap ?? 5).toFixed(1)}% cap with a ${(v.band ?? 0.5).toFixed(1)} point band settles ${SHOCK.ticker} at ${Math.max(
        Math.min(SHOCK.weight, (v.cap ?? 5) + (v.band ?? 0.5)),
        SHOCK.weight * (1 - (v.turnover ?? 15) / 100),
      ).toFixed(2)}% of NAV. The turnover budget binds before the cap does.`,
  },
];

/* The chart is the model's own walk, scaled so it ends on the level the
   parameters actually imply. */
export function riskPath(m: RiskModel, params: Param[], values: Record<string, number>, range: ModelRange): number[] {
  const path = modelPath(m, params, values, range);
  const end = path[path.length - 1];
  const k = m.level(values) / end;
  return path.map((p) => p * k);
}

/* --- what the bench proposes once the officer is satisfied --- */

export type Ticket = {
  side: 'Sell' | 'Buy';
  ticker: string;
  trim: number;
  notional: string;
  participation: number;
  varBefore: number;
  varAfter: number;
  weightBefore: number;
  weightAfter: number;
  breaches: string[];
};

export function ticketFrom(values: Record<string, Record<string, number>>): Ticket {
  const v = values.var ?? {};
  const c = values.conc ?? {};
  const trim = v.trim ?? 40;
  const varAfter = RISK_MODELS[0].level(v);
  const weightAfter = RISK_MODELS[3].level(c);

  const breaches: string[] = [];
  if (varAfter > LIMITS.var) breaches.push(`VaR ${varAfter.toFixed(2)}% over the ${LIMITS.var}% limit`);
  if (weightAfter > LIMITS.singleName) breaches.push(`${SHOCK.ticker} ${weightAfter.toFixed(2)}% over the ${LIMITS.singleName}% cap`);

  return {
    side: 'Sell',
    ticker: SHOCK.ticker,
    trim,
    notional: `$${((8.2 * trim) / 100).toFixed(1)}M`,
    participation: c.turnover ?? 15,
    varBefore: impactOf(0).var,
    varAfter,
    weightBefore: SHOCK.weight,
    weightAfter,
    breaches,
  };
}

/* --- the summary anyone can read --- */

export function summaryFrom(on: string[], values: Record<string, Record<string, number>>): string[] {
  const t = ticketFrom(values);
  const ran = RISK_MODELS.filter((m) => on.includes(m.id));
  const stress = values.stress ?? {};
  const cov = values.cov ?? {};

  const out: string[] = [];

  out.push(
    `${SHOCK.ticker} rose ${SHOCK.move}% in a single session on ${'11 September 2026'}. That is far outside what our risk model was built to expect, and it left the holding at ${SHOCK.weight}% of the fund against an internal ceiling of ${LIMITS.singleName}%. The risk desk was asked to decide what to do about it.`,
  );

  out.push(
    `We tested ${ran.length} model${ran.length === 1 ? '' : 's'} on the bench before proposing anything: ${ran
      .map((m) => m.name)
      .join(', ')}. Each one was run at several settings rather than accepted as it came.`,
  );

  out.push(
    `The headline result is that selling ${t.trim}% of the holding brings the fund's one-day loss estimate from ${t.varBefore.toFixed(
      2,
    )}% to ${t.varAfter.toFixed(2)}% of its value, and takes ${SHOCK.ticker} from ${t.weightBefore.toFixed(
      1,
    )}% down to ${t.weightAfter.toFixed(2)}% of the fund. In plain terms, on a bad day the fund would expect to lose about ${(
      t.varAfter * 10
    ).toFixed(1)} basis points less than it would today.`,
  );

  if (on.includes('stress'))
    out.push(
      `We also replayed the fund against a ${(stress.shock ?? 3.8).toFixed(1)} sigma shock, allowing ${(stress.haircut ?? 8).toFixed(
        0,
      )}% for not being able to sell quickly. Under that replay the fund draws down about ${RISK_MODELS[2]
        .level(stress)
        .toFixed(1)}% at its worst point. This is a scenario, not a forecast.`,
    );

  if (on.includes('cov'))
    out.push(
      `A second test asked what happens if holdings start moving together more than they have. Shifting that relationship by ${(
        cov.shift ?? 0.15
      ).toFixed(2)} lifts the fund's overall volatility to ${RISK_MODELS[1].level(cov).toFixed(2)}%. The benefit of holding many names shrinks when everything moves at once.`,
    );

  out.push(
    t.breaches.length
      ? `One thing is still outside policy: ${t.breaches.join(' and ')}. The trade below does not fully resolve it and should not go out as written.`
      : `Every limit we test against is satisfied after the trade. Nothing further is outstanding.`,
  );

  out.push(
    `Proposed trade: sell ${t.trim}% of ${SHOCK.ticker}, roughly ${t.notional}, worked at no more than ${t.participation}% of the day's trading volume so the sale does not move the price against us. Proceeds sit in cash until the close.`,
  );

  return out;
}
