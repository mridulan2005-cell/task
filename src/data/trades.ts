/* The desk's own numbers and the blotter behind them. Almost everything on
   this surface was worked by an agent; the trader reads it and steps in. */

import type { MetricDef } from './fund';

export const TRADE_METRICS: MetricDef[] = [
  { id: 'filled', label: 'Filled today', value: '$41.2M', sub: '38 of 44 orders', tone: 'up' },
  { id: 'slip', label: 'Slippage', value: '2.4bp', sub: 'Against arrival', tone: 'up' },
  { id: 'working', label: 'Working', value: '6', sub: '$8.9M left to fill' },
  { id: 'auto', label: 'Worked by agents', value: '94%', sub: '6% touched by hand' },
  { id: 'part', label: 'Participation', value: '11.8%', sub: '15% ceiling' },
  { id: 'venues', label: 'Venues', value: '7', sub: 'Two dark, five lit' },
  { id: 'spread', label: 'Spread paid', value: '3.1bp', sub: 'Median across fills' },
  { id: 'reverts', label: 'Reversion', value: '-0.4bp', sub: '5 min after fill', tone: 'up' },
];

export type TradeState = 'filled' | 'working' | 'held';

export type Trade = {
  id: string;
  time: string;
  side: 'Buy' | 'Sell';
  ticker: string;
  name: string;
  qty: string;
  price: string;
  notional: string;
  /* how much of the parent order is done */
  done: number;
  state: TradeState;
  /* who worked it, and the one line worth reading */
  by: string;
  note: string;
};

export const RECENT_TRADES: Trade[] = [
  {
    id: 'T-90412',
    time: '14:32',
    side: 'Sell',
    ticker: 'AVGO',
    name: 'Broadcom Inc',
    qty: '148,800',
    price: '361.05',
    notional: '$53.7M',
    done: 62,
    state: 'working',
    by: 'Execution agent',
    note: 'Behind its participation band for eleven minutes.',
  },
  {
    id: 'T-90408',
    time: '14:11',
    side: 'Buy',
    ticker: 'LLY',
    name: 'Eli Lilly & Co',
    qty: '6,200',
    price: '894.15',
    notional: '$5.5M',
    done: 100,
    state: 'filled',
    by: 'Execution agent',
    note: 'Finished 1.8bp inside arrival on seven venues.',
  },
  {
    id: 'T-90401',
    time: '13:47',
    side: 'Sell',
    ticker: 'NVDA',
    name: 'NVIDIA Corp',
    qty: '9,900',
    price: '184.22',
    notional: '$1.8M',
    done: 0,
    state: 'held',
    by: 'You',
    note: 'Risk approved the trim. Waiting on your release.',
  },
  {
    id: 'T-90396',
    time: '13:02',
    side: 'Buy',
    ticker: 'TSM',
    name: 'Taiwan Semi ADR',
    qty: '32,800',
    price: '241.90',
    notional: '$7.9M',
    done: 100,
    state: 'filled',
    by: 'Execution agent',
    note: 'Crossed 40% of it in the dark at the midpoint.',
  },
  {
    id: 'T-90390',
    time: '11:54',
    side: 'Buy',
    ticker: 'JPM',
    name: 'JPMorgan Chase',
    qty: '14,700',
    price: '288.40',
    notional: '$4.2M',
    done: 100,
    state: 'filled',
    by: 'Execution agent',
    note: 'Filled ahead of schedule as the spread tightened.',
  },
  {
    id: 'T-90385',
    time: '10:38',
    side: 'Sell',
    ticker: 'XOM',
    name: 'Exxon Mobil',
    qty: '26,400',
    price: '132.05',
    notional: '$3.5M',
    done: 84,
    state: 'working',
    by: 'Execution agent',
    note: 'Paused twice on the volume guard, back inside band.',
  },
  {
    id: 'T-90377',
    time: '09:51',
    side: 'Buy',
    ticker: 'VRT',
    name: 'Vertiv Holdings',
    qty: '21,300',
    price: '148.32',
    notional: '$3.2M',
    done: 100,
    state: 'filled',
    by: 'Execution agent',
    note: 'Opened the starter position over forty minutes.',
  },
];
