/* What the research agents did today.

   The analyst's dashboard is not a book of positions; it is a record of
   reading. So the feed counts papers, filings and screens rather than weights
   and P/L, and the only number that matters at the top is how many ideas
   survived all of it. */

/* What kind of work a line was, which is the whole of what the glyph and its
   colour say. Reading, spotting, modelling, screening, analysing. */
export type ActKind = 'read' | 'spot' | 'model' | 'screen' | 'analyse' | 'summarise';

export type Activity = {
  id: string;
  /* when it landed, on the desk clock */
  time: string;
  kind: ActKind;
  text: string;
};

/* Newest first, the way a feed is read. */
export const ACTIVITY: Activity[] = [
  { id: 'a1', time: '07:58', kind: 'read', text: 'Read 12 new papers on AI infrastructure' },
  { id: 'a2', time: '07:45', kind: 'spot', text: 'Identified 3 new signals in Utilities' },
  { id: 'a3', time: '07:32', kind: 'model', text: 'Updated NVDA model after earnings call' },
  { id: 'a4', time: '06:21', kind: 'screen', text: 'Screened 1,200 companies for valuation anomalies' },
  { id: 'a5', time: '04:18', kind: 'analyse', text: 'Generated scenario analysis for Healthcare sector' },
  { id: 'a6', time: '02:05', kind: 'read', text: 'Monitored 50+ news sources (macro, policy, earnings)' },
  { id: 'a7', time: '01:12', kind: 'summarise', text: 'Summarized 8 analyst reports on CRWD' },
  { id: 'a8', time: '00:43', kind: 'spot', text: 'Found new catalyst for VRT (contract announcement)' },
];

/* Everything the agents went through to get there. The ideas card in the
   copilot reads this, so the two never claim different totals. */
export const SOURCES_SWEPT = 2316;
