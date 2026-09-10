/* Edges are the platform's skills. They run from the plus menu or from a
   slash command typed straight into the composer. */
export type EdgeSkill = {
  id: string;
  name: string;
  /* what the copilot does when the edge is on, one line, shown on hover */
  hint: string;
};

export const EDGES: EdgeSkill[] = [
  { id: 'compare', name: 'Comparative analysis', hint: 'Sets the subject against its peers and the benchmark' },
  { id: 'counter', name: 'Counter-argument', hint: 'Argues the other side of the position on the table' },
  { id: 'gaps', name: 'Find gaps', hint: 'Names what the evidence does not cover yet' },
  { id: 'assumptions', name: 'Validate assumptions', hint: 'Tests each assumption the case rests on' },
  { id: 'trace', name: 'Trace to source', hint: 'Walks every number back to the filing or feed it came from' },
  { id: 'scenario', name: 'Scenario sweep', hint: 'Reruns the case across bear, base and bull' },
  { id: 'sensitivity', name: 'Sensitivity check', hint: 'Ranks the inputs the answer is most exposed to' },
];

export function matchEdges(query: string): EdgeSkill[] {
  const q = query.trim().toLowerCase();
  if (!q) return EDGES;
  return EDGES.filter((e) => e.name.toLowerCase().includes(q) || e.id.includes(q));
}
