export type Template = {
  id: string;
  name: string;
  about: string;
  runtime: string;
};

export const TEMPLATES: Template[] = [
  {
    id: 'screening',
    name: 'Screening',
    about: 'Ranks a universe against the factor set you pick, keeps the top decile and writes the rejects to a file you can audit.',
    runtime: '~2 min',
  },
  {
    id: 'thesis',
    name: 'Thesis building',
    about: 'Turns a claim into a testable structure: the drivers, the evidence each one needs, and the observation that would break it.',
    runtime: '~6 min',
  },
  {
    id: 'counter',
    name: 'Counterargument',
    about: 'Argues the other side using only sources already attached to the idea, so the rebuttal is grounded rather than invented.',
    runtime: '~4 min',
  },
  {
    id: 'valuation',
    name: 'Valuation',
    about: 'Builds a multiple and a discounted cash flow bridge from segment history, then flexes the two inputs with the widest error bars.',
    runtime: '~8 min',
  },
  {
    id: 'scenario',
    name: 'Scenario analysis',
    about: 'Sweeps the two inputs you flag as uncertain across a three by three grid and reports the outcome at every corner.',
    runtime: '~5 min',
  },
  {
    id: 'sensitivity',
    name: 'Backlog sensitivity',
    about: 'Holds every input fixed except the disputed one, sweeps it across the reported range and reports the effect on the entry multiple.',
    runtime: '~8 min',
  },
  {
    id: 'peer',
    name: 'Peer comparison',
    about: 'Lines the name up against its listed peers on the handful of metrics that actually drive the thesis, not the full ratio sheet.',
    runtime: '~3 min',
  },
  {
    id: 'leadlag',
    name: 'Lead lag test',
    about: 'Tests whether one series leads another across prior cycles and reports the hit rate with each exception called out.',
    runtime: '~11 min',
  },
  {
    id: 'unit',
    name: 'Unit economics',
    about: 'Rebuilds revenue and cost per unit from disclosure, then flexes both against volume to find where the margin actually comes from.',
    runtime: '~7 min',
  },
  {
    id: 'positioning',
    name: 'Positioning check',
    about: 'Reads ownership, short interest and options skew to say how much of the thesis is already in the price.',
    runtime: '~4 min',
  },
];

/* Each idea gets one template the agent would reach for first. */
export const RECOMMENDED: Record<string, string> = {
  'i-vrt': 'sensitivity',
  'i-avgo': 'valuation',
  'i-nee': 'scenario',
  'i-de': 'leadlag',
  'i-shel': 'peer',
  'i-etn': 'unit',
  'i-pwr': 'thesis',
  'i-mu': 'counter',
  'i-gev': 'screening',
  'i-anet': 'positioning',
};
