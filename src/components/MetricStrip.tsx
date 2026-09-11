import { useState } from 'react';
import { METRICS } from '../data/fund';
import type { MetricDef } from '../data/fund';
import { ArrowOut, Pencil, Plus } from './Icons';
import Picker from './Picker';

const MAX = 6;

export default function MetricStrip({
  plain = false,
  metrics = METRICS,
  start = ['nav', 'risk', 'day', 'cash', 'decisions'],
  onPanel,
}: {
  plain?: boolean;
  /* the catalogue this desk picks from; a trader reads execution, not the book */
  metrics?: MetricDef[];
  start?: string[];
  /* a figure with a record behind it asks for the record to be opened */
  onPanel?: (panel: string) => void;
}) {
  const [shown, setShown] = useState(start);
  const [editing, setEditing] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  const free = metrics.filter((m) => !shown.includes(m.id));

  function swap(slot: number, id: string) {
    const next = [...shown];
    next[slot] = id;
    setShown(next);
    setEditing(null);
  }

  function drop(slot: number) {
    setShown(shown.filter((_, i) => i !== slot));
    setEditing(null);
  }

  return (
    <div className={`metrics ${plain ? 'is-plain' : ''}`}>
      {shown.map((id, slot) => {
        const m = metrics.find((x) => x.id === id)!;
        /* Colour the number only when it carries a sign of its own; a level
           like net asset value stays neutral and tints its subline instead. */
        const signed = /^[+-]/.test(m.value);
        return (
          <div className={`metric ${editing === slot ? 'is-open' : ''}`} key={id}>
            <span className="metric-k">{m.label}</span>

            {/* A count of things that happened is a way into them. A level is
                not, so only the ones with a record behind them open. */}
            {m.panel ? (
              <button className="metric-open" onClick={() => onPanel?.(m.panel!)}>
                <span className={`metric-v ${signed ? m.tone ?? '' : ''}`}>{m.value}</span>
                <span className={`metric-s ${signed ? '' : m.tone ?? ''}`}>
                  {m.sub}
                  <ArrowOut size={11} />
                </span>
              </button>
            ) : (
              <>
                <span className={`metric-v ${signed ? m.tone ?? '' : ''}`}>{m.value}</span>
                <span className={`metric-s ${signed ? '' : m.tone ?? ''}`}>{m.sub}</span>
              </>
            )}

            <button className="metric-edit" onClick={() => setEditing(editing === slot ? null : slot)} title={`Replace ${m.label}`}>
              <Pencil size={13} />
            </button>

            {editing === slot && (
              <Picker
                items={free.map((f) => ({ id: f.id, label: f.label, sub: f.value }))}
                active={id}
                placeholder="Search metrics"
                footer={shown.length > 1 ? { label: 'Remove this metric', onPick: () => drop(slot) } : undefined}
                onPick={(pickId) => swap(slot, pickId)}
                onClose={() => setEditing(null)}
              />
            )}
          </div>
        );
      })}

      {shown.length < MAX && (
        <div className={`metric-add-wrap ${adding ? 'is-open' : ''}`}>
          <button className="metric-add" onClick={() => setAdding(!adding)} title="Add a metric">
            <Plus size={16} />
          </button>
          {adding && (
            <Picker
              items={free.map((f) => ({ id: f.id, label: f.label, sub: f.value }))}
              placeholder="Search metrics"
              onPick={(id) => {
                setShown([...shown, id]);
                setAdding(false);
              }}
              onClose={() => setAdding(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
