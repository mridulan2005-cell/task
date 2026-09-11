import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

/* A section dragged out of a visualisation.

   Selecting a run of points is the chart's answer to highlighting a sentence:
   it names what you are pointing at so a question can be asked about it. The
   sections live above every surface rather than inside one chart, so a
   question can carry a stretch of the portfolio line and the same stretch of
   the risk line at once. */

export type Region = {
  id: string;
  /* the chart the section was dragged on */
  chart: string;
  /* the axis labels at each edge, and how many points sit between them */
  from: string;
  to: string;
  points: number;
  /* first and last index, kept so the band can be drawn back on the chart */
  a: number;
  b: number;
  /* where the band sits on screen, so the Ask AI chip can find it */
  anchor: { x: number; y: number };
};

type Store = {
  regions: Region[];
  add: (r: Omit<Region, 'id'>) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const Ctx = createContext<Store | null>(null);

let seq = 1;

export function RegionsProvider({ children }: { children: ReactNode }) {
  const [regions, setRegions] = useState<Region[]>([]);

  /* One section per chart: dragging again on the same chart replaces what was
     there, so the set never collects two overlapping answers to one question. */
  const add = useCallback((r: Omit<Region, 'id'>) => {
    setRegions((prev) => [...prev.filter((p) => p.chart !== r.chart), { ...r, id: `rg${seq++}` }]);
  }, []);

  const remove = useCallback((id: string) => setRegions((prev) => prev.filter((p) => p.id !== id)), []);
  const clear = useCallback(() => setRegions([]), []);

  const value = useMemo(() => ({ regions, add, remove, clear }), [regions, add, remove, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRegions(): Store {
  return useContext(Ctx) ?? { regions: [], add: () => {}, remove: () => {}, clear: () => {} };
}

/* How a section reads once it is tagged on a question. */
export function labelOf(r: Region): string {
  return `${r.chart} · ${r.from} – ${r.to}`;
}

export function quoteOf(regions: Region[]): string {
  return regions.map(labelOf).join('  ·  ');
}
