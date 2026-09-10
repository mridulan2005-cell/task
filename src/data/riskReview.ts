/* The escalation a risk test raised, and the maths behind the impact preview.

   Everything the officer sees on the review surface is recomputed from the
   trim on the slider, so a number never disagrees with the control that
   produced it. */

export const SHOCK = {
  ticker: 'NVDA',
  name: 'NVIDIA Corp',
  /* what the test caught */
  move: 4.2,
  direction: 'gain' as const,
  test: 'Single-day move vs. fitted distribution',
  raised: '09:41',
  weight: 6.4,
  notional: '$8.2M',
};

/* --- the fitted risk model, and where the book sits inside it --- */

export const MODEL = {
  /* daily vol the VaR model was fitted on */
  fittedSigma: 1.1,
  /* vol realised since the shock */
  realisedSigma: 5.4,
  /* 3-sigma days observed in the last sixty */
  tailDays: 3,
  window: 60,
  /* the same count the fitted normal would predict */
  expectedTailDays: 0.08,
};

export const LIMITS = {
  var: 1.25,
  te: 2.0,
  beta: [0.8, 1.0] as const,
  singleName: 5.0,
};

/* the agent's own proposal */
export const PROPOSED_TRIM = 40;

const BASE = {
  /* the book without the name, 1-day parametric */
  varOther: 0.6544,
  teOther: 0.742,
  rhoVar: 0.62,
  rhoTe: 0.44,
  nameSigma: 5.4,
  nameActive: 3.1,
  nameBeta: 1.9,
  bookBeta: 0.87,
};

/* two correlated risks add under the usual parametric form */
function combine(other: number, name: number, rho: number): number {
  return Math.sqrt(other * other + name * name + 2 * rho * other * name);
}

export type Impact = {
  trim: number;
  /* what leaves the book, as % of NAV and as cash */
  released: number;
  weight: number;
  var: number;
  te: number;
  beta: number;
};

export function impactOf(trim: number): Impact {
  const t = trim / 100;
  const weight = SHOCK.weight * (1 - t);
  const w = weight / 100;

  return {
    trim,
    released: SHOCK.weight * t,
    weight,
    var: combine(BASE.varOther, w * BASE.nameSigma, BASE.rhoVar),
    te: combine(BASE.teOther, w * BASE.nameActive, BASE.rhoTe),
    beta: BASE.bookBeta - (SHOCK.weight / 100) * t * BASE.nameBeta,
  };
}

/* the smallest trim that brings the name back inside the single-name cap */
export const CAP_TRIM = Math.ceil((1 - LIMITS.singleName / SHOCK.weight) * 100);

/* --- scenario replay --- */

export type Scenario = {
  id: string;
  label: string;
  sub: string;
  /* what the book and the name did, in %, under that regime */
  book: number;
  name: number;
  /* other holdings that move on the same factor */
  correlated: number;
};

export const SCENARIOS: Scenario[] = [
  { id: '2008', label: '2008 credit crisis', sub: 'Sep 2008 to Mar 2009', book: -18.4, name: -31.2, correlated: 5 },
  { id: '2020', label: '2020 liquidity shock', sub: 'Feb to Mar 2020', book: -12.1, name: -24.8, correlated: 4 },
  { id: 'rates', label: 'Rate spike, 100bp', sub: 'Parallel shift, one week', book: -5.6, name: -9.4, correlated: 2 },
  { id: 'repeat', label: 'Today repeated', sub: 'The shock runs five more sessions', book: 2.1, name: 4.2, correlated: 3 },
];

/* Trimming into cash takes the name's share of the move off the book. */
export function replay(s: Scenario, trim: number): number {
  return s.book - (SHOCK.weight / 100) * (trim / 100) * s.name;
}

/* --- is the model still valid? --- */

export type Validity = {
  sigmas: number;
  verdict: 'noise' | 'regime';
  headline: string;
  detail: string;
};

export function validity(): Validity {
  const sigmas = SHOCK.move / MODEL.fittedSigma;
  const regime = sigmas > 3 && MODEL.tailDays > 1;

  return {
    sigmas,
    verdict: regime ? 'regime' : 'noise',
    headline: regime ? 'Regime shift, outside the fitted envelope' : 'Normal market noise',
    detail: regime
      ? `The fitted model expects ${MODEL.expectedTailDays} days past three sigma in ${MODEL.window}. It has seen ${MODEL.tailDays}. Realised vol is ${MODEL.realisedSigma}% against the ${MODEL.fittedSigma}% it was fitted on, so the VaR figures above read as a floor, not an estimate.`
      : `The move sits inside the fitted distribution. Existing VaR and covariance estimates remain reliable and need no override.`,
  };
}

/* --- the audit trail --- */

export type AuditEntry = {
  id: string;
  time: string;
  actor: 'market' | 'agent' | 'officer' | 'system';
  text: string;
  /* stands in for the cryptographic timestamp the log carries */
  seal: string;
};

export const AUDIT_SEED: AuditEntry[] = [
  {
    id: 'a1',
    time: '09:38',
    actor: 'market',
    text: `${SHOCK.ticker} opened ${SHOCK.move}% above the prior close on volume ${'4.1x'} the twenty-day average.`,
    seal: '0x7f2a…c410',
  },
  {
    id: 'a2',
    time: '09:41',
    actor: 'system',
    text: `${SHOCK.test} fired. The move sits ${(SHOCK.move / MODEL.fittedSigma).toFixed(1)} sigma outside the fitted distribution.`,
    seal: '0x9d14…8ba2',
  },
  {
    id: 'a3',
    time: '09:43',
    actor: 'agent',
    text: `Risk agent recommended trimming ${PROPOSED_TRIM}% of the position and holding the proceeds in cash until the close.`,
    seal: '0x2c88…41ef',
  },
];

/* what the agents are allowed to do on their own, and why */
export const AUTONOMY = {
  level: 'Supervised',
  score: 92,
  note: 'Agents may act inside policy and must escalate anything that breaches a hard limit.',
};
